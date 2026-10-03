const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { userId, password } = req.body;

  try {
    if (!userId || !password) {
      return res.status(400).json({
        message: 'User ID and password are required'
      });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    let isMatch = false;

    /*
     * =====================================================
     * PASSWORD VERIFICATION
     * =====================================================
     *
     * Existing accounts:
     * password is currently stored as plaintext.
     *
     * New accounts:
     * password will be stored as bcrypt hash.
     *
     * This allows both to work during migration.
     */

    const isBcryptHash =
      typeof user.password === 'string' &&
      (
        user.password.startsWith('$2a$') ||
        user.password.startsWith('$2b$') ||
        user.password.startsWith('$2y$')
      );

    if (isBcryptHash) {

      // New hashed password
      isMatch = await bcrypt.compare(
        password,
        user.password
      );

    } else {

      // Existing plaintext password
      isMatch = user.password === password;

      /*
       * If the old plaintext password is correct,
       * immediately convert it to a bcrypt hash.
       */
      if (isMatch) {

        user.password = await bcrypt.hash(password, 12);

        await user.save();

        console.log(
          `Password migrated to bcrypt for user: ${userId}`
        );
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    /*
     * =====================================================
     * DO NOT SEND PASSWORD / PASSWORD HASH TO FRONTEND
     * =====================================================
     */

    const userData = user.toObject();

    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      isProfileCompleted: user.isProfileCompleted
    });

  } catch (error) {

    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

// const User = require('../models/User');

// exports.login = async (req, res) => {
//   const { userId, password } = req.body;

//   try {
//     const user = await User.findOne({ userId });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.password !== password) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     res.status(200).json({
//       message: 'Login successful',
//       user,
//       isProfileCompleted: user.isProfileCompleted
//     });
  
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
