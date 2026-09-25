import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/labs - List all 8 baseline security labs
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const labs = await db.labs.list();
    res.json({ labs });
  } catch (err) {
    next(err);
  }
});

// GET /api/labs/:id - Get specific lab details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const lab = await db.labs.findById(id);
    if (!lab) {
      res.status(404).json({ error: 'Security lab scenario not found.' });
      return;
    }
    res.json({ lab });
  } catch (err) {
    next(err);
  }
});

export default router;
