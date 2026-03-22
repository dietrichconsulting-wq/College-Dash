import express from 'express';
import { discoverSchools } from '../services/schoolDiscovery.js';

const router = express.Router();

// POST /api/discovery/find
router.post('/find', async (req, res) => {
  const { gpa, sat, act, major, budget, climate, preferences } = req.body;

  if (!gpa || !major) {
    return res.status(400).json({ error: 'GPA and major are required.' });
  }

  try {
    const schools = await discoverSchools({ gpa, sat, act, major, budget, climate, preferences });
    res.json({ schools });
  } catch (err) {
    console.error('Discovery error:', err);
    res.status(500).json({ error: 'Failed to discover schools. Please try again.' });
  }
});

export default router;
