import express from 'express';
import { body, validationResult } from 'express-validator';
import { reminders, events } from '../data/store.js';

const router = express.Router();

// Validation middleware
const validateReminder = [
  body('eventId').notEmpty(),
  body('reminderTime').isISO8601(),
];

// create reminder
router.post('/', validateReminder, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { eventId, reminderTime } = req.body;
    
    const event = events.findById(eventId);
    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const reminder = reminders.create({
      eventId,
      reminderTime,
      userId: req.user.id
    });
    
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all reminders
router.get('/', async (req, res) => {
  try {
    const userReminders = reminders.findByUserId(req.user.id);
    res.json(userReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const reminderRoutes = router;