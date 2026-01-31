const request = require('supertest');
const express = require('express');

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  const authRouter = require('../../routes/auth');
  app.use('/api/auth', authRouter);
});

describe('POST /api/auth/login', () => {
  test('valid full-admin creds -> 200, success, role=full', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'adminMay', password: 'asdfasdfasdf' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.role).toBe('full');
    expect(res.body.username).toBe('adminMay');
    expect(res.body.token).toBeDefined();
  });

  test('valid time-admin creds -> 200, role=time', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'adminAu', password: 'asdfasdfasdf' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.role).toBe('time');
    expect(res.body.username).toBe('adminAu');
  });

  test('wrong password -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'adminMay', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('unknown username -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'asdfasdfasdf' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
