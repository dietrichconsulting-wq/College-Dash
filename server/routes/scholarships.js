import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getScholarships,
  createScholarship,
  updateScholarship,
  moveScholarship,
  deleteScholarship,
} from '../services/supabase.js';

const router = Router();

// GET /api/scholarships/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const columns = await getScholarships(req.params.userId);
    res.json(columns);
  } catch (err) {
    next(err);
  }
});

// POST /api/scholarships
router.post('/', async (req, res, next) => {
  try {
    const { userId, name, amount, deadline, essayRequired, difficulty, stage, url, notes } = req.body;
    const scholarshipId = uuidv4();
    const scholarship = await createScholarship({
      scholarshipId, userId, name, amount, deadline,
      essayRequired, difficulty, stage, url, notes,
    });
    res.status(201).json(scholarship);
  } catch (err) {
    next(err);
  }
});

// PUT /api/scholarships/:scholarshipId
router.put('/:scholarshipId', async (req, res, next) => {
  try {
    const updated = await updateScholarship(req.params.scholarshipId, req.body);
    if (!updated) return res.status(404).json({ error: 'Scholarship not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/scholarships/:scholarshipId/move
router.put('/:scholarshipId/move', async (req, res, next) => {
  try {
    const { stage } = req.body;
    const updated = await moveScholarship(req.params.scholarshipId, stage);
    if (!updated) return res.status(404).json({ error: 'Scholarship not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/scholarships/:scholarshipId
router.delete('/:scholarshipId', async (req, res, next) => {
  try {
    await deleteScholarship(req.params.scholarshipId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
