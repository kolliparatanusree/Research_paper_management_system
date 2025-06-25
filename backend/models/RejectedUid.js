const mongoose = require('mongoose');

const rejectedUidSchema = new mongoose.Schema({
  facultyId: String,
  facultyName: String,
  department: String,
  paperTitle: String,
  type: String,
  abstract: String,
  target: String,
  submittedAt: Date,
  rejectedAt: Date,
  rejectedBy: String, // 'hod', 'principal', etc.
  reason: String
});

module.exports = mongoose.model('RejectedUid', rejectedUidSchema);
