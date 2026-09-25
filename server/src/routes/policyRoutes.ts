import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { PolicySchema } from '../validators';

const router = Router();

router.use(requireAuth);

// GET /api/policies - List user's security policies
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const policies = await db.policies.listByUser(req.user!.userId);
    res.json({ policies });
  } catch (err) {
    next(err);
  }
});

// POST /api/policies - Create a new security policy
router.post('/', validateBody(PolicySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const policy = await db.policies.create({
      user_id: req.user!.userId,
      ...req.body
    });
    res.status(201).json({ policy });
  } catch (err) {
    next(err);
  }
});

// GET /api/policies/:id - Get policy details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const policy = await db.policies.findById(id, req.user!.userId);
    if (!policy) {
      res.status(404).json({ error: 'Policy not found.' });
      return;
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
});

// PUT /api/policies/:id - Update policy
router.put('/:id', validateBody(PolicySchema.partial()), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.policies.update(id, req.user!.userId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Policy not found.' });
      return;
    }
    res.json({ policy: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/policies/:id - Delete policy
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.policies.delete(id, req.user!.userId);
    if (!success) {
      res.status(404).json({ error: 'Policy not found.' });
      return;
    }
    res.json({ message: 'Policy removed successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
