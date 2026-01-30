const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const store = require('../models/store');

function computeETag(data) {
  return '"' + crypto.createHash('md5').update(JSON.stringify(data)).digest('hex') + '"';
}

// GET /api/races/current
router.get('/current', (req, res) => {
  const currentRace = store.getCurrentRace();
  const body = { currentRace };
  const etag = computeETag(body);
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.json(body);
});

// POST /api/races/current
router.post('/current', (req, res) => {
  const raceData = req.body;
  const currentRace = store.setCurrentRace(raceData);
  res.json({ currentRace });
});

// PUT /api/races/current/times
router.put('/current/times', (req, res) => {
  const timesData = req.body;
  const currentRace = store.updateCurrentRaceTimes(timesData);
  if (!currentRace) {
    return res.status(404).json({ error: 'No current race' });
  }
  res.json({ currentRace });
});

module.exports = router;
