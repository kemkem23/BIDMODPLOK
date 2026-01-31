jest.mock('../../ws', () => ({ broadcast: jest.fn() }));

const request = require('supertest');
const app = require('../../app');

describe('leaderboard routes', () => {
  test('GET /api/leaderboard returns classes and allResults with ETag', async () => {
    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('classes');
    expect(res.body).toHaveProperty('allResults');
    expect(Array.isArray(res.body.classes)).toBe(true);
    expect(Array.isArray(res.body.allResults)).toBe(true);
    expect(res.headers.etag).toBeDefined();
  });

  test('GET /api/leaderboard returns 304 on matching ETag', async () => {
    const first = await request(app).get('/api/leaderboard');
    const etag = first.headers.etag;

    const second = await request(app)
      .get('/api/leaderboard')
      .set('If-None-Match', etag);

    expect(second.status).toBe(304);
  });

  test('PUT /api/leaderboard with array updates results', async () => {
    const updates = [
      { teamId: 't1', times: { run1: 9.123 } },
    ];

    const res = await request(app)
      .put('/api/leaderboard')
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.updatedCount).toBeGreaterThanOrEqual(1);
  });

  test('PUT /api/leaderboard with non-array returns 400', async () => {
    const res = await request(app)
      .put('/api/leaderboard')
      .send({ notAnArray: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/array/i);
  });
});
