import { getProfile } from '../services/supabase.js';

export default async function requireSubscription(req, res, next) {
  const userId = req.params.userId || req.query.userId || req.body?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'userId required' });
  }

  try {
    const profile = await getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { subscriptionStatus, subscriptionEnd } = profile;

    // Active subscription — allow
    if (subscriptionStatus === 'active') return next();

    // Valid trial — allow
    if (subscriptionStatus === 'trial' && subscriptionEnd) {
      if (new Date(subscriptionEnd) > new Date()) {
        return next();
      }
    }

    return res.status(403).json({
      error: 'Subscription required',
      subscriptionStatus: subscriptionStatus || 'none',
    });
  } catch (err) {
    next(err);
  }
}
