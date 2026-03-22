import { Router } from 'express';
import { generateStrategy } from '../services/collegeStrategy.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { gpa, sat, act, major, budget, climate, schools } = req.body;
    if (!gpa || (!sat && !act) || !major) {
      return res.status(400).json({ error: 'gpa, a test score (SAT or ACT), and major are required' });
    }
    const strategy = await generateStrategy({ gpa, sat, act, major, budget, climate, schools });
    res.json(strategy);
  } catch (err) {
    next(err);
  }
});

export default router;
