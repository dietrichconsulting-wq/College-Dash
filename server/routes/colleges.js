import { Router } from 'express';
import { searchColleges, getCollege } from '../services/collegeScorecard.js';
import { getProfile } from '../services/notion.js';
import { computeChances } from '../services/admissionChance.js';
import { compareColleges } from '../services/collegeComparison.js';

const router = Router();

router.post('/compare', async (req, res, next) => {
  try {
    const { schools, major, gpa, sat, homeState } = req.body;
    if (!schools || !schools.length) return res.json([]);
    const data = await compareColleges(schools, { major, gpa, sat, homeState });
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
    const profile = await getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const chances = await computeChances(profile);
    res.json({ chances });
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
