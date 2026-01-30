const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const store = require('../models/store');

function computeETag(data) {
  return '"' + crypto.createHash('md5').update(JSON.stringify(data)).digest('hex') + '"';
}

// GET /api/teams
router.get('/', (req, res) => {
  const teams = store.getAllTeams();
  const body = { teams };
  const etag = computeETag(body);
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.json(body);
});

// GET /api/teams/:id
router.get('/:id', (req, res) => {
  const team = store.getTeamById(req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  const body = { team };
  const etag = computeETag(body);
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.json(body);
});

// PUT /api/teams/:id
router.put('/:id', (req, res) => {
  const team = store.updateTeam(req.params.id, req.body);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json({ team });
});

module.exports = router;
