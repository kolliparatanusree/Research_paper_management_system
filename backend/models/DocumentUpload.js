const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  uid: { type: String, required: true },
  paperTitle: String,
  type: String,
  target: String,
  abstract: String,

  publishedPaper: {
    pdf: {
      filename: String,
      contentType: {
        type: String,
        enum: ['application/pdf'], // Only allow PDFs
        default: 'application/pdf'
      },
      data: Buffer
    },
    doi: {
      type: String,
      default: ''
    }
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

  adminAccept: {
    type: Boolean,
    default: false
  },

  adminRejectReason: {
    type: String,
    default: ''
  },

  scopusLink: { type: String, default: '' },
  issn: String,

  paymentReceipt: {
    filename: String,
    contentType: String,
    data: Buffer
  },

  isRejected: { type: Boolean, default: false },
  pid: { type: String, default: null }
});

module.exports = mongoose.model('DocumentUpload', documentSchema);
