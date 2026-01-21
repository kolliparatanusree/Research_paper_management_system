const mongoose = require('mongoose');

const rdCoordinatorSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  rdCoordinatorId: { type: String, unique: true },
  phoneNumber: String,
  gender: String,
  department: String
}, { timestamps: true });

module.exports = mongoose.model('RDCoordinator', rdCoordinatorSchema);
