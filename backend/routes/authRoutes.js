const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const User = require('../models/User');
// const crypto = require('crypto'); // ✅ REQUIRED
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const Notification = require("../models/Notification");
const otpStore = {};


router.post('/login', login);


const sendMail = require('../utils/sendMail');


// GET unread notification count for a user
router.get("/notifications/unread-count/:userId", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      receiverId: req.params.userId,
      isRead: false
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put('/notifications/mark-read/:receiverId', async (req, res) => {
  try {

    await Notification.updateMany(
      { receiverId: req.params.receiverId },
      { $set: { isRead: true } }
    );

    res.json({ message: "Notifications marked as read" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

router.put(
  '/update-profile/:userId',
  upload.single('profilePic'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const updateData = {};

      if (req.body.phoneNumber)
        updateData.phoneNumber = req.body.phoneNumber;

      if (req.body.educationDetails)
        updateData.educationDetails = req.body.educationDetails;

      if (req.body.experienceDetails)
        updateData.experienceDetails = req.body.experienceDetails;

      if (req.file) {
        updateData.profilePic = req.file.path.replace(/\\/g, "/");
      }

      const updatedUser = await User.findOneAndUpdate(
        { userId },
        updateData,
        { new: true }
      );

      res.json(updatedUser);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// router.put(
//   '/update-profile/:userId',
//   upload.single('profilePic'),
//   async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const updateData = {};

//       if (req.body.phoneNumber)
//         updateData.phoneNumber = req.body.phoneNumber;

//       if (req.body.educationDetails)
//         updateData.educationDetails = req.body.educationDetails;

//       if (req.body.experienceDetails)
//         updateData.experienceDetails = req.body.experienceDetails;

//       if (req.file)
//         updateData.profilePic = req.file.path;

//       await User.findOneAndUpdate({ userId }, updateData);

//       res.json({ message: 'Profile updated successfully' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );


router.put(
  '/complete-profile/:userId',
  upload.single('profilePic'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const updateData = {
        educationDetails: req.body.educationDetails,
        experienceDetails: req.body.experienceDetails,
        isProfileCompleted: true
      };

      // publications optional for now
      if (req.body.publications) {
        updateData.publications = JSON.parse(req.body.publications);
      }

      if (req.file) {
        updateData.profilePic = req.file.path;
      }

      const user = await User.findOneAndUpdate(
        { userId },
        updateData,
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Profile completed successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// router.put(
//   '/update-profile/:userId',
//   upload.single('profilePic'),
//   async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const updateData = {
//         phoneNumber: req.body.phoneNumber,
//         educationDetails: req.body.educationDetails,
//         experienceDetails: req.body.experienceDetails,
//       };

//       if (req.file) {
//         updateData.profilePic = req.file.path;
//       }

//       await User.findOneAndUpdate({ userId }, updateData);

//       res.json({ message: 'Profile updated successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );
// router.put(
//   '/complete-profile/:userId',
//   upload.single('profilePic'), // ⭐ IMPORTANT
//   async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const updateData = {
//         educationDetails: req.body.educationDetails,
//         experienceDetails: req.body.experienceDetails,
//         publications: JSON.parse(req.body.publications || '[]'),
//         isProfileCompleted: true
//       };

//       if (req.file) {
//         updateData.profilePic = req.file.path;
//       }

//       await User.findOneAndUpdate({ userId }, updateData);

//       res.json({ message: 'Profile updated successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );
// PUT /api/users/complete-profile/:userId
// router.put('/complete-profile/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { educationDetails, experienceDetails, publications, isProfileCompleted } = req.body;

//     const user = await User.findOneAndUpdate(
//       { userId },
//       { educationDetails, experienceDetails, publications, isProfileCompleted },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.status(200).json({ message: 'Profile updated successfully', user });
//   } catch (err) {
//     console.error(err); // ✅ This will show the exact Mongo error
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// Change Password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check current password (plain text for simplicity; hash if using bcrypt)
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* FORGOT PASSWORD – SEND EMAIL */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("BODY:", req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP for testing:", otp);
    // store in memory
    otpStore[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000 // 10 min
    };

    await sendMail(
  email,
  'Your OTP for Password Reset',
  `<h2>Your OTP is: ${otp}</h2>`
);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
  console.error("Forgot password error:", err); // 👈 ADD THIS
  res.status(500).json({ message: 'Server error' });
}
});

// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const user = await User.findOne({ userId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const token = crypto
//       .createHash('sha256')
//       .update(user.userId + user.email)
//       .digest('hex');

//     const resetLink = `http://localhost:3000/reset-password/${user.userId}/${token}`;

//     await sendMail(
//       user.email,
//       'Reset Your Password',
//       `
//       <p>Dear ${user.fullName},</p>
//       <p>Click the link below to reset your password:</p>
//       <a href="${resetLink}">Reset Password</a>
//       <p>If you did not request this, please ignore this email.</p>
//       `
//     );

//     res.json({ message: 'Reset link sent to email' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });



router.post('/reset-password', async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    // ✅ basic validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // ✅ normalize email
    email = email.trim().toLowerCase();

    // ✅ check OTP record
    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // ✅ check OTP match
    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ check expiry
    if (record.expiry < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP expired' });
    }

    // ✅ find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ optional password strength check
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // ✅ update password (NO HASHING — as per your request)
    user.password = newPassword;
    await user.save();

    // ✅ clear OTP after success
    delete otpStore[email];

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const record = otpStore[email];

//     if (!record) {
//       return res.status(400).json({ message: 'OTP not found' });
//     }

//     if (record.otp !== otp) {
//       return res.status(400).json({ message: 'Invalid OTP' });
//     }

//     if (record.expiry < Date.now()) {
//       return res.status(400).json({ message: 'OTP expired' });
//     }

//     const user = await User.findOne({ email });

// if (!user) {
//   return res.status(404).json({ message: 'User not found' });
// }

// user.password = newPassword;
// await user.save();

//     // clear OTP
//     delete otpStore[email];

//     res.json({ message: 'Password reset successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });


/* RESET PASSWORD */
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { userId, token, newPassword } = req.body;

//     const user = await User.findOne({ userId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const expectedToken = crypto
//       .createHash('sha256')
//       .update(user.userId + user.email)
//       .digest('hex');

//     if (token !== expectedToken) {
//       return res.status(400).json({ message: 'Invalid reset link' });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.json({ message: 'Password reset successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;



// const express = require('express');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// const router = express.Router();

// /**
//  * LOGIN
//  * POST /api/auth/login
//  */
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     if (!email || !password || !role) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const user = await User.findOne({ email, role });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.json({
//       success: true,
//       role: user.role,
//       userId: user.userId,
//       fullName: user.fullName
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
