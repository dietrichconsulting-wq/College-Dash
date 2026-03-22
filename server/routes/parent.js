import { Router } from 'express';
import {
  getProfile,
  getProfileByLinkCode,
  createParentLink,
  getLinkedStudent,
  getLinkedParents,
  deleteParentLink,
  regenerateLinkCode,
  getTasks,
  getProgress,
  getScholarships,
} from '../services/supabase.js';
import requireParentAccess from '../middleware/requireParentAccess.js';

const router = Router();

// ─── Link parent to student via link code (no subscription check) ───
router.post('/link', async (req, res, next) => {
  try {
    const { parentId, linkCode } = req.body;
    if (!parentId || !linkCode) {
      return res.status(400).json({ error: 'parentId and linkCode required' });
    }

    const parent = await getProfile(parentId);
    if (!parent || parent.accountType !== 'parent') {
      return res.status(403).json({ error: 'Not a parent account' });
    }

    const student = await getProfileByLinkCode(linkCode);
    if (!student) {
      return res.status(404).json({ error: 'Invalid link code. Check with your student and try again.' });
    }

    await createParentLink(parentId, student.id);
    res.json({ studentName: student.displayName, studentId: student.id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already linked to this student' });
    }
    next(err);
  }
});

// ─── Get linked student's full data (read-only) ────────────
router.get('/student/:parentId', requireParentAccess, async (req, res, next) => {
  try {
    const student = req.linkedStudent;
    const [tasks, progress, scholarships] = await Promise.all([
      getTasks(student.userId),
      getProgress(student.userId),
      getScholarships(student.userId),
    ]);

    res.json({
      profile: student,
      tasks,
      progress,
      scholarships,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Get or generate student's link code ────────────────────
router.get('/link-code/:userId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.accountType !== 'student') {
      return res.status(403).json({ error: 'Only student accounts have link codes' });
    }
    res.json({ linkCode: profile.linkCode });
  } catch (err) {
    next(err);
  }
});

// ─── Regenerate link code (invalidates old one) ─────────────
router.post('/regenerate-code/:userId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.params.userId);
    if (!profile || profile.accountType !== 'student') {
      return res.status(403).json({ error: 'Only student accounts can regenerate link codes' });
    }
    const newCode = await regenerateLinkCode(req.params.userId);
    res.json({ linkCode: newCode });
  } catch (err) {
    next(err);
  }
});

// ─── Get parents linked to a student ────────────────────────
router.get('/linked-parents/:userId', async (req, res, next) => {
  try {
    const parents = await getLinkedParents(req.params.userId);
    res.json({ parents });
  } catch (err) {
    next(err);
  }
});

// ─── Unlink parent from student ─────────────────────────────
router.delete('/unlink/:parentId', async (req, res, next) => {
  try {
    await deleteParentLink(req.params.parentId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── Check parent access (does linked student have active sub?) ──
router.get('/access/:parentId', async (req, res, next) => {
  try {
    const parent = await getProfile(req.params.parentId);
    if (!parent || parent.accountType !== 'parent') {
      return res.json({ hasAccess: false, reason: 'not_parent' });
    }

    const student = await getLinkedStudent(req.params.parentId);
    if (!student) {
      return res.json({ hasAccess: false, reason: 'not_linked' });
    }

    const { subscriptionStatus, subscriptionEnd } = student;
    if (subscriptionStatus === 'active') {
      return res.json({ hasAccess: true, studentName: student.displayName });
    }
    if (subscriptionStatus === 'trial' && subscriptionEnd && new Date(subscriptionEnd) > new Date()) {
      return res.json({ hasAccess: true, studentName: student.displayName });
    }

    res.json({ hasAccess: false, reason: 'student_inactive' });
  } catch (err) {
    next(err);
  }
});

export default router;
