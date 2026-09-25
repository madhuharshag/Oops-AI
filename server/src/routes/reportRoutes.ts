import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/reports - List security reports
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reports = await db.reports.listByUser(req.user!.userId);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports - Generate a security report from an attack execution
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { attack_id } = req.body;
    if (!attack_id) {
      res.status(400).json({ error: 'attack_id is required' });
      return;
    }

    const attack = await db.attacks.findById(attack_id, req.user!.userId);
    if (!attack) {
      res.status(404).json({ error: 'Attack record not found.' });
      return;
    }

    const agent = await db.agents.findById(attack.agent_id, req.user!.userId);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }

    const lab = attack.lab_id ? await db.labs.findById(attack.lab_id) : null;

    // Check if there are other attacks for this agent to compute before/after
    const userAttacks = await db.attacks.listByUser(req.user!.userId, 50);
    const relatedReplays = userAttacks.filter(a => a.agent_id === agent.id && a.attack_type === attack.attack_type);

    const reportData = {
      title: `Security Assessment Report: ${agent.name} — ${attack.attack_type}`,
      generatedAt: new Date().toISOString(),
      agent: {
        id: agent.id,
        name: agent.name,
        purpose: agent.purpose,
        risk_level: agent.risk_level,
        data_sensitivity: agent.data_sensitivity,
        capabilities: agent.capabilities,
        available_tools: agent.available_tools,
      },
      attack: {
        id: attack.id,
        type: attack.attack_type,
        input: attack.attack_input,
        target_resource: attack.target_resource,
        outcome: attack.outcome,
        is_replay: attack.is_replay,
        risk_score: attack.risk_score,
        risk_level: attack.risk_level,
      },
      lab: lab ? { name: lab.name, threat_type: lab.threat_type, objective: lab.objective } : null,
      ai_findings: attack.ai_analysis,
      sensitive_data_findings: attack.sensitive_data_findings,
      policy_evaluation: attack.policy_evaluation,
      executiveSummary: attack.outcome === 'blocked'
        ? `The AI agent '${agent.name}' successfully withstood adversarial testing for ${attack.attack_type}. Outbound transmission was intercepted and blocked by active security policies.`
        : `CRITICAL FINDING: The AI agent '${agent.name}' was vulnerable to ${attack.attack_type}. Adversarial directives resulted in unrestricted downstream action and potential sensitive data exposure.`,
      recommendations: attack.ai_analysis?.recommendedMitigation || [
        'Enforce outbound egress data inspection policies.',
        'Isolate sensitive database queries behind human-in-the-loop approvals.',
        'Continuously replay security labs upon model update releases.'
      ],
      auditTimeline: attack.timeline,
      relatedTestsCount: relatedReplays.length
    };

    const report = await db.reports.create({
      user_id: req.user!.userId,
      attack_id: attack.id,
      agent_id: agent.id,
      report_data: reportData,
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id - Get specific security report details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const report = await db.reports.findById(id, req.user!.userId);
    if (!report) {
      res.status(404).json({ error: 'Security report not found.' });
      return;
    }
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

export default router;
