const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'hod', 'rdCoordinator', 'rdDean', 'principal'],
    required: true
  },
  phoneNumber: String,
  gender: String,
  department: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);


// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },

//   role: {
//     type: String,
//     enum: ['faculty', 'hod', 'rdCoordinator', 'rdDean'],
//     required: true
//   },

//   userId: { type: String, required: true, unique: true },

//   phoneNumber: String,
//   gender: String,
//   department: String,

//   isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);
