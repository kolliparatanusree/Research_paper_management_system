const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  facultyId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  gender: { type: String, required: true },
  department: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Faculty', FacultySchema);
