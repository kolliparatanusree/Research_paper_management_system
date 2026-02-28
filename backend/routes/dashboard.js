// File: routes/dashboard.js
const express = require('express');
const router = express.Router();
const HodUidRequest = require('../models/UidRequests');
const DocumentUpload = require('../models/DocumentUpload');

router.get('/rddean-counts', async (req, res) => {
  try {
    // ✅ UID counts
   const approvedUIDs = await HodUidRequest.countDocuments({ adminAccept: true });
const totalUIDs = await HodUidRequest.countDocuments();
const pendingUIDs = totalUIDs - approvedUIDs;

const approvedPIDs = await DocumentUpload.countDocuments({ adminAccept: true });
const totalPIDs = await DocumentUpload.countDocuments();
const pendingPIDs = totalPIDs - approvedPIDs;

    res.json({
      approvedUIDs,
      pendingUIDs,
      totalUIDs,
      approvedPIDs,
      pendingPIDs,
      totalPIDs
    });
  } catch (err) {
    console.error('Error in /rddean-counts:', err);
    res.status(500).json({ message: 'Failed to fetch R&D Dean counts' });
  }
});


router.get('/counts/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    // const totalUIDs = await HodUidRequest.countDocuments({ facultyId });
    // ✅ UID counts (only approved if RDCoordinatorAccept is true)
    const approvedUIDs = await HodUidRequest.countDocuments({ facultyId, adminAccept: true });
    const totalUIDs = await HodUidRequest.countDocuments({ facultyId });
    const pendingUIDs = totalUIDs - approvedUIDs;
    const totalPIDs = await DocumentUpload.countDocuments({ userId: facultyId });
    // ✅ PID counts (approved if adminAccept is true)
    const approvedPIDs = await DocumentUpload.countDocuments({ userId: facultyId, adminAccept: true });
    // const totalPIDs = await DocumentUpload.countDocuments({ userId: facultyId });
    const pendingPIDs = totalPIDs - approvedPIDs;

    res.json({totalUIDs, totalPIDs, approvedUIDs, pendingUIDs, approvedPIDs, pendingPIDs });
  } catch (err) {
    console.error('Error fetching dashboard counts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;