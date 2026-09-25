import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/analytics/dashboard - Real aggregated metrics from user's database records
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const [agents, attacks, policies] = await Promise.all([
      db.agents.listByUser(userId),
      db.attacks.listByUser(userId, 100),
      db.policies.listByUser(userId),
    ]);

    const totalAgents = agents.length;
    const securityTests = attacks.length;
    const attacksBlocked = attacks.filter(a => a.outcome === 'blocked').length;
    const threatsDetected = attacks.filter(a => a.outcome !== 'blocked').length;
    const criticalRisks = attacks.filter(a => a.risk_level === 'critical').length;
    const sensitiveDataEvents = attacks.filter(a => a.sensitive_data_findings?.detected).length;

    // Recent events list
    const recentEvents = attacks.slice(0, 8).map(a => ({
      id: a.id,
      timestamp: a.created_at,
      agentId: a.agent_id,
      attackType: a.attack_type,
      outcome: a.outcome,
      riskLevel: a.risk_level,
      riskScore: a.risk_score,
      isReplay: a.is_replay,
      sensitiveData: a.sensitive_data_findings?.detected || false
    }));

    // Outcomes distribution
    const outcomeCounts = {
      blocked: attacks.filter(a => a.outcome === 'blocked').length,
      success: attacks.filter(a => a.outcome === 'success').length,
      requires_approval: attacks.filter(a => a.outcome === 'requires_approval').length,
      sanitized: attacks.filter(a => a.outcome === 'sanitized').length,
    };

    // Attacks by type distribution
    const typeMap: Record<string, number> = {};
    for (const a of attacks) {
      typeMap[a.attack_type] = (typeMap[a.attack_type] || 0) + 1;
    }
    const attacksByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    res.json({
      metrics: {
        totalAgents,
        securityTests,
        threatsDetected,
        attacksBlocked,
        criticalRisks,
        sensitiveDataEvents,
        activePolicies: policies.filter(p => p.active).length,
      },
      outcomeCounts,
      attacksByType,
      recentEvents,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics - Extended analytics charts
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const attacks = await db.attacks.listByUser(userId, 100);

    // Risk distribution
    const riskDistribution = {
      critical: attacks.filter(a => a.risk_level === 'critical').length,
      high: attacks.filter(a => a.risk_level === 'high').length,
      medium: attacks.filter(a => a.risk_level === 'medium').length,
      low: attacks.filter(a => a.risk_level === 'low').length,
    };

    // Sensitive data category frequency
    const sensitiveCategoryCounts: Record<string, number> = {};
    attacks.forEach(a => {
      const findings = a.sensitive_data_findings?.findings || [];
      findings.forEach((f: any) => {
        sensitiveCategoryCounts[f.type] = (sensitiveCategoryCounts[f.type] || 0) + f.count;
      });
    });

    res.json({
      totalSimulations: attacks.length,
      riskDistribution,
      sensitiveCategoryCounts,
      timelineTrends: attacks.slice(0, 15).map(a => ({
        id: a.id,
        date: new Date(a.created_at).toLocaleDateString(),
        riskScore: a.risk_score,
        outcome: a.outcome,
        attackType: a.attack_type
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;
