import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { eventRoutes } from './routes/events.js';
import { categoryRoutes } from './routes/categories.js';
import { reminderRoutes } from './routes/reminders.js';
import { authRoutes } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { startReminderCron } from './services/reminderService.js';

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/events', authMiddleware, eventRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);

// start reminder cron job
startReminderCron();

export default app;