import request from 'supertest';
import app from '../src/index.js';
import { users } from '../src/data/store.js';

describe('Auth Routes', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    users.clear();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('should not register user with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should not register user with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should not register duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ ...testUser, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ ...testUser, email: 'nonexistent@example.com' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});