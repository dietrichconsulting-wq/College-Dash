import { Router } from 'express';
import { isConfigured, getAuthUrl, handleCallback, hasTokens } from '../services/googleCalendar.js';

const router = Router();

router.get('/google', (req, res) => {
  if (!isConfigured()) return res.status(503).json({ error: 'Google Calendar not configured' });
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const url = getAuthUrl(userId);
  res.json({ url });
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    await handleCallback(code, userId);
    // Redirect back to dashboard with success
    res.redirect('/?calendarConnected=true');
  } catch (err) {
    next(err);
  }
});

router.get('/google/status', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ connected: hasTokens(userId), configured: isConfigured() });
});

export default router;
