import express from 'express';
import { body, validationResult } from 'express-validator';
import { events, categories } from '../data/store.js';

const router = express.Router();

// validation middleware
const validateEvent = [
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('date').isISO8601(),
  body('categoryId').notEmpty(),
];

// create event
router.post('/', validateEvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, date, categoryId } = req.body;
    
    const category = categories.findById(categoryId);
    if (!category || category.userId !== req.user.id) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const event = events.create({
      name,
      description,
      date,
      categoryId,
      userId: req.user.id
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all events
router.get('/', async (req, res) => {
  try {
    const userEvents = events.findByUserId(req.user.id);
    res.json(userEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = events.findById(req.params.id);
    
    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update event
router.put('/:id', validateEvent, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = events.findById(req.params.id);
    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { name, description, date, categoryId } = req.body;
    const updated = events.update(req.params.id, {
      name,
      description,
      date,
      categoryId
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = events.findById(req.params.id);
    if (!event || event.userId !== req.user.id) {
      return res.status(404).json({ error: 'Event not found' });
    }

    events.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const eventRoutes = router;