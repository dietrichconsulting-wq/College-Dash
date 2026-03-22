import { Router } from 'express';
import { runWeeklyDigest } from '../services/digestCron.js';

const router = Router();

// Weekly digest cron endpoint — protected by CRON_SECRET
router.get('/weekly-digest', async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const result = await runWeeklyDigest();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
