const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://root:password@localhost:27017/goclean_auth_test?authSource=admin');
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /register', () => {
  it('creates a user and returns an access token', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    const res = await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/register').send({ email: 'notanemail', password: 'password123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /login', () => {
  beforeEach(async () => {
    await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
  });

  it('returns access token on valid credentials', async () => {
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('POST /refresh', () => {
  it('returns new access token using refresh token cookie', async () => {
    const loginRes = await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app).post('/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});

describe('POST /logout', () => {
  it('clears the refresh token cookie', async () => {
    const loginRes = await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app).post('/logout').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });
});

describe('GET /verify', () => {
  it('returns valid: true for a good token', async () => {
    const loginRes = await request(app).post('/register').send({ email: 'test@example.com', password: 'password123' });
    const { accessToken } = loginRes.body;

    const res = await request(app).get('/verify').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it('returns 401 for a bad token', async () => {
    const res = await request(app).get('/verify').set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
  });
});
