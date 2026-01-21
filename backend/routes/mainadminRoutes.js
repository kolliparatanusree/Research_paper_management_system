const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');




// Route to add user
router.post('/add-user', async (req, res) => {
  try {
    const { fullName, email, password, role, userId, phoneNumber, gender, department } = req.body;

    // Check if userId or email already exists
    const existing = await User.findOne({ $or: [{ userId }, { email }] });
    if (existing) return res.status(400).json({ message: 'User ID or Email already exists' });

    const user = new User({
      fullName,
      email,
      password,
      role,
      userId,
      phoneNumber,
      gender,
      department
    });

    await user.save();

    res.status(201).json({ message: 'User added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

/* ADD USER */
// router.post('/add-user', async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       password,
//       role,
//       userId,
//       phoneNumber,
//       gender,
//       department
//     } = req.body;

//     // 🔍 Check existing user
//     const existingUser = await User.findOne({
//       $or: [{ email }, { userId }]
//     });

//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // 🔐 HASH PASSWORD HERE
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       fullName,
//       email,
//       password: hashedPassword,   // 👈 IMPORTANT
//       role,
//       userId,
//       phoneNumber,
//       gender,
//       department
//     });

//     await user.save();
//     res.status(201).json({ message: 'User added successfully' });

//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: err.message });
//   }
// });


/* GET ALL USERS */
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

module.exports = router;

router.get('/faculties', async (req, res) => {
  try {
    // Fetch users where role is 'faculty'
    const faculties = await User.find({ role: 'faculty' });
    res.json(faculties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all HODs
router.get('/hods', async (req, res) => {
  const hods = await User.find({ role: 'hod' });
  res.json(hods);
});

/* LOGIN USER */
router.post('/login', async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    // 1. Check user exists with role
    const user = await User.findOne({ userId, role });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Success (no password sent)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        userId: user.userId,
        role: user.role,
        department: user.department
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const Faculty = require('../models/Faculty');
// const Hod = require('../models/Hod');

// router.post('/add-faculty', async (req, res) => {
//   try {
//     const { fullName, email, password, facultyId, phoneNumber, gender, department } = req.body;

//     // Check if any field is already registered
//     const existingFaculty = await Faculty.findOne({
//       $or: [
//         { email },
//         { facultyId },
//         { phoneNumber }
//       ]
//     });

//     if (existingFaculty) {
//       let conflictField = '';
//       if (existingFaculty.email === email) conflictField = 'Email';
//       else if (existingFaculty.facultyId === facultyId) conflictField = 'Faculty ID';
//       else if (existingFaculty.phoneNumber === phoneNumber) conflictField = 'Phone Number';

//       return res.status(400).json({ message: `${conflictField} is already registered` });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const newFaculty = new Faculty({ fullName, email, password: hashed, facultyId, phoneNumber, gender, department });
//     await newFaculty.save();

//     res.status(201).json({ message: 'Faculty added successfully' });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// router.delete('/remove-faculty/:id', async (req, res) => {
//   try {
//     await Faculty.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Faculty removed permanently' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // GET all faculty members
// router.get('/faculties', async (req, res) => {
//   try {
//     const faculties = await Faculty.find();
//     res.json(faculties);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post('/add-hod', async (req, res) => {
//   try {
//     const { fullName, email, password, hodId, phoneNumber, gender, department } = req.body;

//     // Check if email or hodId already exists
//     const existingEmail = await Hod.findOne({ email });
//     if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

//     const existingHodId = await Hod.findOne({ hodId });
//     if (existingHodId) return res.status(400).json({ message: 'HOD ID already exists' });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newHod = new Hod({
//       fullName,
//       email,
//       password: hashedPassword,
//       hodId,
//       phoneNumber,
//       gender,
//       department
//     });

//     await newHod.save();
//     res.status(201).json({ message: 'HOD added successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get all HODs
// router.get('/hods', async (req, res) => {
//   try {
//     const hods = await Hod.find().select('-password'); // exclude password field
//     res.json(hods);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Remove HOD by id
// router.delete('/remove-hod/:id', async (req, res) => {
//   try {
//     const deleted = await Hod.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: 'HOD not found' });
//     }
//     res.json({ message: 'HOD removed successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Something went wrong while removing HOD.' });
//   }
// });



// module.exports = router;