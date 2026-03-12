import { Router } from 'express';
import { generateStrategy } from '../services/collegeStrategy.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { gpa, sat, major, budget, climate } = req.body;
    if (!gpa || !sat || !major) {
      return res.status(400).json({ error: 'gpa, sat, and major are required' });
    }
    const strategy = await generateStrategy({ gpa, sat, major, budget, climate });
    res.json(strategy);
  } catch (err) {
    next(err);
  }
});

export default router;
