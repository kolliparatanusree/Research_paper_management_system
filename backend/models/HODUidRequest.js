const mongoose = require('mongoose');

const hodUidRequestSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  department: { type: String, required: true },
  paperTitle: { type: String, required: true },
  type: { type: String, required: true },
  abstract: { type: String, required: true },
  target: { type: String, required: true },
 uid: {
  type: String,
  unique: true,
  sparse: true, // ✅ allows many nulls without duplication
  default: null
},
// ✅ Fix here
  hodAccept: { type: Boolean, default: false },
  principalAccept: { type: Boolean, default: false },
  adminAccept: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  documentsUpload: {
  type: Boolean,
  default: false
}

});

module.exports = mongoose.model('HodUidRequest', hodUidRequestSchema);
