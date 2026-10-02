// File: routes/dashboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

const HodUidRequest = require('../models/UidRequests');
const DocumentUpload = require('../models/DocumentUpload');

// =========================================================
// LANDING PAGE ANALYTICS
// =========================================================
router.get("/landing-analytics", async (req, res) => {
  try {

    // Total registered users
    const totalUsers = await User.countDocuments();

    // Total research / UID requests
    const totalResearchPapers =
      await HodUidRequest.countDocuments();

    // Fully approved UID requests
    const approvedPapers =
      await HodUidRequest.countDocuments({
        hodAccept: true,
        RDCordinatorAccept: true,
        principalAccept: true,
        adminAccept: true,
        uid: { $exists: true, $ne: "" }
      });

    // Published papers = PID assigned
    const publishedPapers =
      await DocumentUpload.countDocuments({
        pid: { $exists: true, $ne: "" }
      });

    // Monthly submissions for current year
    const currentYear = new Date().getFullYear();

    const monthlyData =
      await HodUidRequest.aggregate([
        {
          $match: {
            submittedAt: {
              $gte: new Date(
                `${currentYear}-01-01T00:00:00.000Z`
              ),
              $lt: new Date(
                `${currentYear + 1}-01-01T00:00:00.000Z`
              )
            }
          }
        },
        {
          $group: {
            _id: {
              $month: "$submittedAt"
            },
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            "_id": 1
          }
        }
      ]);

    const monthlySubmissions =
      Array.from(
        { length: 12 },
        (_, index) => {

          const monthNumber = index + 1;

          const found =
            monthlyData.find(
              item => item._id === monthNumber
            );

          return {
            month: new Date(
              currentYear,
              index,
              1
            ).toLocaleString(
              "en-US",
              {
                month: "short"
              }
            ),

            submissions:
              found ? found.count : 0
          };
        }
      );

    res.json({
      totalUsers,
      totalResearchPapers,
      approvedPapers,
      publishedPapers,
      currentYear,
      monthlySubmissions
    });

  } catch (error) {

    console.error(
      "Landing analytics error:",
      error
    );

    res.status(500).json({
      message: "Failed to load landing analytics"
    });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    // 📊 Monthly Submissions
    const monthly = await DocumentUpload.aggregate([
      {
        $group: {
          _id: { $month: "$uploadedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const monthlyFormatted = monthly.map(m => ({
      month: monthNames[m._id - 1],
      count: m.count
    }));

    // 🏫 Department-wise
    // const departments = await DocumentUpload.aggregate([
    //   {
    //     $group: {
    //       _id: "$department",
    //       count: { $sum: 1 }
    //     }
    //   }
    // ]);

    const departments = await DocumentUpload.aggregate([
  {
    $match: { adminAccept: true }
  },
  {
    $lookup: {
      from: "hoduidrequests",   // make sure collection name is correct
      localField: "uid",
      foreignField: "uid",
      as: "requestInfo"
    }
  },
  { $unwind: "$requestInfo" },
  {
    $group: {
      _id: "$requestInfo.department",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]);

    // 👨‍🏫 Top Faculty
    const topFaculty = await DocumentUpload.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 📂 Document Types
    const types = await DocumentUpload.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const typesFormatted = types.map(t => ({
      type: t._id,
      count: t.count
    }));

    res.json({
      monthly: monthlyFormatted,
      departments,
      topFaculty,
      types: typesFormatted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics fetch failed" });
  }
});

module.exports = router;
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