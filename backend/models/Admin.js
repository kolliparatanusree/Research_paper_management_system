const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  facultyId: { type: String, required: true },
  adminId: { type: String, required: true },
  gender: { type: String, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema);
