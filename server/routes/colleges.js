import { Router } from 'express';
import { searchColleges, getCollege } from '../services/collegeScorecard.js';

const router = Router();

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
