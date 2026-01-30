const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const store = require('../models/store');

function computeETag(data) {
  return '"' + crypto.createHash('md5').update(JSON.stringify(data)).digest('hex') + '"';
}

// GET /api/leaderboard
router.get('/', (req, res) => {
  const classes = store.getLeaderboard();
  const allResults = store.getAllResults();
  const body = { classes, allResults };
  const etag = computeETag(body);
  res.set('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.json(body);
});

// PUT /api/leaderboard
router.put('/', (req, res) => {
  const updates = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Expected an array of updates' });
  }
  try {
    const updated = store.updateResults(updates);
    res.json({ success: true, updatedCount: updated.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update results' });
  }
});

module.exports = router;
