

const mongoose = require('mongoose');
const DocumentUpload = require('./DocumentUpload');

const coAuthorSchema = new mongoose.Schema({
  name: String,
  affiliation: String
}, { _id: false }); // _id: false to prevent auto-generating _id for each co-author


const UidRequestsScheme = new mongoose.Schema({
  userId: String,
  facultyId: String,
  facultyName: String,
  department: String,
  paperTitle: String,
  type: String,
  abstract: String,
  target: String,
//   status: { type: String, default: 'Pending' },
  submittedAt: { type: Date, default: Date.now },
  RDCordinatorAccept: { type: Boolean, default: false },
  hodAccept: { type: Boolean, default: false },
  principalAccept: { type: Boolean, default: false },
  adminAccept: { type: Boolean, default: false },
  uid: { type: String, default: null },
  documentsUpload: { type: Boolean, default: false },
   coAuthors: {
    hasCoAuthors: { type: Boolean, default: false },
    authors: [coAuthorSchema]
  }


//   remarks: { type: String, default: '' }
});

module.exports = mongoose.model('HodUidRequest', UidRequestsScheme);
// const mongoose = require('mongoose');

// const UidRequestsScheme = new mongoose.Schema({
//     facultyId: String,
//     title: String,
//     date: String,
//     doc: String,
//     status: String,
//     remarks: String
// });

// const HodUidRequest = mongoose.models.HodUidRequest || mongoose.model('HodUidRequest', UidRequestsScheme);

// module.exports = HodUidRequest;
