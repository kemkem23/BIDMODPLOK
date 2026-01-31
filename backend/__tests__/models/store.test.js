jest.mock('../../ws', () => ({ broadcast: jest.fn() }));

describe('store model', () => {
  let store;
  let broadcast;

  beforeEach(() => {
    jest.isolateModules(() => {
      jest.mock('../../ws', () => ({ broadcast: jest.fn() }));
      store = require('../../models/store');
      broadcast = require('../../ws').broadcast;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- getCurrentRace ---
  test('getCurrentRace returns data', () => {
    const race = store.getCurrentRace();
    expect(race).toBeDefined();
    expect(race).toHaveProperty('id');
    expect(race).toHaveProperty('left');
    expect(race).toHaveProperty('right');
  });

  // --- setCurrentRace ---
  test('setCurrentRace updates and calls broadcast(race:updated)', () => {
    const newRace = { id: 'race99', className: 'TestClass', round: 'Final', status: 'running', left: null, right: null };
    const result = store.setCurrentRace(newRace);

    expect(result).toEqual(newRace);
    expect(store.getCurrentRace()).toEqual(newRace);
    expect(broadcast).toHaveBeenCalledWith('race:updated', newRace);
  });

  // --- updateCurrentRaceTimes ---
  test('updateCurrentRaceTimes updates left/right times and status, calls broadcast twice', () => {
    const race = store.getCurrentRace();
    expect(race).toBeTruthy();

    const timesData = {
      left: { run1: 9.555 },
      right: { run1: 9.777 },
      status: 'finished',
    };

    const result = store.updateCurrentRaceTimes(timesData);

    expect(result).toBeDefined();
    expect(result.left.times.run1).toBe(9.555);
    expect(result.right.times.run1).toBe(9.777);
    expect(result.status).toBe('finished');

    expect(broadcast).toHaveBeenCalledWith('race:updated', expect.anything());
    expect(broadcast).toHaveBeenCalledWith('leaderboard:updated', expect.anything());
    expect(broadcast).toHaveBeenCalledTimes(2);
  });

  test('updateCurrentRaceTimes returns null when no race', () => {
    store.setCurrentRace(null);
    broadcast.mockClear();

    const result = store.updateCurrentRaceTimes({ left: { run1: 1.0 } });
    expect(result).toBeNull();
  });

  // --- getLeaderboard ---
  test('getLeaderboard returns sorted entries, uses cache on second call', () => {
    const lb1 = store.getLeaderboard();
    expect(Array.isArray(lb1)).toBe(true);
    expect(lb1.length).toBeGreaterThan(0);

    for (const cls of lb1) {
      expect(cls).toHaveProperty('className');
      expect(cls).toHaveProperty('entries');
      expect(Array.isArray(cls.entries)).toBe(true);

      cls.entries.forEach((e, i) => {
        expect(e.rank).toBe(i + 1);
      });
    }

    const lb2 = store.getLeaderboard();
    expect(lb2).toBe(lb1);
  });

  // --- getAllResults ---
  test('getAllResults returns enriched sorted results, uses cache', () => {
    const res1 = store.getAllResults();
    expect(Array.isArray(res1)).toBe(true);
    expect(res1.length).toBeGreaterThan(0);

    for (const r of res1) {
      expect(r).toHaveProperty('team');
      expect(r).toHaveProperty('times');
      expect(r).toHaveProperty('className');
    }

    for (let i = 1; i < res1.length; i++) {
      expect((res1[i - 1].number || 999)).toBeLessThanOrEqual((res1[i].number || 999));
    }

    const res2 = store.getAllResults();
    expect(res2).toBe(res1);
  });

  // --- getTeamById ---
  test('getTeamById finds team or returns null', () => {
    const team = store.getTeamById('t1');
    expect(team).toBeDefined();
    expect(team.id).toBe('t1');

    const missing = store.getTeamById('nonexistent');
    expect(missing).toBeNull();
  });

  // --- updateTeam ---
  test('updateTeam updates allowed fields, syncs with currentRace, broadcasts', () => {
    const updated = store.updateTeam('t1', { name: 'Updated Name', nickname: 'Nick' });
    expect(updated).toBeDefined();
    expect(updated.name).toBe('Updated Name');
    expect(updated.nickname).toBe('Nick');

    expect(broadcast).toHaveBeenCalledWith('team:updated', expect.objectContaining({ name: 'Updated Name' }));
    expect(broadcast).toHaveBeenCalledWith('race:updated', expect.anything());
  });

  test('updateTeam returns null for unknown id', () => {
    const result = store.updateTeam('unknown-id', { name: 'X' });
    expect(result).toBeNull();
  });

  // --- updateResults ---
  test('updateResults batch updates, broadcasts leaderboard:updated', () => {
    const updates = [
      { teamId: 't1', times: { run2: 8.888 } },
      { teamId: 't2', times: { run2: 7.777 } },
    ];
    const result = store.updateResults(updates);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(broadcast).toHaveBeenCalledWith('leaderboard:updated', expect.anything());
  });

  test('updateResults returns [] for non-array input', () => {
    const result = store.updateResults('not-an-array');
    expect(result).toEqual([]);
  });

  // --- Cache invalidation ---
  test('mutation invalidates leaderboard and allResults caches', () => {
    const lb1 = store.getLeaderboard();
    const ar1 = store.getAllResults();

    store.updateResults([{ teamId: 't1', times: { run3: 6.666 } }]);

    const lb2 = store.getLeaderboard();
    const ar2 = store.getAllResults();

    expect(lb2).not.toBe(lb1);
    expect(ar2).not.toBe(ar1);
  });
});
