const Notification = require("../models/Notification");

const createNotification = async (
  receiverId,
  receiverRole,
  message,
  relatedUserId
) => {
  try {
    await Notification.create({
      receiverId,
      receiverRole,
      message,
      relatedUserId
    });
  } catch (err) {
    console.error("Notification Error:", err);
  }
};

module.exports = createNotification;