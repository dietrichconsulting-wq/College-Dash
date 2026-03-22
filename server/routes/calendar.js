import { Router } from 'express';
import { createCalendarEvent, deleteCalendarEvent, hasTokens } from '../services/googleCalendar.js';
import { updateTask } from '../services/supabase.js';

const router = Router();

// Sync a task to Google Calendar
router.post('/sync', async (req, res, next) => {
  try {
    const { userId, taskId, title, date, description } = req.body;
    if (!hasTokens(userId)) {
      return res.status(401).json({ error: 'Google Calendar not connected' });
    }
    const eventId = await createCalendarEvent(userId, { title, date, description });
    await updateTask(taskId, { calendarEventId: eventId });
    res.json({ eventId });
  } catch (err) {
    next(err);
  }
});

// Remove a calendar event
router.delete('/:eventId', async (req, res, next) => {
  try {
    const userId = req.query.userId;
    await deleteCalendarEvent(userId, req.params.eventId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
