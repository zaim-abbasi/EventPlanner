import express from 'express';
import { body, validationResult } from 'express-validator';
import { categories } from '../data/store.js';

const router = express.Router();

// validation middleware
const validateCategory = [
  body('name').notEmpty().trim(),
];

// create category
router.post('/', validateCategory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const category = categories.create({ 
      name, 
      userId: req.user.id 
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all categories
router.get('/', async (req, res) => {
  try {
    const userCategories = categories.findByUserId(req.user.id);
    res.json(userCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const categoryRoutes = router;