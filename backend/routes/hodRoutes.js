const express = require('express');
const router = express.Router();
const HodUidRequest = require('../models/UidRequests');
const RejectedUid = require('../models/RejectedUid');
const Hod = require('../models/Hod');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Faculty = require('../models/Faculty');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tanusreekollipara@gmail.com', // Replace with your email
    pass: 'wtes romt gffu boib'          // Use Gmail App Password
  }
});

// HoD Registration
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, hodId, phoneNumber, gender, department, password } = req.body;

    const existingHod = await Hod.findOne({ email });
    if (existingHod) return res.status(400).json({ message: 'HoD already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newHod = new Hod({
      fullName,
      email,
      hodId,
      phoneNumber,
      gender,
      department,
      password: hashedPassword
    });

    await newHod.save();
    res.status(201).json({ message: 'HoD registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HoD Login
router.post('/login', async (req, res) => {
  try {
    const { hodId, password } = req.body;
    const hod = await Hod.findOne({ hodId });

    if (!hod) return res.status(404).json({ message: 'HoD not found' });

    const isMatch = await bcrypt.compare(password, hod.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', hod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/uid-request', async (req, res) => {
  try {
    const {
      facultyId,
      facultyName,
      department,
      paperTitle,
      type,
      abstract,
      target
    } = req.body;

    if (!facultyId || !paperTitle || !type || !abstract || !target) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRequest = new HodUidRequest({
      facultyId,
      facultyName,
      department,
      paperTitle,
      type,
      abstract,
      target,
      submittedAt: new Date(),
      hodAccept: false,
      principalAccept: false,
      adminAccept: false,
      status: 'Pending'
    });

    await newRequest.save();
    res.status(201).json({ message: 'UID request submitted successfully' });
  } catch (error) {
    console.error("Error creating UID request:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Submit UID Request from Faculty (with duplicate paperTitle check)
// router.post('/uid-request', async (req, res) => {
//   try {
//     const { facultyId, paperTitle } = req.body;

//     // Check for duplicate paperTitle for the same faculty (case insensitive)
//     const existing = await HodUidRequest.findOne({
//       facultyId,
//       paperTitle: { $regex: new RegExp(`^${paperTitle}$`, 'i') }
//     });

//     if (existing) {
//       return res.status(400).json({ message: 'This paper title already exists' });
//     }

//     const newRequest = new HodUidRequest(req.body);
//     await newRequest.save();

//     res.status(201).json({ message: 'UID request submitted successfully' });
//   } catch (err) {
//     console.error('Error creating UID request:', err);
//     res.status(500).json({ message: 'Failed to submit UID request' });
//   }
// });

// Get all UID requests (sorted newest first)
router.get('/uid-requests', async (req, res) => {
  try {
    const requests = await HodUidRequest.find().sort({ submittedAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch UID requests', error: err.message });
  }
});

// Get HoD profile by hodId
router.get('/:id', async (req, res) => {
  try {
    const hodId = req.params.id;
    console.log("Received HOD ID:", hodId);

    const hod = await Hod.findOne({ hodId });
    if (!hod) {
      return res.status(404).json({ message: 'HoD not found' });
    }

    res.json(hod);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject UID Request
router.put('/uid-request/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await HodUidRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const rejectedEntry = new RejectedUid({
      facultyId: request.facultyId,
      facultyName: request.facultyName,
      department: request.department,
      paperTitle: request.paperTitle,
      type: request.type,
      abstract: request.abstract,
      target: request.target,
      submittedAt: request.submittedAt,
      rejectedAt: new Date(),
      rejectedBy: 'hod',
      reason,
    });

    await rejectedEntry.save();
    await request.deleteOne();

    // Send rejection email to faculty
    const faculty = await Faculty.findOne({ facultyId: request.facultyId });
    if (faculty && faculty.email) {
      const mailOptions = {
        from: 'tanusreekollipara@gmail.com',
        to: faculty.email,
        subject: 'UID Request Rejected by HoD',
        text: `Dear ${request.facultyName},

Your UID request for the paper titled "${request.paperTitle}" has been rejected by the HoD.

Reason: ${reason}

You may modify the request and resubmit if necessary.

Regards,
SVECW HoD`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending HoD rejection email:', error);
        } else {
          console.log('HoD rejection email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'UID request rejected, logged, and email sent' });
  } catch (err) {
    console.error('Rejection failed:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Accept UID Request (set hodAccept: true)
router.put('/uid-request/:id/accept', async (req, res) => {
  try {
    const updated = await HodUidRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { hodAccept: true } },
      { new: true } // return updated document
    );

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'UID request accepted', updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept request' });
  }
});

module.exports = router;
