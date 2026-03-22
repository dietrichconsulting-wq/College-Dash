import { Router } from 'express';
import { runWeeklyDigest } from '../services/digestCron.js';
import { setDigestUnsubscribed, getProfile } from '../services/supabase.js';

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

// One-click unsubscribe from weekly digest (CAN-SPAM / RFC 8058)
router.get('/unsubscribe/:parentId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.params.parentId);
    if (!profile || profile.accountType !== 'parent') {
      return res.status(404).send('<p>Unsubscribe link not found.</p>');
    }

    await setDigestUnsubscribed(req.params.parentId);

    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribed — Stairway U</title>
<style>body{font-family:-apple-system,sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#333;padding:24px}h1{color:#1e3a5f}a{color:#2563eb}</style>
</head>
<body>
  <h1>You've been unsubscribed.</h1>
  <p>You won't receive any more weekly digest emails from Stairway U.</p>
  <p>You can still <a href="https://stairwayu.com">log in to your account</a> at any time.</p>
</body>
</html>`);
  } catch (err) {
    next(err);
  }
});

export default router;
