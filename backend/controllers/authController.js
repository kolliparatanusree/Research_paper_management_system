// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// exports.login = async (req, res) => {
//   const { userId, password } = req.body;

//   try {
//     const user = await User.findOne({ userId });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // ✅ Compare plaintext password with hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

//     // ✅ Send full user object
//     res.status(200).json({
//       message: 'Login successful',
//       user
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };


const User = require('../models/User');

exports.login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user
    });
    // res.status(200).json({
    //   message: 'Login successful',
    //   user: {
    //     userId: user.userId,
    //     role: user.role,
    //     department: user.department
    //   }
    // });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
