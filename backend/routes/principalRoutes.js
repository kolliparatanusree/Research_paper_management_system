const express = require('express');
const router = express.Router();
const HodUidRequest = require('../models/UidRequests');
const RejectedUid = require('../models/RejectedUid');
const nodemailer = require('nodemailer');
const Faculty = require('../models/Faculty'); // make sure the path is correct

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tanusreekollipara@gmail.com',         // Replace with your email
    pass: 'wtes romt gffu boib'
             // Use Gmail App Password
  }
});
// Accept UID request by Principal
// PUT /api/principal/uid-request/:id/accept
router.put('/uid-request/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Principal accepting request ID:", id);

    const request = await HodUidRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.principalAccept = true;
    await request.save();

    return res.status(200).json({ message: 'Accepted by Principal' });
  } catch (err) {
    console.error('Error in Principal Accept:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reject UID request by Principal
// PUT /api/principal/uid-request/:id/reject
// Reject UID request by Principal with email notification
router.put('/uid-request/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    console.log("Principal rejecting request ID:", id, "with reason:", reason);

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await HodUidRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Save to RejectedUid collection
    const rejectedDoc = new RejectedUid({
      facultyId: request.facultyId,
      facultyName: request.facultyName,
      department: request.department,
      paperTitle: request.paperTitle,
      type: request.type,
      abstract: request.abstract,
      target: request.target,
      submittedAt: request.submittedAt,
      rejectedAt: new Date(),
      rejectedBy: 'principal',
      reason
    });

    await rejectedDoc.save();
    await request.deleteOne();

    // Send email to faculty
    const faculty = await Faculty.findOne({ facultyId: request.facultyId });
    if (faculty && faculty.email) {
      const mailOptions = {
        from: 'tanusreekollipara@gmail.com',
        to: faculty.email,
        subject: 'UID Request Rejected by Principal',
        text: `Dear ${request.facultyName},

Your UID request for the paper titled "${request.paperTitle}" has been rejected by the Principal.

Reason: ${reason}

You may review the feedback and resubmit the request if needed.

Regards,
SVECW Principal`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending Principal rejection email:', error);
        } else {
          console.log('Principal rejection email sent:', info.response);
        }
      });
    }

    return res.status(200).json({ message: 'Request rejected, logged, and email sent' });
  } catch (err) {
    console.error('Principal Rejection failed:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
