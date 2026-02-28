// routes/approvedPids.js (example)
const express = require('express');
const router = express.Router();
const UIDRequest = require('../models/UidRequests');

// GET all approved PIDs
router.get('/', async (req, res) => {
  try {
    // fetch only approved ones
    const approved = await UIDRequest.find({ principalAccept: true }).select('uid -_id');
    const approvedPids = approved.map(p => p.uid); // array of UID strings
    res.json(approvedPids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
