const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// // Get notifications for a user
// router.get("/:userId", async (req, res) => {

//   try {

//     const notifications = await Notification.find({
//       receiverId: req.params.userId
//     }).sort({ createdAt: -1 });

//     res.json(notifications);

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    const query = {
      receiverId: userId
    };

    if (role) {
      query.receiverRole = role;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    console.error("Notification fetch error:", err);

    res.status(500).json({
      message: "Failed to fetch notifications",
      error: err.message
    });
  }
});

module.exports = router;