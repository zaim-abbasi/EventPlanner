import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { users } from '../data/store.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-myyyyyyyyysecretttttttttkeyyyyyyyyyyyyy-key';

// simple password hashing
const hashPassword = (password) => password;

// validation middleware
const validateAuth = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

// register
router.post('/register', validateAuth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    
    if (users.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = hashPassword(password);
    const user = users.create(email, hashedPassword);
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// login
router.post('/login', validateAuth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = users.findByEmail(email);

    if (!user || user.hashedPassword !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const authRoutes = router;