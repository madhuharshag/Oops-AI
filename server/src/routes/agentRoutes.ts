import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AgentSchema } from '../validators';

const router = Router();

router.use(requireAuth);

// GET /api/agents - List user's agents
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const agents = await db.agents.listByUser(req.user!.userId);
    res.json({ agents });
  } catch (err) {
    next(err);
  }
});

// POST /api/agents - Create agent
router.post('/', validateBody(AgentSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const agent = await db.agents.create({
      user_id: req.user!.userId,
      ...req.body
    });
    res.status(201).json({ agent });
  } catch (err) {
    next(err);
  }
});

// GET /api/agents/:id - Get agent details (Returns 404 if not found or unauthorized)
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const agent = await db.agents.findById(id, req.user!.userId);
    if (!agent) {
      // Return 404 to avoid confirming existence to unauthorized callers (Security Requirement §2, §10)
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }

    // Include recent attacks for this agent
    const allAttacks = await db.attacks.listByUser(req.user!.userId, 20);
    const agentAttacks = allAttacks.filter(a => a.agent_id === agent.id);

    res.json({ agent, recentAttacks: agentAttacks });
  } catch (err) {
    next(err);
  }
});

// PUT /api/agents/:id - Update agent (Returns 404 if not found or unauthorized)
router.put('/:id', validateBody(AgentSchema.partial()), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.agents.update(id, req.user!.userId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }
    res.json({ agent: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/agents/:id - Delete agent (Returns 404 if not found or unauthorized)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.agents.delete(id, req.user!.userId);
    if (!success) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }
    res.json({ message: 'Agent deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
