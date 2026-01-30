import { API_BASE } from '../config';

export async function fetchCurrentRace() {
  const res = await fetch(`${API_BASE}/races/current`);
  if (!res.ok) throw new Error('Failed to fetch current race');
  return res.json();
}

export async function postCurrentRace(raceData) {
  const res = await fetch(`${API_BASE}/races/current`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(raceData),
  });
  if (!res.ok) throw new Error('Failed to set current race');
  return res.json();
}

export async function updateRaceTimes(timesData) {
  const res = await fetch(`${API_BASE}/races/current/times`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(timesData),
  });
  if (!res.ok) throw new Error('Failed to update times');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function updateLeaderboard(updates) {
  const res = await fetch(`${API_BASE}/leaderboard`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update leaderboard');
  return res.json();
}

export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error('Failed to fetch teams');
  return res.json();
}

export async function updateTeam(teamId, fields) {
  const res = await fetch(`${API_BASE}/teams/${teamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error('Failed to update team');
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}
