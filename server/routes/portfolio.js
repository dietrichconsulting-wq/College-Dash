import { Router } from 'express';
import { getPortfolioTips } from '../services/portfolioAdvice.js';

const router = Router();

router.post('/tips', async (req, res, next) => {
  try {
    const { major, schools, gpa, sat } = req.body;
    if (!major) return res.json([]);
    const tips = await getPortfolioTips({ major, schools, gpa, sat });
    res.json(tips);
  } catch (err) {
    next(err);
  }
});

export default router;
