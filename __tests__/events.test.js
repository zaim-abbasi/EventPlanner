import request from 'supertest';
import app from '../src/app.js';
import { users, categories, events } from '../src/data/store.js';

describe('Event Routes', () => {
  let token;
  let categoryId;
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    users.clear();
    categories.clear();
    events.clear();

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = registerRes.body.token;

    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Category' });
    categoryId = categoryRes.body.id;
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-01-01T12:00:00Z',
        categoryId
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        categoryId: eventData.categoryId
      });
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should not create event without authentication', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-01-01T12:00:00Z',
        categoryId
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.statusCode).toBe(401);
    });

    it('should not create event with invalid category', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-01-01T12:00:00Z',
        categoryId: 'invalid-id'
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/events', () => {
    it('should get all user events', async () => {
      // Create test events
      const eventData = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-01-01T12:00:00Z',
        categoryId
      };

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject(eventData);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event', async () => {
      // Create an event first
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Original Event',
          description: 'Original Description',
          date: '2025-01-01T12:00:00Z',
          categoryId
        });

      const updateData = {
        name: 'Updated Event',
        description: 'Updated Description',
        date: '2025-02-01T12:00:00Z',
        categoryId
      };

      const res = await request(app)
        .put(`/api/events/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    it('should not update non-existent event', async () => {
      const updateData = {
        name: 'Updated Event',
        description: 'Updated Description',
        date: '2025-02-01T12:00:00Z',
        categoryId
      };

      const res = await request(app)
        .put('/api/events/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event', async () => {
      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Event to Delete',
          description: 'Will be deleted',
          date: '2025-01-01T12:00:00Z',
          categoryId
        });

      const res = await request(app)
        .delete(`/api/events/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      // Verify event is deleted
      const getRes = await request(app)
        .get(`/api/events/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(getRes.statusCode).toBe(404);
    });
  });
});