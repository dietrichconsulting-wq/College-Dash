import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTasks, createTask, updateTask, moveTask, deleteTask } from '../services/supabase.js';

const router = Router();

// Get all tasks for user
router.get('/:userId', async (req, res, next) => {
  try {
    const tasks = await getTasks(req.params.userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Create a custom task
router.post('/', async (req, res, next) => {
  try {
    const { userId, title, description, category, dueDate, sortOrder } = req.body;
    const taskId = uuidv4();
    await createTask({ taskId, userId, title, description, status: 'To Do', category, dueDate, sortOrder });
    res.status(201).json({ taskId });
  } catch (err) {
    next(err);
  }
});

// Update task details
router.put('/:taskId', async (req, res, next) => {
  try {
    const result = await updateTask(req.params.taskId, req.body);
    if (!result) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Move task between columns
router.patch('/:taskId/move', async (req, res, next) => {
  try {
    const { status, sortOrder } = req.body;
    const task = await moveTask(req.params.taskId, status, sortOrder);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Delete task
router.delete('/:taskId', async (req, res, next) => {
  try {
    const result = await deleteTask(req.params.taskId);
    if (!result) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
