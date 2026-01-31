const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const { broadcast } = require('../ws');
const seedData = require(path.join(__dirname, '..', 'data', 'seed.json'));
const STORE_FILE = path.join(__dirname, '..', 'data', 'store.json');

// Try to load persisted data; fall back to seed data
let initialData;
try {
  const raw = fs.readFileSync(STORE_FILE, 'utf-8');
  initialData = JSON.parse(raw);
  console.log('Loaded persisted store from store.json');
} catch (err) {
  initialData = seedData;
  console.log('No persisted store found, using seed.json');
}

// Deep clone so we don't mutate the require cache
const store = {
  classes: JSON.parse(JSON.stringify(initialData.classes)),
  results: JSON.parse(JSON.stringify(initialData.results)),
  currentRace: JSON.parse(JSON.stringify(initialData.currentRace)),
};

// Debounced async file persistence
let saveTimeout = null;

function saveToFile() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    _persistToFile();
  }, 500);
}

async function _persistToFile() {
  try {
    const data = JSON.stringify({
      classes: store.classes,
      results: store.results,
      currentRace: store.currentRace,
    }, null, 2);
    await fsPromises.writeFile(STORE_FILE, data, 'utf-8');
  } catch (err) {
    console.error('Failed to persist store to file:', err.message);
  }
}

// Caches
let leaderboardCache = null;
let allResultsCache = null;

function invalidateCaches() {
  leaderboardCache = null;
  allResultsCache = null;
}

function getCurrentRace() {
  return store.currentRace;
}

function setCurrentRace(raceData) {
  store.currentRace = raceData;
  invalidateCaches();
  saveToFile();
  broadcast('race:updated', store.currentRace);
  return store.currentRace;
}

function updateCurrentRaceTimes(timesData) {
  const race = store.currentRace;
  if (!race) return null;

  if (timesData.left) {
    Object.assign(race.left.times, timesData.left);
  }
  if (timesData.right) {
    Object.assign(race.right.times, timesData.right);
  }
  if (timesData.status) {
    race.status = timesData.status;
  }

  // Also update results
  if (timesData.left && race.left.team) {
    const result = store.results.find(r => r.teamId === race.left.team.id);
    if (result) Object.assign(result.times, timesData.left);
  }
  if (timesData.right && race.right.team) {
    const result = store.results.find(r => r.teamId === race.right.team.id);
    if (result) Object.assign(result.times, timesData.right);
  }

  invalidateCaches();
  saveToFile();
  broadcast('race:updated', race);
  broadcast('leaderboard:updated', { classes: getLeaderboard(), allResults: getAllResults() });
  return race;
}

function getLeaderboard() {
  if (leaderboardCache) return leaderboardCache;

  leaderboardCache = store.classes.map((cls) => {
    const classResults = store.results.filter(r => r.className === cls.className);

    const entries = classResults.map((r) => {
      const team = cls.teams.find(t => t.id === r.teamId) || { id: r.teamId, name: 'Unknown', className: r.className };
      const times = r.times;
      const allTimes = [times.qualify, times.run1, times.run2, times.run3].filter(t => t != null);
      const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : null;

      return {
        rank: 0,
        team,
        bestTimes: times,
        bestTime,
      };
    });

    // Sort by best time (null = last)
    entries.sort((a, b) => {
      if (a.bestTime == null && b.bestTime == null) return 0;
      if (a.bestTime == null) return 1;
      if (b.bestTime == null) return -1;
      return a.bestTime - b.bestTime;
    });

    entries.forEach((e, i) => { e.rank = i + 1; });

    return { className: cls.className, entries };
  });

  return leaderboardCache;
}

function getAllTeams() {
  return store.classes.flatMap(cls => cls.teams);
}

function getAllResults() {
  if (allResultsCache) return allResultsCache;

  const allTeams = getAllTeams();
  allResultsCache = store.results.map((r) => {
    const team = allTeams.find(t => t.id === r.teamId) || { id: r.teamId, name: 'Unknown', className: r.className };
    const classMatch = r.className.match(/รุ่น\s*(\d+)/);
    const classNumber = classMatch ? parseInt(classMatch[1], 10) : null;
    return {
      number: team.number || null,
      classNumber,
      className: r.className,
      team,
      times: r.times,
    };
  }).sort((a, b) => (a.number || 999) - (b.number || 999));

  return allResultsCache;
}

function getTeamById(teamId) {
  for (const cls of store.classes) {
    const team = cls.teams.find(t => t.id === teamId);
    if (team) return team;
  }
  return null;
}

function updateTeam(teamId, fields) {
  const allowedFields = ['name', 'nickname', 'contactPerson', 'phone', 'amphur', 'photo', 'tentNumber'];
  let updatedTeam = null;

  for (const cls of store.classes) {
    const team = cls.teams.find(t => t.id === teamId);
    if (team) {
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          team[key] = fields[key];
        }
      }
      updatedTeam = team;
      break;
    }
  }

  const race = store.currentRace;
  if (race) {
    if (race.left && race.left.team && race.left.team.id === teamId) {
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          race.left.team[key] = fields[key];
        }
      }
    }
    if (race.right && race.right.team && race.right.team.id === teamId) {
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          race.right.team[key] = fields[key];
        }
      }
    }
  }

  if (updatedTeam) {
    invalidateCaches();
    saveToFile();
    broadcast('team:updated', updatedTeam);
    broadcast('race:updated', store.currentRace);
    broadcast('leaderboard:updated', { classes: getLeaderboard(), allResults: getAllResults() });
  }
  return updatedTeam;
}

function updateResults(updates) {
  if (!Array.isArray(updates)) return [];
  const updated = [];
  for (const upd of updates) {
    const result = store.results.find(r => r.teamId === upd.teamId);
    if (result && upd.times) {
      Object.assign(result.times, upd.times);
      updated.push(result);
    }
  }
  if (updated.length > 0) {
    invalidateCaches();
    saveToFile();
    broadcast('leaderboard:updated', { classes: getLeaderboard(), allResults: getAllResults() });
  }
  return updated;
}

module.exports = {
  getCurrentRace,
  setCurrentRace,
  updateCurrentRaceTimes,
  getLeaderboard,
  getAllTeams,
  getAllResults,
  updateResults,
  getTeamById,
  updateTeam,
};
