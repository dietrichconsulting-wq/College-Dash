import { Router } from 'express';
import { generateStrategy } from '../services/collegeStrategy.js';
import { getProfile, updateProfile } from '../services/supabase.js';

const router = Router();

// In-flight dedup: one Gemini call per user at a time
const inflight = new Map();

// Cache TTL: reuse a strategy result for 1 hour before allowing regeneration
const CACHE_TTL_MS = 60 * 60 * 1000;

router.post('/generate', async (req, res, next) => {
  try {
    const { userId, gpa, sat, act, major, budget, climate, schools, forceRefresh } = req.body;
    if (!gpa || (!sat && !act) || !major) {
      return res.status(400).json({ error: 'gpa, a test score (SAT or ACT), and major are required' });
    }

    // ── Check DB cache (skip if forceRefresh) ──────────────────────────
    if (userId && !forceRefresh) {
      const profile = await getProfile(userId);
      if (profile?.strategyResult && profile.strategyGeneratedAt) {
        const age = Date.now() - new Date(profile.strategyGeneratedAt).getTime();
        if (age < CACHE_TTL_MS) {
          return res.json(profile.strategyResult);
        }
      }
    }

    // ── In-flight dedup: if same user already generating, wait for that result ──
    if (userId && inflight.has(userId)) {
      const result = await inflight.get(userId);
      return res.json(result);
    }

    // ── Generate (with dedup tracking) ─────────────────────────────────
    const promise = generateStrategy({ gpa, sat, act, major, budget, climate, schools });

    if (userId) inflight.set(userId, promise);

    let strategy;
    try {
      strategy = await promise;
    } finally {
      if (userId) inflight.delete(userId);
    }

    // ── Persist to DB ──────────────────────────────────────────────────
    if (userId) {
      updateProfile(userId, {
        strategyResult: strategy,
        strategyGeneratedAt: new Date().toISOString(),
      }).catch(err => console.error('Failed to cache strategy result:', err));
    }

    res.json(strategy);
  } catch (err) {
    next(err);
  }
});

export default router;
