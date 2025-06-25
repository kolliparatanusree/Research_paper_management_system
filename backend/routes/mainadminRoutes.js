const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');
const Hod = require('../models/Hod');

router.post('/add-faculty', async (req, res) => {
  try {
    const { fullName, email, password, facultyId, phoneNumber, gender, department } = req.body;

    // Check if any field is already registered
    const existingFaculty = await Faculty.findOne({
      $or: [
        { email },
        { facultyId },
        { phoneNumber }
      ]
    });

    if (existingFaculty) {
      let conflictField = '';
      if (existingFaculty.email === email) conflictField = 'Email';
      else if (existingFaculty.facultyId === facultyId) conflictField = 'Faculty ID';
      else if (existingFaculty.phoneNumber === phoneNumber) conflictField = 'Phone Number';

      return res.status(400).json({ message: `${conflictField} is already registered` });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({ fullName, email, password: hashed, facultyId, phoneNumber, gender, department });
    await newFaculty.save();

    res.status(201).json({ message: 'Faculty added successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/remove-faculty/:id', async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty removed permanently' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all faculty members
router.get('/faculties', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add-hod', async (req, res) => {
  try {
    const { fullName, email, password, hodId, phoneNumber, gender, department } = req.body;

    // Check if email or hodId already exists
    const existingEmail = await Hod.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    const existingHodId = await Hod.findOne({ hodId });
    if (existingHodId) return res.status(400).json({ message: 'HOD ID already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newHod = new Hod({
      fullName,
      email,
      password: hashedPassword,
      hodId,
      phoneNumber,
      gender,
      department
    });

    await newHod.save();
    res.status(201).json({ message: 'HOD added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all HODs
router.get('/hods', async (req, res) => {
  try {
    const hods = await Hod.find().select('-password'); // exclude password field
    res.json(hods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove HOD by id
router.delete('/remove-hod/:id', async (req, res) => {
  try {
    const deleted = await Hod.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'HOD not found' });
    }
    res.json({ message: 'HOD removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong while removing HOD.' });
  }
});



module.exports = router;