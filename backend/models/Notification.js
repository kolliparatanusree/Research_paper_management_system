const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  receiverId: {
    type: String,
    required: true
  },

  receiverRole: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  relatedUserId: {
    type: String
  },

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);