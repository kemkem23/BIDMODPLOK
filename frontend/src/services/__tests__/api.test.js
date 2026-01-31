import {
  fetchCurrentRace,
  postCurrentRace,
  updateRaceTimes,
  fetchLeaderboard,
  updateLeaderboard,
  fetchTeams,
  updateTeam,
  login,
} from '../api';

const API_BASE = 'http://localhost:5000/api';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetchCurrentRace', () => {
  it('calls the correct URL and returns JSON', async () => {
    const payload = { currentRace: { id: 1 } };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    const result = await fetchCurrentRace();
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/races/current`);
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchCurrentRace()).rejects.toThrow('Failed to fetch current race');
  });
});

describe('postCurrentRace', () => {
  it('sends POST with JSON body', async () => {
    const raceData = { name: 'Race 1' };
    const payload = { id: 1, name: 'Race 1' };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await postCurrentRace(raceData);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/races/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raceData),
    });
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(postCurrentRace({})).rejects.toThrow('Failed to set current race');
  });
});

describe('updateRaceTimes', () => {
  it('sends PUT with JSON body', async () => {
    const timesData = { lap1: '1:30' };
    const payload = { updated: true };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await updateRaceTimes(timesData);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/races/current/times`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timesData),
    });
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(updateRaceTimes({})).rejects.toThrow('Failed to update times');
  });
});

describe('fetchLeaderboard', () => {
  it('calls the correct URL and returns JSON', async () => {
    const payload = { classes: [], allResults: [] };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await fetchLeaderboard();
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/leaderboard`);
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchLeaderboard()).rejects.toThrow('Failed to fetch leaderboard');
  });
});

describe('updateLeaderboard', () => {
  it('sends PUT with array body', async () => {
    const updates = [{ classId: 1, score: 10 }];
    const payload = { updated: true };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await updateLeaderboard(updates);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(updateLeaderboard([])).rejects.toThrow('Failed to update leaderboard');
  });
});

describe('fetchTeams', () => {
  it('calls the correct URL and returns JSON', async () => {
    const payload = [{ id: 1, name: 'Team A' }];
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await fetchTeams();
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/teams`);
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchTeams()).rejects.toThrow('Failed to fetch teams');
  });
});

describe('updateTeam', () => {
  it('sends PUT to /teams/:id with fields', async () => {
    const fields = { name: 'New Name' };
    const payload = { id: 42, name: 'New Name' };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await updateTeam(42, fields);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/teams/42`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(updateTeam(1, {})).rejects.toThrow('Failed to update team');
  });
});

describe('login', () => {
  it('sends POST and returns data on success', async () => {
    const creds = { username: 'admin', password: 'pass' };
    const payload = { token: 'abc', role: 'full', username: 'admin' };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
    const result = await login(creds);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    expect(result).toEqual(payload);
  });

  it('returns data even on 401 (does not throw)', async () => {
    const errorBody = { error: 'Invalid credentials' };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve(errorBody),
    });
    const result = await login({ username: 'x', password: 'y' });
    expect(result).toEqual(errorBody);
  });
});
