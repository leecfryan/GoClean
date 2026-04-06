const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');
const app = require('../index');
const User = require('../models/User');

jest.mock('axios');

const mockUserId = new mongoose.Types.ObjectId().toString();

// Simulate auth service saying the token is valid
axios.get.mockResolvedValue({ data: { valid: true, userId: mockUserId } });

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://root:password@localhost:27017/goclean_test?authSource=admin'
  );
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const authHeader = { Authorization: 'Bearer faketoken' };

const seedUser = () =>
  User.create({
    _id: mockUserId,
    email: 'test@example.com',
    age: 25,
    address: '123 Main St',
    tier: 'normal',
  });

describe('GET /users/me', () => {
  it('returns the current user', async () => {
    await seedUser();
    const res = await request(app).get('/users/me').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  it('returns 401 when no token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /users/me', () => {
  it('updates allowed fields', async () => {
    await seedUser();
    const res = await request(app)
      .patch('/users/me')
      .set(authHeader)
      .send({ age: 30, address: '456 New Ave' });
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(30);
    expect(res.body.address).toBe('456 New Ave');
  });

  it('rejects invalid age', async () => {
    await seedUser();
    const res = await request(app).patch('/users/me').set(authHeader).send({ age: -5 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /users/me', () => {
  it('deletes the user', async () => {
    await seedUser();
    const res = await request(app).delete('/users/me').set(authHeader);
    expect(res.status).toBe(200);
    const gone = await User.findById(mockUserId);
    expect(gone).toBeNull();
  });
});
