const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty'); // ✅ Import Faculty model
const HodUidRequest = require('../models/HodUidRequest');
const RejectedUid = require('../models/RejectedUid');
const DocumentUpload = require('../models/DocumentUpload');
const bcrypt = require('bcryptjs');
const Document = require('../models/DocumentUpload');
const nodemailer = require('nodemailer');

// ✅ Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tanusreekollipara@gmail.com',
    pass: 'wtes romt gffu boib' // Use App Password
  }
});

// ✅ Register Route
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, adminId, gender } = req.body;
    const existingAdmin = await Admin.findOne({ email, adminId });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      adminId,
      gender
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UID Generation Helper
const generateUID = () => {
  return 'UID-' + Math.floor(100000 + Math.random() * 900000);
};

// ✅ UID Accept/Reject Route
router.put('/uid-request/:id/:status', async (req, res) => {
  const { id, status } = req.params;
  const { reason } = req.body;

  try {
    const request = await HodUidRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status === 'accept') {
      if (!request.uid) {
        request.uid = generateUID();
      }
      request.adminAccept = true;
      await request.save();

      // ✅ Get faculty email from Faculty collection
      const faculty = await Faculty.findOne({ facultyId: request.facultyId });
      if (!faculty || !faculty.email) {
        console.error("Faculty email not found for:", request.facultyId);
        return res.status(400).json({ message: 'Faculty email not found' });
      }

      const mailOptions = {
        from: 'tanusreekollipara@gmail.com',
        to: faculty.email,
        subject: 'UID Generated Successfully',
        text: `Dear ${request.facultyName},

Your UID request has been accepted. Your generated UID is: ${request.uid}

Thank you,
SVECW`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return res.status(200).json({ message: 'UID accepted and UID generated', uid: request.uid });

    } else if (status === 'reject') {
  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

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
    rejectedBy: 'admin',
    reason
  });

  await rejectedDoc.save();
  await request.deleteOne();

  // ✅ Fetch faculty email
  const faculty = await Faculty.findOne({ facultyId: request.facultyId });
  if (faculty && faculty.email) {
    const mailOptions = {
      from: 'tanusreekollipara@gmail.com',
      to: faculty.email,
      subject: 'UID Request Rejected',
      text: `Dear ${request.facultyName},

We regret to inform you that your UID request has been rejected by the Admin for the following reason:

"${reason}"

Please make the necessary corrections and resubmit your request if applicable.

Regards,  
SVECW Admin`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('UID Rejection Email Error:', error);
      } else {
        console.log('UID Rejection email sent:', info.response);
      }
    });
  }

  return res.status(200).json({ message: 'UID request rejected and moved to RejectedUids' });
} else {
      return res.status(400).json({ message: 'Invalid status' });
    }
  } catch (err) {
    console.error('Admin UID decision error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/all-submitted-documents', async (req, res) => {
  try {
    const docs = await DocumentUpload.find({
      adminAccept: false,
      isRejected: false
    });

    const formatted = docs.map(doc => ({
      _id: doc._id,
      facultyId: doc.facultyId,
      uid: doc.uid,
      paperTitle: doc.paperTitle,
      type: doc.type,
      target: doc.target,
      abstract: doc.abstract,
      uploadedAt: doc.uploadedAt,
      adminAccept: doc.adminAccept,
      issn: doc.issn,
      scopusLink: doc.scopusLink, // ✅ Add scopus link
      acceptanceLetter: doc.acceptanceLetter?.data ? {
        filename: doc.acceptanceLetter.filename,
        contentType: doc.acceptanceLetter.contentType,
        base64: doc.acceptanceLetter.data.toString('base64')
      } : null,
      indexingProof: doc.indexingProof?.data ? {
        filename: doc.indexingProof.filename,
        contentType: doc.indexingProof.contentType,
        base64: doc.indexingProof.data.toString('base64')
      } : null,
      paymentReceipt: doc.paymentReceipt?.data ? { // ✅ Fixed typo from "paymentReciept"
        filename: doc.paymentReceipt.filename,
        contentType: doc.paymentReceipt.contentType,
        base64: doc.paymentReceipt.data.toString('base64')
      } : null
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
});


// ✅ Get All Submitted Documents
// router.get('/all-submitted-documents', async (req, res) => {
//   try {
//     const docs = await DocumentUpload.find({
//       adminAccept: false,
//       isRejected: false
//     });

//     const formatted = docs.map(doc => ({
//       _id: doc._id,
//       facultyId: doc.facultyId,
//       uid: doc.uid,
//       paperTitle: doc.paperTitle,
//       type: doc.type,
//       target: doc.target,
//       abstract: doc.abstract,
//       uploadedAt: doc.uploadedAt,
//       adminAccept: doc.adminAccept,
//       issn: doc.issn,
//       doc1: doc.doc1,
//       acceptanceLetter: {
//         filename: doc.acceptanceLetter.filename,
//         contentType: doc.acceptanceLetter.contentType,
//         base64: doc.acceptanceLetter.data.toString('base64')
//       },
//       indexingProof: {
//         filename: doc.indexingProof.filename,
//         contentType: doc.indexingProof.contentType,
//         base64: doc.indexingProof.data.toString('base64')
//       },
//       paymentReciept: {
//       filename: doc.paymentReciept?.filename,
//       contentType: doc.paymentReciept?.contentType,
//       base64: doc.paymentReciept?.data?.toString('base64')
//     }
//     }));

//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
//   }
// });


// console.log('Fetched Documents:', docs);

// ✅ Accept Document Submission
// ✅ Accept Document Submission and Send Email with PID
router.put('/document-submission/:id/accept', async (req, res) => {
  const { id } = req.params;
  try {
    const prefix = 'PID' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Document.countDocuments({ pid: { $regex: `^${prefix}` } });
    const pid = `${prefix}_${(count + 1).toString().padStart(4, '0')}`;

    const updated = await Document.findByIdAndUpdate(
      id,
      { pid, accepted: true, adminAccept: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Document not found' });

    // ✅ Fetch faculty email from Faculty collection
    const faculty = await Faculty.findOne({ facultyId: updated.facultyId });
    if (!faculty || !faculty.email) {
      console.error("Faculty email not found for:", updated.facultyId);
      return res.status(400).json({ message: 'Faculty email not found' });
    }

    // ✅ Send PID email
    const mailOptions = {
      from: 'tanusreekollipara@gmail.com',
      to: faculty.email,
      subject: 'PID Generated Successfully',
      text: `Dear Faculty,

Your document has been accepted by Admin. Your generated PID is: ${pid}

Thank you,
SVECW Admin Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending PID email:', error);
      } else {
        console.log('PID Email sent: ' + info.response);
      }
    });

    res.json({ message: 'Submission accepted and PID generated.', pid });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Reject Document Submission
// ✅ Reject Document Submission and Notify Faculty
router.put('/document-submission/:id/reject', async (req, res) => {
  const { reason } = req.body;

  try {
    const submission = await DocumentUpload.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Document not found' });
    }

    submission.rejectionReason = reason;
    submission.isRejected = true;
    await submission.save();

    // ✅ Fetch faculty email
    const faculty = await Faculty.findOne({ facultyId: submission.facultyId });
    if (faculty && faculty.email) {
      const mailOptions = {
        from: 'tanusreekollipara@gmail.com',
        to: faculty.email,
        subject: 'Document Submission Rejected',
        text: `Dear Faculty,

Your document submission was rejected by Admin for the following reason:
"${reason}"

Please review and resubmit if needed.

Regards,
SVECW Admin`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Rejection Email Error:', error);
        } else {
          console.log('Rejection email sent: ' + info.response);
        }
      });
    }

    res.status(200).json({ message: 'Document rejected and email sent (if applicable).' });

  } catch (error) {
    console.error('Error rejecting document:', error);
    res.status(500).json({ error: 'Failed to reject the document' });
  }
});

// ✅ Get All Approved PIDs
router.get('/approved-pids', async (req, res) => {
  try {
    const approved = await DocumentUpload.find({
      adminAccept: true,
      pid: { $exists: true, $ne: null }
    });

    const formatted = approved.map(doc => ({
      _id: doc._id,
      facultyId: doc.facultyId,
      uid: doc.uid,
      paperTitle: doc.paperTitle,
      type: doc.type,
      target: doc.target,
      abstract: doc.abstract,
      pid: doc.pid,
      uploadedAt: doc.uploadedAt,
      acceptanceLetter: {
        filename: doc.acceptanceLetter.filename,
        contentType: doc.acceptanceLetter.contentType,
        base64: doc.acceptanceLetter.data.toString('base64')
      },
      indexingProof: {
        filename: doc.indexingProof.filename,
        contentType: doc.indexingProof.contentType,
        base64: doc.indexingProof.data.toString('base64')
      }
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approved PIDs', error: err.message });
  }
});

module.exports = router;
