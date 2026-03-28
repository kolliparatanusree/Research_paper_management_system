const express = require('express');
const router = express.Router();
const HodUidRequest = require('../models/UidRequests');
const RejectedUid = require('../models/RejectedUid');
const nodemailer = require('nodemailer');
const Faculty = require('../models/Faculty'); // make sure the path is correct
const User = require("../models/User");
const Notification = require('../models/Notification');
const createNotification = require("../utils/createNotification");
const DocumentUpload = require('../models/DocumentUpload');
const user  = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rpmssvecw@gmail.com',         // Replace with your email
    pass: 'opdh fgkm seaa qsvy'
             // Use Gmail App Password
  }
});


// 3️⃣ Get all published papers (all depts)
router.get("/approved-papers", async (req, res) => {
// router.get("/principal-publications", async (req, res) => {
  try {

    const uidRequests = await HodUidRequest.find({
      adminAccept: true
    });

    const publications = await Promise.all(
      uidRequests.map(async (reqData) => {

        const uploadData = await DocumentUpload.findOne({
          uid: reqData.uid
        });

        if (!uploadData) return null;

        return {
          paperTitle: reqData.paperTitle,
          facultyName: reqData.facultyName,
          department: reqData.department,
          uid: reqData.uid,
          type: uploadData.type,
          target: uploadData.target,
          facultyId: uploadData.userId, // ✅ ADD THIS

          pid: uploadData.pid,
          issn: uploadData.issn,
          scopusLink: uploadData.scopusLink
        };
      })
    );

    res.json(publications.filter(Boolean));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/paper/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const paper = await DocumentUpload.findOne({ pid })
      .populate("facultyId", "fullName userId department");
    if (!paper) return res.status(404).json({ message: "Paper not found" });
    res.json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Get all faculty
router.get("/faculty", async (req, res) => {
  try {
    const facultyList = await User.find({ role: "faculty" }).select(
      "userId fullName email department profilePic"
    );
    res.json(facultyList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single faculty details
router.get("/faculty-details/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const faculty = await User.findOne({ userId, role: "faculty" });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all HODs
router.get("/hod", async (req, res) => {
  try {
    const hodList = await User.find({ role: "hod" }).select(
      "userId fullName email department profilePic"
    );
    res.json(hodList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single HOD details
router.get("/hod-details/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const hod = await User.findOne({ userId, role: "hod" });
    if (!hod) return res.status(404).json({ message: "HOD not found" });
    res.json(hod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/uid-requests', async (req, res) => {
  try {
    const requests = await HodUidRequest.find({
      hodAccept: true,
      RDCordinatorAccept: true,
      principalAccept: false
    }).sort({ submittedAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Principal UID fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Principal accepts UID request
router.put('/uid-request/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await HodUidRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // ✅ Ensure RD Coordinator approved before Principal acts
    // if (!request.rdCoordinatorAccept) {
    //   return res.status(403).json({ message: 'Request not yet approved by RD Coordinator' });
    // }

    request.principalAccept = true;
    await request.save();

    // Notify RD Dean
    const rdDean = await User.findOne({ role: "rdDean" });
    if (rdDean) {
      await Notification.create({
        receiverId: rdDean.userId,
        receiverRole: "rdDean",
        message: `Principal approved UID request for "${request.paperTitle}"`,
        relatedUserId: request.facultyId
      });
    }

    res.status(200).json({ message: 'Accepted by Principal' });
  } catch (err) {
    console.error('Error in Principal Accept:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Accept UID request by Principal
// PUT /api/principal/uid-request/:id/accept
// router.put('/uid-request/:id/accept', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Principal accepting request ID:", id);

//     const request = await HodUidRequest.findById(id);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     request.principalAccept = true;
//     await request.save();

//     const rdDean = await User.findOne({ role: "rdDean" });

//     if (rdDean) {
//       await Notification.create({
//         receiverId: rdDean.userId,
//         receiverRole: "rdDean",
//         message: `Principal approved UID request for "${request.paperTitle}"`,
//         relatedUserId: request.facultyId
//       });
//     }

//     return res.status(200).json({ message: 'Accepted by Principal' });
//   } catch (err) {
//     console.error('Error in Principal Accept:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// router.put('/uid-request/:id/reject', async (req, res) => {
//   const { id } = req.params;
//   const { reason } = req.body;

//   try {
//     console.log("Principal rejecting request ID:", id, "Reason:", reason);

//     if (!reason || reason.trim() === '') {
//       return res.status(400).json({ message: 'Rejection reason is required' });
//     }

//     const request = await HodUidRequest.findById(id);

//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     // ✅ Ensure RD Coordinator approved before Principal can reject
//     if (!request.rdCoordinatorAccept) {
//       return res.status(403).json({ message: 'Request not yet approved by RD Coordinator' });
//     }

//     const faculty = await user.findOne({ userId: request.facultyId });
//     if (!faculty) {
//       return res.status(404).json({ message: "Faculty not found" });
//     }

//     const facultyEmail = faculty.email;

//     // ✅ Save in RejectedUid collection
//     const rejectedDoc = new RejectedUid({
//       facultyId: request.facultyId,
//       facultyName: request.facultyName,
//       department: request.department,
//       paperTitle: request.paperTitle,
//       type: request.type,
//       abstract: request.abstract,
//       target: request.target,
//       submittedAt: request.submittedAt,
//       rejectedAt: new Date(),
//       rejectedBy: 'principal',
//       reason
//     });

//     await rejectedDoc.save();

//     // ✅ Send rejection email
//     await transporter.sendMail({
//       from: "rpmssvecw@gmail.com",
//       to: facultyEmail,
//       subject: "UID Request Rejected - RPMS SVECW",
//       text: `UID Request Rejected

// Paper Title: ${request.paperTitle}
// Faculty: ${request.facultyName}
// Department: ${request.department}

// Your UID request has been rejected by the Principal for the following reason: ${reason}

// Regards,
// RPMS SVECW`
//     });

//     // ✅ Remove from active requests
//     await request.deleteOne();

//     // 🔔 Create notification for faculty
//     await Notification.create({
//       receiverId: request.facultyId,
//       receiverRole: "faculty",
//       message: `Principal rejected your UID request "${request.paperTitle}". Reason: ${reason}`,
//       relatedUserId: request.facultyId
//     });

//     return res.status(200).json({
//       message: 'Request rejected and faculty notified'
//     });

//   } catch (err) {
//     console.error('Principal Rejection failed:', err);
//     return res.status(500).json({
//       message: 'Server error',
//       error: err.message
//     });
//   }
// });



router.put('/uid-request/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    console.log("Principal rejecting request ID:", id, "Reason:", reason);

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await HodUidRequest.findById(id);
    const faculty = await user.findOne({ userId: request.facultyId });
    
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
    
      const facultyEmail = faculty.email;

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // ✅ Save in rejected collection
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


    const mailOptions = {
    from: "rpmssvecw@gmail.com",
    to: facultyEmail,
    subject: "UID Rejected  RPMS SVECW",
    text: `UID Request Rejected

Paper Title: ${request.paperTitle}
Faculty: ${request.facultyName}
Department: ${request.department}
Your UID request has been rejected by the  Principal for the following reason:${reason}

Regards,
RPMS SVECW
`
  };

  await transporter.sendMail(mailOptions);

    // ✅ Delete from active requests
    await request.deleteOne();

    // 🔔 Create notification for faculty
    await Notification.create({
      receiverId: request.facultyId,
      receiverRole: "faculty",
      message: `Principal rejected your UID request "${request.paperTitle}". Reason: ${reason}`,
      relatedUserId: request.facultyId
    });

    return res.status(200).json({
      message: 'Request rejected and faculty notified'
    });

  } catch (err) {
    console.error('Principal Rejection failed:', err);
    return res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// Reject UID request by Principal
// PUT /api/principal/uid-request/:id/reject
// Reject UID request by Principal with email notification
// router.put('/uid-request/:id/reject', async (req, res) => {
//   const { id } = req.params;
//   const { reason } = req.body;

//   try {
//     console.log("Principal rejecting request ID:", id, "with reason:", reason);

//     if (!reason || reason.trim() === '') {
//       return res.status(400).json({ message: 'Rejection reason is required' });
//     }

//     const request = await HodUidRequest.findById(id);
//     if (!request) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     // Save to RejectedUid collection
//     const rejectedDoc = new RejectedUid({
//       facultyId: request.facultyId,
//       facultyName: request.facultyName,
//       department: request.department,
//       paperTitle: request.paperTitle,
//       type: request.type,
//       abstract: request.abstract,
//       target: request.target,
//       submittedAt: request.submittedAt,
//       rejectedAt: new Date(),
//       rejectedBy: 'principal',
//       reason
//     });

//     await rejectedDoc.save();
//     await request.deleteOne();

//     // Send email to faculty
//     const faculty = await Faculty.findOne({ facultyId: request.facultyId });
//     if (faculty && faculty.email) {
//       const mailOptions = {
//         from: 'tanusreekollipara@gmail.com',
//         to: faculty.email,
//         subject: 'UID Request Rejected by Principal',
//         text: `Dear ${request.facultyName},

// Your UID request for the paper titled "${request.paperTitle}" has been rejected by the Principal.

// Reason: ${reason}

// You may review the feedback and resubmit the request if needed.

// Regards,
// SVECW Principal`
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending Principal rejection email:', error);
//         } else {
//           console.log('Principal rejection email sent:', info.response);
//         }
//       });
//     }

//     return res.status(200).json({ message: 'Request rejected, logged, and email sent' });
//   } catch (err) {
//     console.error('Principal Rejection failed:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

module.exports = router;
