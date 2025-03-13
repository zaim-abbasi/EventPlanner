import request from 'supertest';
import app from '../src/index.js';
import { users, categories } from '../src/data/store.js';

describe('Category Routes', () => {
  let token;
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Clear data and create test user
    users.clear?.();
    categories.clear?.();

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = registerRes.body.token;
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Test Category'
      };

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: categoryData.name
      });
    });

    it('should not create category without name', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/categories', () => {
    it('should get all user categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});