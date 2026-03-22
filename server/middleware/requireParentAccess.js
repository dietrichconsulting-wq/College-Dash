import { getProfile, getLinkedStudent } from '../services/supabase.js';

/**
 * Middleware for parent routes: verifies the parent is linked to a student
 * whose subscription is active. Parents ride on the student's subscription.
 */
export default async function requireParentAccess(req, res, next) {
  const parentId = req.params.parentId || req.query.parentId || req.body?.parentId;

  if (!parentId) {
    return res.status(401).json({ error: 'parentId required' });
  }

  try {
    const parentProfile = await getProfile(parentId);
    if (!parentProfile) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }
    if (parentProfile.accountType !== 'parent') {
      return res.status(403).json({ error: 'Not a parent account' });
    }

    const student = await getLinkedStudent(parentId);
    if (!student) {
      return res.status(403).json({ error: 'No linked student' });
    }

    // Check the STUDENT's subscription
    const { subscriptionStatus, subscriptionEnd } = student;
    if (subscriptionStatus === 'active') {
      req.linkedStudent = student;
      return next();
    }
    if (subscriptionStatus === 'trial' && subscriptionEnd && new Date(subscriptionEnd) > new Date()) {
      req.linkedStudent = student;
      return next();
    }

    return res.status(403).json({
      error: 'Student subscription inactive',
      subscriptionStatus: subscriptionStatus || 'none',
    });
  } catch (err) {
    next(err);
  }
}
