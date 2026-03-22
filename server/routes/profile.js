import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createProfile, getProfile, updateProfile, createProgress } from '../services/supabase.js';
import { seedTasksForUser } from '../services/seedTasks.js';

const router = Router();

// Create profile + seed default tasks
router.post('/', async (req, res, next) => {
  try {
    const userId = req.body.userId || uuidv4();
    const { displayName, email, gpa, sat, act, proposedMajor, schools } = req.body;

    await createProfile({ userId, displayName, email, gpa, sat, act, proposedMajor, schools });
    await seedTasksForUser(userId);
    await createProgress({
      entryId: uuidv4(),
      userId,
      milestoneKey: 'profile_complete',
      notes: 'Profile created and tasks seeded',
    });

    const profile = await getProfile(userId);
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

// Get profile
router.get('/:userId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Update profile
router.put('/:userId', async (req, res, next) => {
  try {
    const result = await updateProfile(req.params.userId, req.body);
    if (!result) return res.status(404).json({ error: 'Profile not found' });
    const profile = await getProfile(req.params.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
