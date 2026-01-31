jest.mock('../../ws', () => ({ broadcast: jest.fn() }));

const request = require('supertest');
const app = require('../../app');
const store = require('../../models/store');

describe('races routes', () => {
  test('GET /api/races/current returns data with ETag header', async () => {
    const res = await request(app).get('/api/races/current');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('currentRace');
    expect(res.headers.etag).toBeDefined();
  });

  test('GET /api/races/current returns 304 with matching If-None-Match', async () => {
    const first = await request(app).get('/api/races/current');
    const etag = first.headers.etag;

    const second = await request(app)
      .get('/api/races/current')
      .set('If-None-Match', etag);

    expect(second.status).toBe(304);
  });

  test('POST /api/races/current sets new race', async () => {
    const newRace = {
      id: 'race-new',
      className: 'Test',
      round: 'Final',
      status: 'waiting',
      left: { lane: 'left', team: null, times: {} },
      right: { lane: 'right', team: null, times: {} },
    };

    const res = await request(app)
      .post('/api/races/current')
      .send(newRace);

    expect(res.status).toBe(200);
    expect(res.body.currentRace.id).toBe('race-new');
  });

  test('PUT /api/races/current/times updates times', async () => {
    const raceData = {
      id: 'race-times',
      className: 'Test',
      round: 'Q',
      status: 'running',
      left: { lane: 'left', team: { id: 't1', number: 1, name: 'A' }, times: { qualify: null } },
      right: { lane: 'right', team: { id: 't3', number: 3, name: 'B' }, times: { qualify: null } },
    };
    store.setCurrentRace(raceData);

    const res = await request(app)
      .put('/api/races/current/times')
      .send({ left: { qualify: 10.5 }, status: 'finished' });

    expect(res.status).toBe(200);
    expect(res.body.currentRace.left.times.qualify).toBe(10.5);
    expect(res.body.currentRace.status).toBe('finished');
  });

  test('PUT /api/races/current/times returns 404 when store returns null', async () => {
    store.setCurrentRace(null);

    const res = await request(app)
      .put('/api/races/current/times')
      .send({ left: { run1: 1.0 } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No current race');
  });
});
