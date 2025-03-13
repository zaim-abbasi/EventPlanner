import request from 'supertest';
import app from '../src/index.js';
import { users, categories, events, reminders } from '../src/data/store.js';

describe('Reminder Routes', () => {
  let token;
  let eventId;
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Clear data and create test user
    users.clear?.();
    categories.clear?.();
    events.clear?.();
    reminders.clear?.();

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = registerRes.body.token;

    // Create a test category
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Category' });

    // Create a test event
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-01-01T12:00:00Z',
        categoryId: categoryRes.body.id
      });
    eventId = eventRes.body.id;
  });

  describe('POST /api/reminders', () => {
    it('should create a new reminder', async () => {
      const reminderData = {
        eventId,
        reminderTime: '2024-12-31T12:00:00Z'
      };

      const res = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send(reminderData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        eventId: reminderData.eventId,
        reminderTime: reminderData.reminderTime
      });
    });

    it('should not create reminder for non-existent event', async () => {
      const res = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventId: 'non-existent-id',
          reminderTime: '2024-12-31T12:00:00Z'
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/reminders', () => {
    it('should get all user reminders', async () => {
      const res = await request(app)
        .get('/api/reminders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});