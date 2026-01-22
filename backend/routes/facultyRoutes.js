const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Faculty = require('../models/Faculty');
const HodUidRequest = require('../models/UidRequests');
const DocumentUpload = require('../models/DocumentUpload');
const RejectedUid = require('../models/RejectedUid');
const User = require('../models/User');
// import User from "../models/User.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });


// routes/faculty.js
router.get('/uploaded-uids/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // fetch uploaded documents for this user
    const uploads = await DocumentUpload.find({ userId });

    // return just the UIDs
    const uploadedUIDs = uploads.map((doc) => ({ uid: doc.uid }));

    res.json(uploadedUIDs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// router.get('/uploaded-uids/:facultyId', async (req, res) => {
//   try {
//     const { facultyId } = req.params;
//     const uploads = await DocumentUpload.find({ facultyId }, 'uid');
//     const uidList = uploads.map(doc => doc.uid);
//     res.json(uidList);
//   } catch (err) {
//     console.error("Error fetching uploaded UIDs:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


router.get('/faculty/:uid/upload-status', async (req, res) => {
  const { uid } = req.params;

  try {
    const document = await DocumentUpload.findOne({ uid });
    if (document) {
      return res.json({ uploaded: true });
    } else {
      return res.json({ uploaded: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET documents for specific faculty
router.get('/get-documents/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const documents = await DocumentUpload.find({ facultyId: new RegExp('^' + facultyId + '$', 'i') });
    res.json({ documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


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


router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      faculty: {
        fullName: user.fullName,
        userId: user.userId,
        department: user.department,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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



const uploadFields = upload.fields([
  { name: 'publishedPaperPdf', maxCount: 1 },
  { name: 'indexingProof', maxCount: 1 },
  { name: 'paymentReceipt', maxCount: 1 }
]);



router.post('/upload-documents', uploadFields, async (req, res) => {
  console.log("req.body:", req.body);
console.log("req.files:", req.files);
  try {
    console.log("Uploading document for userId:", req.body.userId, "uid:", req.body.uid);
    const {
      userId,
      uid,
      scopusLink,
      issn,
      doi
    } = req.body;

    if (!userId || !uid) {
      return res.status(400).json({ error: "userId and uid are required" });
    }

    // 🔒 Prevent duplicate uploads
    const alreadyUploaded = await DocumentUpload.findOne({ userId, uid });
    if (alreadyUploaded) {
      return res.status(409).json({
        message: "Documents already uploaded for this UID"
      });
    }

    const uidDetails = await HodUidRequest.findOne({ uid });
    if (!uidDetails) {
      return res.status(404).json({ error: "UID not found in HodUidRequest" });
    }

    const indexingProof = req.files['indexingProof']?.[0];
    const paymentReceipt = req.files['paymentReceipt']?.[0];
    const publishedPaperPdf = req.files['publishedPaperPdf']?.[0];

    const docUpload = new DocumentUpload({
      userId,
      uid,
      paperTitle: uidDetails.paperTitle,
      type: uidDetails.type,
      target: uidDetails.target,
      abstract: uidDetails.abstract,
      scopusLink: scopusLink || "",
      issn: issn || "",
      indexingProof: indexingProof && {
        filename: indexingProof.originalname,
        contentType: indexingProof.mimetype,
        data: indexingProof.buffer,
      },
      paymentReceipt: paymentReceipt && {
        filename: paymentReceipt.originalname,
        contentType: paymentReceipt.mimetype,
        data: paymentReceipt.buffer,
      },
      publishedPaper: publishedPaperPdf && {
        pdf: {
          filename: publishedPaperPdf.originalname,
          contentType: publishedPaperPdf.mimetype,
          data: publishedPaperPdf.buffer,
        },
        doi: doi || "",
      }
    });

    await docUpload.save();

    await HodUidRequest.updateOne(
      { uid },
      { $set: { documentUpload: true } }
    );

    res.status(200).json({ message: "Document uploaded successfully" });

  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// router.post('/upload-documents', uploadFields, async (req, res) => {
//   try {
//     const {
      
//       // facultyId,
//       uid,
//       paperTitle,
//       type,
//       target,
//       abstract,
//       scopusLink,
//       issn,
//     } = req.body;

//     console.log("Received values:", { scopusLink, issn });
//     console.log("Files received:", req.files);

//     const indexingProof = req.files['indexingProof']?.[0];
//     const paymentReceipt = req.files['paymentReceipt']?.[0];
//     const publishedPaperPdf = req.files['publishedPaperPdf']?.[0];

//     const uidDetails = await HodUidRequest.findOne({ uid });

//     if (!uidDetails) {
//       return res.status(404).json({ error: "UID not found in HodUidRequest" });
//     }
//     const { userId } = req.body;

// // // ✅ Ensure both IDs exist
// // if (userId && !facultyId) facultyId = userId;
// // else if (!userId && facultyId) userId = facultyId;


//     const docUpload = new DocumentUpload({
//       userId,
//       // facultyId,
//       uid,
//       paperTitle,
//       type: uidDetails.type,
//       target: uidDetails.target,
//       abstract: uidDetails.abstract,
//       scopusLink: scopusLink || "",
//       issn: issn || "",
//       indexingProof: indexingProof
//         ? {
//             filename: indexingProof.originalname,
//             contentType: indexingProof.mimetype,
//             data: indexingProof.buffer,
//           }
//         : undefined,
//       paymentReceipt: paymentReceipt
//         ? {
//             filename: paymentReceipt.originalname,
//             contentType: paymentReceipt.mimetype,
//             data: paymentReceipt.buffer,
//           }
//         : undefined,
//       publishedPaper: publishedPaperPdf
//         ? {
//             pdf: {
//               filename: publishedPaperPdf.originalname,
//               contentType: publishedPaperPdf.mimetype,
//               data: publishedPaperPdf.buffer,
//             },
//             doi: req.body.doi || "",
//           }
//         : undefined,
//     });

//     await docUpload.save();
//     await HodUidRequest.findOneAndUpdate(
//       { uid },
//       { $set: { documentUpload: true } }
//     );

//     res.status(200).json({ message: "Document uploaded successfully" });

//   } catch (error) {
//     console.error("Error uploading document:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// const upload = multer({ storage: multer.memoryStorage() });

// const uploadFields = upload.fields([
//   { name: 'publishedPaperPdf', maxCount: 1 },
//   { name: 'indexingProof', maxCount: 1 },
//   { name: 'paymentReceipt', maxCount: 1 }
// ]);

// router.post('/upload-documents', upload.fields([
//   { name: 'publishedPaperPdf', maxCount: 1 },
//   { name: 'indexingProof', maxCount: 1 },
//   { name: 'paymentReceipt', maxCount: 1 }
// ]), async (req, res) => {

//   try {
//     const {
//       facultyId,
//       uid,
//       paperTitle,
//       type,
//       target,
//       abstract,
//       scopusLink,
//       issn,
//     } = req.body;

//     console.log("Received values:", { scopusLink, issn });

//     const files = req.files;

//     const findFile = (fieldname) => {
//       return files.find((file) => file.fieldname === fieldname);
//     };

//     const indexingProof = req.files['indexingProof']?.[0];
//     const paymentReceipt = req.files['paymentReceipt']?.[0];
//     const publishedPaperPdf = req.files['publishedPaperPdf']?.[0]; // add if needed

//     console.log(req.body);

//     const uidDetails = await HodUidRequest.findOne({ uid });

//     if (!uidDetails) {
//       return res.status(404).json({ error: "UID not found in HodUidRequest" });
//     }

//     const docUpload = new DocumentUpload({
//       facultyId,
//       uid,
//       paperTitle,
//        type: uidDetails.type,             // ✅ fetched from HodUidRequest
//   target: uidDetails.target,         // ✅ fetched from HodUidRequest
//   abstract: uidDetails.abstract, 
//       scopusLink: scopusLink || "",
//       issn: issn || "",
//       indexingProof: indexingProof
//         ? {
//             filename: indexingProof.originalname,
//             contentType: indexingProof.mimetype,
//             data: indexingProof.buffer,
//           }
//         : undefined,
//       paymentReceipt: paymentReceipt
//         ? {
//             filename: paymentReceipt.originalname,
//             contentType: paymentReceipt.mimetype,
//             data: paymentReceipt.buffer,
//           }
//         : undefined,
//         publishedPaper: publishedPaperPdf
//   ? {
//       pdf: {
//         filename: publishedPaperPdf.originalname,
//         contentType: publishedPaperPdf.mimetype,
//         data: publishedPaperPdf.buffer,
//       },
//       doi: req.body.doi || "",
//     }
//   : undefined,

//     });

//     await docUpload.save();
//     await HodUidRequest.findOneAndUpdate(
//       { uid },
//       { $set: { documentUpload: true } }
//     );
//    res.status(200).json({ message: "Document uploaded successfully" });

//   } catch (error) {
//     console.error("Error uploading document:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// // ✅ Update Faculty document
// console.log("Updating documentsUpload for faculty:", facultyId);
// const facultyUpdateResult = await Faculty.findOneAndUpdate(
//   { facultyId: new RegExp('^' + facultyId + '$', 'i') },
//   { $set: { documentsUpload: true } },
//   { new: true }
// );
  
//     res.status(200).json({ message: "Document uploaded successfully" });
//   } catch (err) {
//     console.error("Error uploading documents:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// router.post('/upload-documents', upload.fields([
//   { name: 'acceptanceLetter', maxCount: 1 },
//   { name: 'indexingProof', maxCount: 1 },
//   { name: 'paymentReceipt', maxCount: 1 } 
// ]), async (req, res) => {
//   try {
//     const { facultyId, uid, scopusLink } = req.body;

//     if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
//     if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

//     const acceptanceFile = req.files.acceptanceLetter[0];
//     const indexingFile = req.files.indexingProof[0];
//     const paymentFile = req.files.paymentReceipt?.[0];

//     const newDoc = new DocumentUpload({
//       facultyId,
//       uid,
//       paperTitle: uidRecord.paperTitle,
//       type: uidRecord.type,
//       target: uidRecord.target,
//       abstract: uidRecord.abstract,
//       adminAccept: false,
//       acceptanceLetter: {
//         filename: acceptanceFile.originalname,
//         contentType: acceptanceFile.mimetype,
//         data: acceptanceFile.buffer
//       },
//       indexingProof: {
//         filename: indexingFile.originalname,
//         contentType: indexingFile.mimetype,
//         data: indexingFile.buffer
//       },
//       paymentReceipt: paymentFile ? {
//         filename: paymentFile.originalname,
//         contentType: paymentFile.mimetype,
//         data: paymentFile.buffer
//       } : undefined,
//       issn: uidRecord.issn,
//       doc: uidRecord.doc,
//       scopusLink: scopusLink || ""
//     });

//     await newDoc.save();

//     uidRecord.documentsUpload = true;
//     await uidRecord.save();

//     res.status(201).json({ message: 'Documents uploaded successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Upload failed', error: err.message });
//   }
// });



// 6️⃣ Upload Documents (Acceptance + Indexing Proof)
// router.post('/upload-documents', upload.fields([
//   { name: 'acceptanceLetter', maxCount: 1 },
//   { name: 'indexingProof', maxCount: 1 },
//   { name: 'paymentReceipt', maxCount: 1 } 
// ]), async (req, res) => {
//   try {
//     const { facultyId, uid } = req.body;
//     if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
//     if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

//     const acceptanceFile = req.files.acceptanceLetter[0];
//     const indexingFile = req.files.indexingProof[0];
//     const paymentFile = req.files.paymentReceipt?.[0]; // ✅ newly added


//     const newDoc = new DocumentUpload({
//       facultyId,
//       uid,
//       paperTitle: uidRecord.paperTitle,
//       type: uidRecord.type,
//       target: uidRecord.target,
//       abstract: uidRecord.abstract,
//       adminAccept: false,
//       acceptanceLetter: {
//         filename: acceptanceFile.originalname,
//         contentType: acceptanceFile.mimetype,
//         data: acceptanceFile.buffer
//       },
//       indexingProof: {
//         filename: indexingFile.originalname,
//         contentType: indexingFile.mimetype,
//         data: indexingFile.buffer
//       },

//       paymentReciept: paymentFile ? {
//   filename: paymentFile.originalname,
//   contentType: paymentFile.mimetype,
//   data: paymentFile.buffer
// } : undefined,

// issn: uidRecord.issn,
// doc: uidRecord.doc,

//     });

//     await newDoc.save();

// uidRecord.documentsUpload = true;
// console.log("Before saving UID record:", uidRecord);

// const result = await uidRecord.save();
// console.log("After saving UID record:", result);

// // Fallback if save doesn't work
// await HodUidRequest.updateOne(
//   { uid, facultyId },
//   { $set: { documentsUpload: true } }
// );


//     res.status(201).json({ message: 'Documents uploaded successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Upload failed', error: err.message });
//   }
// });

router.post('/uid-request', async (req, res) => {
  try {
    let {
      userId,
      facultyId,
      facultyName,
      department,
      paperTitle,
      type,
      abstract,
      target,
      coAuthors
    } = req.body;

    if (userId && !facultyId) facultyId = userId;
    else if (!userId && facultyId) userId = facultyId;

    // ✅ FORCE correct coAuthors structure
    if (!coAuthors || typeof coAuthors !== "object") {
      coAuthors = {
        hasCoAuthors: false,
        authors: []
      };
    }

    if (!Array.isArray(coAuthors.authors)) {
      coAuthors.authors = [];
    }

    const uidRequest = new HodUidRequest({
      facultyId,
      facultyName,
      department,
      paperTitle,
      type,
      abstract,
      target,
      coAuthors,

      RDCordinatorAccept: false,
      hodAccept: false,
      principalAccept: false,
      adminAccept: false,
      uid: null,
      documentsUpload: false,
      submittedAt: new Date()
    });

    await uidRequest.save();

    res.status(201).json({
      message: "UID request submitted successfully"
    });
  } catch (error) {
    console.error("UID REQUEST ERROR:", error);
    res.status(500).json({ error: error.message });
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


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: req.params.id },
      { password: 0 } // hide password
    );

    if (!user) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ Get Faculty Details
// router.get('/:id', async (req, res) => {
//   try {
//     // facultyRoutes.js
// const user = await User.findOne({ userId: req.params.id });

//     // const faculty = await Faculty.findOne({ facultyId: req.params.id });
//     if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
//     res.json(faculty);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const multer = require('multer');
// const Faculty = require('../models/Faculty');
// const HodUidRequest = require('../models/HodUidRequest');
// const DocumentUpload = require('../models/DocumentUpload');
// const RejectedUid = require('../models/RejectedUid');

// const storage = multer.memoryStorage();
// const upload = multer({ storage });


// // 1️⃣ Faculty Registration
// router.post('/register', async (req, res) => {
//   try {
//     const { fullName, email, password, facultyId, phoneNumber, gender, department } = req.body;
//     const existing = await Faculty.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Faculty already exists' });

//     const hashed = await bcrypt.hash(password, 10);
//     const newFaculty = new Faculty({ fullName, email, password: hashed, facultyId, phoneNumber, gender, department });
//     await newFaculty.save();
//     res.status(201).json({ message: 'Faculty registered successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // 2️⃣ Faculty Login
// router.post('/login', async (req, res) => {
//   try {
//     const { facultyId, password } = req.body;
//     const faculty = await Faculty.findOne({ facultyId });
//     if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

//     const isMatch = await bcrypt.compare(password, faculty.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     res.status(200).json({ message: 'Login successful', faculty });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // 3️⃣ Get Faculty Details
// router.get('/:id', async (req, res) => {
//   try {
//     const faculty = await Faculty.findOne({ facultyId: req.params.id });
//     if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
//     res.json(faculty);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // 4️⃣ UID Requests for a Faculty
// router.get('/uid-requests/:facultyId', async (req, res) => {
//   try {
//     const requests = await HodUidRequest.find({ facultyId: req.params.facultyId });
//     res.status(200).json(requests);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch UID requests' });
//   }
// });


// // 5️⃣ Rejected UIDs
// router.get('/rejected-uids/:facultyId', async (req, res) => {
//   try {
//     const rejected = await RejectedUid.find({ facultyId: req.params.facultyId });
//     res.json(rejected);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch rejected requests' });
//   }
// });


// // 6️⃣ Upload Documents (Acceptance + Indexing Proof)
// router.post('/upload-documents', upload.fields([
//   { name: 'acceptanceLetter', maxCount: 1 },
//   { name: 'indexingProof', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const { facultyId, uid } = req.body;
//     if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
//     if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

//     const acceptanceFile = req.files.acceptanceLetter[0];
//     const indexingFile = req.files.indexingProof[0];

//     const newDoc = new DocumentUpload({
//       facultyId,
//       uid,
//       paperTitle: uidRecord.paperTitle,
//       type: uidRecord.type,
//       target: uidRecord.target,
//       abstract: uidRecord.abstract,
//       adminAccept: false,
//       acceptanceLetter: {
//         filename: acceptanceFile.originalname,
//         contentType: acceptanceFile.mimetype,
//         data: acceptanceFile.buffer
//       },
//       indexingProof: {
//         filename: indexingFile.originalname,
//         contentType: indexingFile.mimetype,
//         data: indexingFile.buffer
//       }
//     });

//     await newDoc.save();

//     uidRecord.documentsUpload = true;
//     await uidRecord.save();

//     res.status(201).json({ message: 'Documents uploaded successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Upload failed', error: err.message });
//   }
// });


// // 7️⃣ Approved UID Requests (Documents Upload Pending)
// router.get('/approved-uid-requests/:facultyId', async (req, res) => {
//   try {
//     const rows = await HodUidRequest.find({
//       facultyId: req.params.facultyId,
//       hodAccept: true,
//       principalAccept: true,
//       adminAccept: true,
//       documentsUpload: false
//     });
//     res.status(200).json(rows);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch approved UID requests' });
//   }
// });


// // 8️⃣ My Submissions
// router.get('/my-submissions/:facultyId', async (req, res) => {
//   try {
//     const docs = await DocumentUpload.find({ facultyId: req.params.facultyId });
//     const formatted = docs.map(doc => ({
//       _id: doc._id,
//       uid: doc.uid,
//       paperTitle: doc.paperTitle,
//       type: doc.type,
//       target: doc.target,
//       abstract: doc.abstract,
//       uploadedAt: doc.uploadedAt,
//       adminAccept:doc.adminAccept,
//       isRejected:doc.isRejected,
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
//     res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
//   }
// });


// // router.get('/all-submitted-documents', async (req, res) => {
// //   try {
// //     const docs = await DocumentUpload.find();

// //     const formatted = docs.map(doc => ({
// //       _id: doc._id,
// //       facultyId: doc.facultyId,
// //       uid: doc.uid,
// //       paperTitle: doc.paperTitle,
// //       type: doc.type,
// //       target: doc.target,
// //       uploadedAt: doc.uploadedAt,
// //       adminAccept: doc.adminAccept,
// //       acceptanceLetter: {
// //         filename: doc.acceptanceLetter.filename,
// //         contentType: doc.acceptanceLetter.contentType,
// //         base64: doc.acceptanceLetter.data.toString('base64')
// //       },
// //       indexingProof: {
// //         filename: doc.indexingProof.filename,
// //         contentType: doc.indexingProof.contentType,
// //         base64: doc.indexingProof.data.toString('base64')
// //       }
// //     }));

// //     res.status(200).json(formatted);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
// //   }
// // });



// // 🔟 Admin Accept/Reject Submitted Document
// router.put('/documents/:id/:action', async (req, res) => {
//   try {
//     const { id, action } = req.params;

//     if (action === 'accept') {
//       await DocumentUpload.findByIdAndUpdate(id, { adminAccept: true });
//       return res.json({ message: 'Document accepted by admin' });
//     }

//     if (action === 'reject') {
//       const { reason } = req.body;
//       if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

//       await DocumentUpload.findByIdAndUpdate(id, {
//         adminAccept: false,
//         adminRejectReason: reason
//       });

//       return res.json({ message: 'Document rejected by admin' });
//     }

//     res.status(400).json({ message: 'Invalid action' });
//   } catch (err) {
//     res.status(500).json({ message: 'Action failed', error: err.message });
//   }
// });

// // GET /api/faculty/pid-status/:facultyId
// router.get('/pid-status/:facultyId', async (req, res) => {
//   const { facultyId } = req.params;
//   try {
//     const submissions = await DocumentUpload.find({ facultyId });
//     console.log(submissions);
//     res.json(submissions);
//   } catch (err) {
//     console.error('Error fetching PID status:', err);
//     res.status(500).json({ message: 'Failed to fetch PID status' });
//   }
// });

// module.exports = router;


// // const express = require('express');
// // const router = express.Router();
// // const bcrypt = require('bcryptjs');
// // const multer = require('multer');
// // const Faculty = require('../models/Faculty');
// // const HodUidRequest = require('../models/HodUidRequest');
// // const DocumentUpload = require('../models/DocumentUpload');
// // const RejectedUid = require('../models/RejectedUid');

// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });


// // // 1️⃣ Faculty Registration
// // router.post('/register', async (req, res) => {
// //   try {
// //     const { fullName, email, password, facultyId, phoneNumber, gender, department } = req.body;
// //     const existing = await Faculty.findOne({ email });
// //     if (existing) return res.status(400).json({ message: 'Faculty already exists' });

// //     const hashed = await bcrypt.hash(password, 10);
// //     const newFaculty = new Faculty({ fullName, email, password: hashed, facultyId, phoneNumber, gender, department });
// //     await newFaculty.save();
// //     res.status(201).json({ message: 'Faculty registered successfully' });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // // 2️⃣ Faculty Login
// // router.post('/login', async (req, res) => {
// //   try {
// //     const { facultyId, password } = req.body;
// //     const faculty = await Faculty.findOne({ facultyId });
// //     if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

// //     const isMatch = await bcrypt.compare(password, faculty.password);
// //     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

// //     res.status(200).json({ message: 'Login successful', faculty });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // // 3️⃣ Get Faculty Details
// // router.get('/:id', async (req, res) => {
// //   try {
// //     const faculty = await Faculty.findOne({ facultyId: req.params.id });
// //     if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
// //     res.json(faculty);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // });


// // // 4️⃣ UID Requests for a Faculty
// // router.get('/uid-requests/:facultyId', async (req, res) => {
// //   try {
// //     const requests = await HodUidRequest.find({ facultyId: req.params.facultyId });
// //     res.status(200).json(requests);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch UID requests' });
// //   }
// // });


// // // 5️⃣ Rejected UIDs
// // router.get('/rejected-uids/:facultyId', async (req, res) => {
// //   try {
// //     const rejected = await RejectedUid.find({ facultyId: req.params.facultyId });
// //     res.json(rejected);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch rejected requests' });
// //   }
// // });

// // // 6️⃣ Upload Documents (Acceptance + Indexing Proof)
// // router.post('/upload-documents', upload.fields([
// //   { name: 'acceptanceLetter', maxCount: 1 },
// //   { name: 'indexingProof', maxCount: 1 },
// //   { name: 'paymentReceipt', maxCount: 1 } 
// // ]), async (req, res) => {
// //   try {
// //     const { facultyId, uid, issn, doi } = req.body;

// //     if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
// //       return res.status(400).json({ message: 'Missing required fields' });
// //     }

// //     const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
// //     if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

// //     const acceptanceFile = req.files.acceptanceLetter[0];
// //     const indexingFile = req.files.indexingProof[0];
// //     const paymentFile = req.files.paymentReceipt?.[0];

// //     const newDoc = new DocumentUpload({
// //       facultyId,
// //       uid,
// //       paperTitle: uidRecord.paperTitle,
// //       type: uidRecord.type,
// //       target: uidRecord.target,
// //       abstract: uidRecord.abstract,
// //       adminAccept: false,
// //       acceptanceLetter: {
// //         filename: acceptanceFile.originalname,
// //         contentType: acceptanceFile.mimetype,
// //         data: acceptanceFile.buffer
// //       },
// //       indexingProof: {
// //         filename: indexingFile.originalname,
// //         contentType: indexingFile.mimetype,
// //         data: indexingFile.buffer
// //       },
// //       paymentReciept: paymentFile ? {
// //         filename: paymentFile.originalname,
// //         contentType: paymentFile.mimetype,
// //         data: paymentFile.buffer
// //       } : undefined,
// //       issn: req.body.issn,
// //       doi: req.body.doc
// //     });

// //     await newDoc.save();

// //     uidRecord.documentsUpload = true;
// //     await uidRecord.save();

// //     res.status(201).json({ message: 'Documents uploaded successfully' });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Upload failed', error: err.message });
// //   }
// // });

// // // 6️⃣ Upload Documents (Acceptance + Indexing Proof)
// // // router.post('/upload-documents', upload.fields([
// // //   { name: 'acceptanceLetter', maxCount: 1 },
// // //   { name: 'indexingProof', maxCount: 1 },
// // //   { name: 'paymentReceipt', maxCount: 1 } 
// // // ]), async (req, res) => {
// // //   try {

// // //     const { facultyId, uid, issn, doc } = req.body;

// // //     console.log('ISSN:', issn);
// // // console.log('DOC:', doc);
// // //     // const { facultyId, uid } = req.body;
// // //     if (!facultyId || !uid || !req.files.acceptanceLetter || !req.files.indexingProof) {
// // //       return res.status(400).json({ message: 'Missing required fields' });
// // //     }

// // //     const uidRecord = await HodUidRequest.findOne({ uid, facultyId });
// // //     if (!uidRecord) return res.status(404).json({ message: 'UID record not found' });

// // //     const acceptanceFile = req.files.acceptanceLetter[0];
// // //     const indexingFile = req.files.indexingProof[0];
// // //     const paymentFile = req.files.paymentReceipt?.[0]; // ✅ newly added


// // //     const newDoc = new DocumentUpload({
// // //       facultyId,
// // //       uid,
// // //       paperTitle: uidRecord.paperTitle,
// // //       type: uidRecord.type,
// // //       target: uidRecord.target,
// // //       abstract: uidRecord.abstract,
// // //       adminAccept: false,
// // //       acceptanceLetter: {
// // //         filename: acceptanceFile.originalname,
// // //         contentType: acceptanceFile.mimetype,
// // //         data: acceptanceFile.buffer
// // //       },
// // //       indexingProof: {
// // //         filename: indexingFile.originalname,
// // //         contentType: indexingFile.mimetype,
// // //         data: indexingFile.buffer
// // //       },

// // //       paymentReciept: paymentFile ? {
// // //   filename: paymentFile.originalname,
// // //   contentType: paymentFile.mimetype,
// // //   data: paymentFile.buffer
// // // } : undefined,

// // // issn: uidRecord.issn,
// // // doc: uidRecord.doc,

// // //     });

// // //     await newDoc.save();

// // //     uidRecord.documentsUpload = true;
// // //     await uidRecord.save();

// // //     res.status(201).json({ message: 'Documents uploaded successfully' });
// // //   } catch (err) {
// // //     res.status(500).json({ message: 'Upload failed', error: err.message });
// // //   }
// // // });




// // // 7️⃣ Approved UID Requests (Documents Upload Pending)
// // router.get('/approved-uid-requests/:facultyId', async (req, res) => {
// //   try {
// //     const rows = await HodUidRequest.find({
// //       facultyId: req.params.facultyId,
// //       hodAccept: true,
// //       principalAccept: true,
// //       adminAccept: true,
// //       documentsUpload: false
// //     });
// //     res.status(200).json(rows);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch approved UID requests' });
// //   }
// // });


// // // 8️⃣ My Submissions
// // router.get('/my-submissions/:facultyId', async (req, res) => {
// //   try {
// //     const docs = await DocumentUpload.find({ facultyId: req.params.facultyId });
// //     const formatted = docs.map(doc => ({
// //       _id: doc._id,
// //       uid: doc.uid,
// //       paperTitle: doc.paperTitle,
// //       type: doc.type,
// //       target: doc.target,
// //       abstract: doc.abstract,
// //       uploadedAt: doc.uploadedAt,
// //       adminAccept:doc.adminAccept,
// //       isRejected:doc.isRejected,
// //       acceptanceLetter: {
// //         filename: doc.acceptanceLetter.filename,
// //         contentType: doc.acceptanceLetter.contentType,
// //         base64: doc.acceptanceLetter.data.toString('base64')
// //       },
// //       indexingProof: {
// //         filename: doc.indexingProof.filename,
// //         contentType: doc.indexingProof.contentType,
// //         base64: doc.indexingProof.data.toString('base64')
// //       }
// //     }));

// //     res.status(200).json(formatted);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
// //   }
// // });


// // // router.get('/all-submitted-documents', async (req, res) => {
// // //   try {
// // //     const docs = await DocumentUpload.find();

// // //     const formatted = docs.map(doc => ({
// // //       _id: doc._id,
// // //       facultyId: doc.facultyId,
// // //       uid: doc.uid,
// // //       paperTitle: doc.paperTitle,
// // //       type: doc.type,
// // //       target: doc.target,
// // //       uploadedAt: doc.uploadedAt,
// // //       adminAccept: doc.adminAccept,
// // //       acceptanceLetter: {
// // //         filename: doc.acceptanceLetter.filename,
// // //         contentType: doc.acceptanceLetter.contentType,
// // //         base64: doc.acceptanceLetter.data.toString('base64')
// // //       },
// // //       indexingProof: {
// // //         filename: doc.indexingProof.filename,
// // //         contentType: doc.indexingProof.contentType,
// // //         base64: doc.indexingProof.data.toString('base64')
// // //       }
// // //     }));

// // //     res.status(200).json(formatted);
// // //   } catch (err) {
// // //     res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
// // //   }
// // // });



// // // 🔟 Admin Accept/Reject Submitted Document
// // router.put('/documents/:id/:action', async (req, res) => {
// //   try {
// //     const { id, action } = req.params;

// //     if (action === 'accept') {
// //       await DocumentUpload.findByIdAndUpdate(id, { adminAccept: true });
// //       return res.json({ message: 'Document accepted by admin' });
// //     }

// //     if (action === 'reject') {
// //       const { reason } = req.body;
// //       if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

// //       await DocumentUpload.findByIdAndUpdate(id, {
// //         adminAccept: false,
// //         adminRejectReason: reason
// //       });

// //       return res.json({ message: 'Document rejected by admin' });
// //     }

// //     res.status(400).json({ message: 'Invalid action' });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Action failed', error: err.message });
// //   }
// // });

// // // GET /api/faculty/pid-status/:facultyId
// // router.get('/pid-status/:facultyId', async (req, res) => {
// //   const { facultyId } = req.params;
// //   try {
// //     const submissions = await DocumentUpload.find({ facultyId });
// //     console.log(submissions);
// //     res.json(submissions);
// //   } catch (err) {
// //     console.error('Error fetching PID status:', err);
// //     res.status(500).json({ message: 'Failed to fetch PID status' });
// //   }
// // });

// // module.exports = router;
