const mongoose = require('mongoose');

const hodSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  hodId: String,
  phoneNumber: String,
  gender: String,
  department: String,
  // any other fields
});

// This line avoids OverwriteModelError by checking if model exists already
const Hod = mongoose.models.Hod || mongoose.model('Hod', hodSchema);

module.exports = Hod;
