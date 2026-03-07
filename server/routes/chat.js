import { Router } from 'express';
import { isConfigured, chat } from '../services/aiChat.js';
import { getProfile } from '../services/notion.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'AI chat not configured. Set ANTHROPIC_API_KEY in .env' });
    }
    const { userId, messages } = req.body;
    const profile = await getProfile(userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const reply = await chat(profile, messages);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
