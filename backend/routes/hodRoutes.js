const express = require('express');
const router = express.Router();
const User = require('../models/User'); // only User collection
const RejectedUid = require('../models/RejectedUid');
const HodUidRequest = require('../models/UidRequests'); // assuming UID requests are separate
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Notification = require("../models/Notification");
const user = require('../models/User');


// const router = express.Router();
const { isHOD } = require('../middleware/auth'); 
// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rpmssvecw@gmail.com',
    pass: 'opdh fgkm seaa qsvy'
  }
});

router.get("/uid/approved/:department", async (req, res) => {
  try {
    const count = await HodUidRequest.countDocuments({
      department: req.params.department,
      hodAccept: "true"
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting approved UID count" });
  }
});

router.get("/uid/pending/:department", async (req, res) => {
  try {
    const count = await HodUidRequest.countDocuments({
      department: req.params.department,
      hodAccept: "false"
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting pending UID count" });
  }
});

// Get logged-in HOD info
router.get("/me", async (req, res) => {
  try {
    const hodId = req.query.id; // send HOD id from frontend login session
    if (!hodId) return res.status(400).json({ message: "HOD ID required" });

    const hod = await User.findById(hodId).select("name dept email");
    if (!hod) return res.status(404).json({ message: "HOD not found" });

    res.json(hod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get faculty by department
// hodRoutes.js or hodController.js
// Get faculty list by HOD department
router.get("/faculty", async (req, res) => {
  try {
    const deptQuery = req.query.dept;
    if (!deptQuery) return res.status(400).json({ message: "Department required" });

    const faculty = await User.find({
      department: { $regex: `^${deptQuery}$`, $options: "i" },
      role: "faculty",
    });

    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single faculty by userId
router.get("/faculty-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Faculty userId required" });

    const faculty = await User.findOne({ userId, role: "faculty" });

    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/uid-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔍 find HOD
    const hod = await User.findOne({ role: 'hod', userId });

    if (!hod) {
      return res.status(404).json({ message: 'HoD not found' });
    }

    // ✅ only same department
    const requests = await HodUidRequest.find({
      department: hod.department,
      hodAccept: { $ne: true }
    }).sort({ submittedAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch UID requests',
      error: err.message
    });
  }
});



// Current route
router.get('/uid-requests', async (req, res) => {
  try {
    const requests = await HodUidRequest.find().sort({ submittedAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch UID requests', error: err.message });
  }
});


// ====== HOD Registration ======
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, userId, phoneNumber, gender, department, password } = req.body;

    const existingHod = await User.findOne({ userId });
    if (existingHod) return res.status(400).json({ message: 'HoD already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newHod = new User({
      fullName,
      email,
      userId,
      phoneNumber,
      gender,
      department,
      password: hashedPassword,
      role: 'hod'
    });

    await newHod.save();
    res.status(201).json({ message: 'HoD registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ====== HOD Login ======
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    const hod = await User.findOne({ role: 'hod', userId });
    if (!hod) return res.status(404).json({ message: 'HoD not found' });

    const isMatch = await bcrypt.compare(password, hod.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', hod });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ====== Get HOD profile ======
// Get HoD profile by userId
router.get('/:id', async (req, res) => {
  try {
    const hodId = req.params.id;
    console.log("Received HOD ID:", hodId);

    // Use User collection instead of Hod
    const hod = await User.findOne({ role: 'hod', userId: hodId });

    if (!hod) {
      return res.status(404).json({ message: 'HoD not found' });
    }

    // Optional: remove password before sending
    const { password, ...hodWithoutPassword } = hod._doc;

    res.json(hodWithoutPassword);
  } catch (error) {
    console.error("Error fetching HOD:", error);
    res.status(500).json({ message: 'Server error' });
  }
});




router.put('/uid-request/:id/reject/:userId', async (req, res) => {
  try {

    const { reason } = req.body;
    const { id, userId } = req.params;

    // find HOD
    const hod = await User.findOne({ role: "hod", userId });

    if (!hod) {
      return res.status(404).json({ message: "HoD not found" });
    }

    // find UID request
    const request = await HodUidRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // department security check
    if (hod.department !== request.department) {
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
      rejectedBy: "hod",
      reason
    });

    await rejectedEntry.save();

    // send email
    await transporter.sendMail({
      from: "rpmssvecw@gmail.com",
      to: facultyEmail,
      subject: "UID Rejected - RPMS SVECW",
      text: `UID Request Rejected by the ${request.department} HOD

Paper Title: ${request.paperTitle}
Faculty: ${request.facultyName}
Department: ${request.department}

Reason: ${reason}

Regards
RPMS SVECW`
    });

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

router.put('/uid-request/:id/reject/:userId', async (req, res) => {
  try {
    const { reason } = req.body;
    const { id, userId } = req.params;

    // 🔍 find HOD
    const hod = await User.findOne({ role: 'hod', userId });
    if (!hod) {
      return res.status(404).json({ message: 'HoD not found' });
    }

    // 🔍 find request
    const request = await HodUidRequest.findById(id);
    const faculty = await User.findOne({
  userId: request.facultyId,
  role: "faculty"
});
    
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
    
      const facultyEmail = faculty.email;
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // 🚨 CRITICAL SECURITY CHECK
    if (hod.department !== request.department) {
      return res.status(403).json({
        message: 'You can reject only your department papers'
      });
    }

    // ✅ move to rejected collection
    const rejectedEntry = new RejectedUid({
      ...request.toObject(),
      rejectedAt: new Date(),
      rejectedBy: 'hod',
      reason
    });

    await rejectedEntry.save();


    const mailOptions = {
    from: "rpmssvecw@gmail.com",
    to: facultyEmail,
    subject: "UID Rejected  RPMS SVECW",
    text: `UID Request Rejected

Paper Title: ${request.paperTitle}
Faculty: ${request.facultyName}
Department: ${request.department}
Your UID request has been rejected by the  ${request.department} HOD for the following reason:${reason}

Regards,
RPMS SVECW
`
  };

  await transporter.sendMail(mailOptions);
    
    await request.deleteOne();

    // // 📧 Send rejection email
    // const faculty = await User.findOne({
    //   role: 'faculty',
    //   userId: request.facultyId
    // });

    // if (faculty?.email) {
    //   await transporter.sendMail({
    //     from: 'tanusreekollipara@gmail.com',
    //     to: faculty.email,
    //     subject: 'UID Request Rejected by HoD',
    //     text: `Dear ${request.facultyName},\n\nYour UID request for "${request.paperTitle}" has been rejected.\nReason: ${reason}`
    //   });
    // }
    await Notification.create({
  receiverId: request.facultyId,
  receiverRole: "faculty",
  message: `Your UID request "${request.paperTitle}" was rejected by HOD. Reason: ${reason}`,
  relatedUserId: request.facultyId
});

    res.status(200).json({
      message: 'UID request rejected, logged, and email sent'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});
// ====== UID Requests (accept/reject) ======
// router.put('/uid-request/:id/reject', async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const request = await HodUidRequest.findById(req.params.id);
//     if (!request) return res.status(404).json({ message: 'Request not found' });

//     const rejectedEntry = new RejectedUid({
//       ...request.toObject(),
//       rejectedAt: new Date(),
//       rejectedBy: 'hod',
//       reason
//     });

//     await rejectedEntry.save();
//     await request.deleteOne();

//     // Send rejection email
//     const faculty = await User.findOne({ role: 'faculty', userId: request.facultyId });
//     if (faculty?.email) {
//       await transporter.sendMail({
//         from: 'tanusreekollipara@gmail.com',
//         to: faculty.email,
//         subject: 'UID Request Rejected by HoD',
//         text: `Dear ${request.facultyName},\n\nYour UID request for "${request.paperTitle}" has been rejected.\nReason: ${reason}`
//       });
//     }

//     res.status(200).json({ message: 'UID request rejected, logged, and email sent' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });


router.put('/uid-request/:id/accept/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const hod = await User.findOne({ role: 'hod', userId });
    const request = await HodUidRequest.findById(id);

    if (!hod || !request) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // 🚨 SECURITY CHECK
    if (hod.department !== request.department) {
      return res.status(403).json({
        message: 'You can only accept your department papers'
      });
    }

    request.hodAccept = true;
    await request.save();

    // 🔔 FIND PRINCIPAL
    const principal = await User.findOne({ role: "principal" });

    if (principal) {
      await Notification.create({
        receiverId: principal.userId,
        receiverRole: "principal",
        message: `HOD approved UID request for "${request.paperTitle}"`,
        relatedUserId: request.facultyId
      });
    }

    res.json({ message: 'UID request accepted' });

    res.json({ message: 'UID request accepted' });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to accept request',
      error: err.message
    });
  }
});

// router.put('/uid-request/:id/accept', async (req, res) => {
//   try {
//     const updated = await HodUidRequest.findByIdAndUpdate(
//       req.params.id,
//       { $set: { hodAccept: true } },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: 'Request not found' });

//     res.json({ message: 'UID request accepted', updated });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to accept request', error: err.message });
//   }
// });

module.exports = router;
