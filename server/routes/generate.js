import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { isConfigured } from '../services/aiChat.js';
import { getProfile, getTasks, createTask } from '../services/supabase.js';
import { generateRoadmap } from '../services/aiTaskGenerator.js';

const router = Router();

// Generate a personalized 90-day roadmap
router.post('/roadmap', async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'AI not configured. Set GEMINI_API_KEY in .env' });
    }

    const userId = req.userId;

    const profile = await getProfile(userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Fetch existing tasks so AI doesn't duplicate them
    const columns = await getTasks(userId);
    const existingTasks = [
      ...(columns['To Do'] || []),
      ...(columns['In Progress'] || []),
      ...(columns['Done'] || []),
    ];

    const tasks = await generateRoadmap(profile, existingTasks);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// Accept selected tasks from the roadmap and create them
router.post('/roadmap/accept', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'tasks[] is required' });
    }

    const created = [];
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const taskId = uuidv4();
      await createTask({
        taskId,
        userId,
        title: t.title,
        description: t.description || '',
        status: 'To Do',
        category: t.category || 'Other',
        dueDate: t.dueDate || null,
        sortOrder: i,
      });
      created.push(taskId);
    }

    res.status(201).json({ created, count: created.length });
  } catch (err) {
    next(err);
  }
});

export default router;
