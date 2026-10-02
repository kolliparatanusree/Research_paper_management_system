const express = require("express");
const router = express.Router();

const Users = require("../models/User");
const UidRequests = require("../models/UidRequests");
const DocumentUpload = require("../models/DocumentUpload");

/*
=========================================================
UID REQUEST ANALYTICS
GET /api/hod/uid-requests/:department
=========================================================
*/
router.get("/uid-requests/:department", async (req, res) => {
  try {
    const { department } = req.params;

    const requests = await UidRequests.find({
      department: {
        $regex: `^${department}$`,
        $options: "i",
      },
    }).sort({ submittedAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("UID analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch UID analytics",
      error: error.message,
    });
  }
});


/*
=========================================================
PUBLICATION ANALYTICS
GET /api/hod/publications/:department
=========================================================
*/
router.get("/publications/:department", async (req, res) => {
  try {
    const { department } = req.params;

    /*
      DocumentUpload contains the uploaded publication
      information. We filter using department.
    */

    const publications = await DocumentUpload.find({
      department: {
        $regex: `^${department}$`,
        $options: "i",
      },
    }).sort({ uploadedAt: -1 });

    res.status(200).json(publications);
  } catch (error) {
    console.error("Publication analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch publication analytics",
      error: error.message,
    });
  }
});


module.exports = router;