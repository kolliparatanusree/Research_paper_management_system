const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Faculty = require('../models/Faculty');
const HodUidRequest = require('../models/HodUidRequest');
const DocumentUpload = require('../models/DocumentUpload');
const RejectedUid = require('../models/RejectedUid');

const storage = multer.memoryStorage();
const upload = multer({ storage });


// 1️⃣ Faculty Registration
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, facultyId, phoneNumber, gender, department } = req.body;
    const existing = await Faculty.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Faculty already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({ fullName, email, password: hashed, facultyId, phoneNumber, gender, department });
    await newFaculty.save();
    res.status(201).json({ message: 'Faculty registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2️⃣ Faculty Login
router.post('/login', async (req, res) => {
  try {
    const { facultyId, password } = req.body;
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3️⃣ Get Faculty Details
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.params.id });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 4️⃣ UID Requests for a Faculty
router.get('/uid-requests/:facultyId', async (req, res) => {
  try {
    const requests = await HodUidRequest.find({ facultyId: req.params.facultyId });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch UID requests' });
  }
});


// 5️⃣ Rejected UIDs
router.get('/rejected-uids/:facultyId', async (req, res) => {
  try {
    const rejected = await RejectedUid.find({ facultyId: req.params.facultyId });
    res.json(rejected);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rejected requests' });
  }
});


// 6️⃣ Upload Documents (Acceptance + Indexing Proof)
router.post('/upload-documents', upload.fields([
  { name: 'acceptanceLetter', maxCount: 1 },
  { name: 'indexingProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const { facultyId, uid } = req.body;
    if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
    if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

    const acceptanceFile = req.files.acceptanceLetter[0];
    const indexingFile = req.files.indexingProof[0];

    const newDoc = new DocumentUpload({
      facultyId,
      uid,
      paperTitle: uidRecord.paperTitle,
      type: uidRecord.type,
      target: uidRecord.target,
      abstract: uidRecord.abstract,
      adminAccept: false,
      acceptanceLetter: {
        filename: acceptanceFile.originalname,
        contentType: acceptanceFile.mimetype,
        data: acceptanceFile.buffer
      },
      indexingProof: {
        filename: indexingFile.originalname,
        contentType: indexingFile.mimetype,
        data: indexingFile.buffer
      }
    });

    await newDoc.save();

    uidRecord.documentsUpload = true;
    await uidRecord.save();

    res.status(201).json({ message: 'Documents uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});


// 7️⃣ Approved UID Requests (Documents Upload Pending)
router.get('/approved-uid-requests/:facultyId', async (req, res) => {
  try {
    const rows = await HodUidRequest.find({
      facultyId: req.params.facultyId,
      hodAccept: true,
      principalAccept: true,
      adminAccept: true,
      documentsUpload: false
    });
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approved UID requests' });
  }
});


// 8️⃣ My Submissions
router.get('/my-submissions/:facultyId', async (req, res) => {
  try {
    const docs = await DocumentUpload.find({ facultyId: req.params.facultyId });
    const formatted = docs.map(doc => ({
      _id: doc._id,
      uid: doc.uid,
      paperTitle: doc.paperTitle,
      type: doc.type,
      target: doc.target,
      abstract: doc.abstract,
      uploadedAt: doc.uploadedAt,
      adminAccept:doc.adminAccept,
      isRejected:doc.isRejected,
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
    res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
  }
});


// router.get('/all-submitted-documents', async (req, res) => {
//   try {
//     const docs = await DocumentUpload.find();

//     const formatted = docs.map(doc => ({
//       _id: doc._id,
//       facultyId: doc.facultyId,
//       uid: doc.uid,
//       paperTitle: doc.paperTitle,
//       type: doc.type,
//       target: doc.target,
//       uploadedAt: doc.uploadedAt,
//       adminAccept: doc.adminAccept,
//       acceptanceLetter: {
//         filename: doc.acceptanceLetter.filename,
//         contentType: doc.acceptanceLetter.contentType,
//         base64: doc.acceptanceLetter.data.toString('base64')
//       },
//       indexingProof: {
//         filename: doc.indexingProof.filename,
//         contentType: doc.indexingProof.contentType,
//         base64: doc.indexingProof.data.toString('base64')
//       }
//     }));

//     res.status(200).json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
//   }
// });



// 🔟 Admin Accept/Reject Submitted Document
router.put('/documents/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;

    if (action === 'accept') {
      await DocumentUpload.findByIdAndUpdate(id, { adminAccept: true });
      return res.json({ message: 'Document accepted by admin' });
    }

    if (action === 'reject') {
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

      await DocumentUpload.findByIdAndUpdate(id, {
        adminAccept: false,
        adminRejectReason: reason
      });

      return res.json({ message: 'Document rejected by admin' });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    res.status(500).json({ message: 'Action failed', error: err.message });
  }
});

// GET /api/faculty/pid-status/:facultyId
router.get('/pid-status/:facultyId', async (req, res) => {
  const { facultyId } = req.params;
  try {
    const submissions = await DocumentUpload.find({ facultyId });
    console.log(submissions);
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching PID status:', err);
    res.status(500).json({ message: 'Failed to fetch PID status' });
  }
});

module.exports = router;
