import { Router } from 'express';
import { searchColleges, getCollege } from '../services/collegeScorecard.js';
import { getProfile } from '../services/supabase.js';
import { computeChances } from '../services/admissionChance.js';
import { compareColleges } from '../services/collegeComparison.js';
import { getCollegeProfile } from '../services/collegeDataAggregator.js';

const router = Router();

router.post('/compare', async (req, res, next) => {
  try {
    const { schools, major, gpa, sat, act, homeState } = req.body;
    if (!schools || !schools.length) return res.json([]);
    const data = await compareColleges(schools, { major, gpa, sat, act, homeState });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);
    const results = await searchColleges(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Admission probability for all target schools
router.get('/chances/:userId', async (req, res, next) => {
  try {
    const profile = await getProfile(req.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const chances = await computeChances(profile);
    res.json({ chances });
  } catch (err) {
    next(err);
  }
});

// Full enriched profile by name (Scorecard + IPEDS + US News)
router.get('/profile', async (req, res, next) => {
  try {
    const { name, homeState } = req.query;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const profile = await getCollegeProfile(name, homeState);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const college = await getCollege(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    next(err);
  }
});

export default router;
