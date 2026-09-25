import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { AttackTriggerSchema } from '../validators';
import { executeControlledAttack } from '../services/attackEngine';

const router = Router();

router.use(requireAuth);

// GET /api/attacks - List user's attack simulations
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const attacks = await db.attacks.listByUser(req.user!.userId);
    res.json({ attacks });
  } catch (err) {
    next(err);
  }
});

// POST /api/attacks - Execute controlled attack simulation
router.post('/', aiRateLimiter, validateBody(AttackTriggerSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { agent_id, lab_id, attack_type, attack_input, target_resource } = req.body;

    // Verify agent belongs to this user
    const agent = await db.agents.findById(agent_id, req.user!.userId);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }

    const lab = lab_id ? await db.labs.findById(lab_id) : null;

    const attack = await executeControlledAttack({
      userId: req.user!.userId,
      agent,
      lab,
      attackType: attack_type,
      attackInput: attack_input,
      targetResource: target_resource,
      isReplay: false,
    });

    res.status(201).json({ attack });
  } catch (err) {
    next(err);
  }
});

// GET /api/attacks/:id - Get attack details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attack = await db.attacks.findById(id, req.user!.userId);
    if (!attack) {
      res.status(404).json({ error: 'Attack record not found.' });
      return;
    }

    const agent = await db.agents.findById(attack.agent_id, req.user!.userId);
    const lab = attack.lab_id ? await db.labs.findById(attack.lab_id) : null;

    res.json({ attack, agent, lab });
  } catch (err) {
    next(err);
  }
});

// POST /api/attacks/:id/replay - Replay original attack against active defenses
router.post('/:id/replay', aiRateLimiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const originalAttack = await db.attacks.findById(id, req.user!.userId);
    if (!originalAttack) {
      res.status(404).json({ error: 'Original attack record not found.' });
      return;
    }

    const agent = await db.agents.findById(originalAttack.agent_id, req.user!.userId);
    if (!agent) {
      res.status(404).json({ error: 'Agent associated with this attack was not found.' });
      return;
    }

    const lab = originalAttack.lab_id ? await db.labs.findById(originalAttack.lab_id) : null;

    const replayedAttack = await executeControlledAttack({
      userId: req.user!.userId,
      agent,
      lab,
      attackType: originalAttack.attack_type,
      attackInput: originalAttack.attack_input,
      targetResource: originalAttack.target_resource,
      isReplay: true,
    });

    // Provide structured before vs after comparison
    const comparison = {
      originalOutcome: originalAttack.outcome,
      replayedOutcome: replayedAttack.outcome,
      originalRiskScore: originalAttack.risk_score,
      replayedRiskScore: replayedAttack.risk_score,
      riskMitigated: originalAttack.risk_score - replayedAttack.risk_score,
      defendedSuccessfully: replayedAttack.outcome === 'blocked' && originalAttack.outcome !== 'blocked',
      originalSensitiveDataDetected: originalAttack.sensitive_data_findings?.detected || false,
      replayedSensitiveDataProtected: replayedAttack.outcome === 'blocked'
    };

    res.status(201).json({
      attack: replayedAttack,
      originalAttack,
      comparison,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
