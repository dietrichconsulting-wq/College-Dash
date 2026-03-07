import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProgress, createProgress } from '../services/notion.js';

const router = Router();

router.get('/:userId', async (req, res, next) => {
  try {
    const progress = await getProgress(req.params.userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { userId, milestoneKey, notes } = req.body;
    await createProgress({ entryId: uuidv4(), userId, milestoneKey, notes });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
