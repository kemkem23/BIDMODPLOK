jest.mock('../../ws', () => ({ broadcast: jest.fn() }));

const request = require('supertest');
const app = require('../../app');

describe('teams routes', () => {
  test('GET /api/teams returns all teams with ETag', async () => {
    const res = await request(app).get('/api/teams');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('teams');
    expect(Array.isArray(res.body.teams)).toBe(true);
    expect(res.body.teams.length).toBeGreaterThan(0);
    expect(res.headers.etag).toBeDefined();
  });

  test('GET /api/teams returns 304 on matching ETag', async () => {
    const first = await request(app).get('/api/teams');
    const etag = first.headers.etag;

    const second = await request(app)
      .get('/api/teams')
      .set('If-None-Match', etag);

    expect(second.status).toBe(304);
  });

  test('GET /api/teams/:id returns single team', async () => {
    const res = await request(app).get('/api/teams/t1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('team');
    expect(res.body.team.id).toBe('t1');
  });

  test('GET /api/teams/:id returns 404 for unknown', async () => {
    const res = await request(app).get('/api/teams/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Team not found');
  });

  test('PUT /api/teams/:id updates team', async () => {
    const res = await request(app)
      .put('/api/teams/t1')
      .send({ name: 'New Team Name', nickname: 'NTN' });

    expect(res.status).toBe(200);
    expect(res.body.team.name).toBe('New Team Name');
    expect(res.body.team.nickname).toBe('NTN');
  });
});
