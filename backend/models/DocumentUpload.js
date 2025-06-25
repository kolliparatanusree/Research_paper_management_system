const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  uid: { type: String, required: true },
  paperTitle: String,
  type: String,
  target: String,
  abstract: String, 
  acceptanceLetter: {
    filename: String,
    contentType: String,
    data: Buffer
  },
  indexingProof: {
    filename: String,
    contentType: String,
    data: Buffer
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  adminAccept:{
    type:Boolean,
    default:false
  },
  adminRejectReason: {
  type: String,
  default: ''
},
isRejected: { type: Boolean, default: false },
pid: { type: String, default: null },
});

module.exports = mongoose.model('DocumentUpload', documentSchema);
