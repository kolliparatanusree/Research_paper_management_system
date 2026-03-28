// routes/rdcoordinatorRoutes.js
const express = require('express');
const router = express.Router();
const HodUidRequest = require('../models/UidRequests'); // your schema
const User = require('../models/User'); // for fetching faculty email
const RejectedUid = require('../models/RejectedUid');

const nodemailer = require('nodemailer');
const Notification = require("../models/Notification");

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rpmssvecw@gmail.com',
    pass: 'opdh fgkm seaa qsvy'
  }
});

// ✅ GET pending UID requests for RD Coordinator (HOD approved, RD pending)
router.get('/uid-requests/:userId', async (req, res) => {
  try {
    const userid = req.params.userId;

    // Fetch RD Coordinator department from user profile
    // Assuming faculty collection has the department
    const Faculty = require('../models/User'); 
    const rdProfile = await Faculty.findOne({ userId: userid });
    if (!rdProfile) return res.status(404).json({ message: 'RD Coordinator not found' });

    const department = rdProfile.department;

    const requests = await HodUidRequest.find({
      department,
      hodAccept: true,
      RDCordinatorAccept: false
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Accept UID request
router.put('/uid-request/:id/accept/:userId', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await HodUidRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'UID request not found' });

    request.RDCordinatorAccept = true;
    await request.save();

    res.json({ message: 'UID request accepted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject UID request
// routes/rdcoordinatorRoutes.js
router.put('/uid-request/:id/reject/:userId', async (req, res) => {
  try {
    const { reason } = req.body;
    const { id, userId } = req.params;

    // find RD Coordinator
    const rd = await User.findOne({ role: "rdCoordinator", userId });
    if (!rd) {
      return res.status(404).json({ message: "RD Coordinator not found" });
    }

    // find UID request
    const request = await HodUidRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // department security check
    if (rd.department !== request.department) {
      return res.status(403).json({
        message: "You can reject only your department papers"
      });
    }

    // find faculty who submitted UID
    const faculty = await User.findOne({
      userId: request.facultyId,
      role: "faculty"
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const facultyEmail = faculty.email;

    // move to rejected collection
    const data = request.toObject();
    delete data._id;

    const rejectedEntry = new RejectedUid({
      ...data,
      rejectedAt: new Date(),
      rejectedBy: "rdcoordinator",
      reason
    });

    await rejectedEntry.save();

    // send email
    await transporter.sendMail({
      from: "rpmssvecw@gmail.com",
      to: facultyEmail,
      subject: "UID Rejected - RPMS SVECW",
      text: `UID Request Rejected by the ${request.department} RD Coordinator

Paper Title: ${request.paperTitle}
Faculty: ${request.facultyName}
Department: ${request.department}

Reason: ${reason}

Regards
RPMS SVECW`
    });

    // delete original request
    await request.deleteOne();

    res.status(200).json({
      message: "UID request rejected and mail sent to faculty"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

// GET pending UID requests for RD Coordinator (HOD approved but RD not yet)
router.get('/uid/pending/:department', async (req, res) => {
  try {
    const { department } = req.params;

    const count = await HodUidRequest.countDocuments({
      department,
      hodAccept: true,
      RDCordinatorAccept: false
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET approved UID requests for RD Coordinator
router.get('/uid/approved/:department', async (req, res) => {
  try {
    const { department } = req.params;

    const count = await HodUidRequest.countDocuments({
      department,
      RDCordinatorAccept: true
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;