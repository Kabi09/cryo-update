const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../config/logger');

const createNotification = async ({
  recipientId = null,
  role = null,
  type,
  title,
  message,
  entityType = null,
  entityId = null
}) => {
  try {
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        type,
        title,
        message,
        entityType,
        entityId
      });
      return;
    }

    if (role) {
      const users = await User.find({ role, isActive: true }).select('_id');
      const notifications = users.map((u) => ({
        recipient: u._id,
        roleRecipient: role,
        type,
        title,
        message,
        entityType,
        entityId
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  } catch (error) {
    logger.error(`Failed to dispatch notification: ${error.message}`);
  }
};

module.exports = { createNotification };
