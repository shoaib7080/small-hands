// server/src/services/notificationService.js
import Notification from "../models/notificationModel.js";
import logger from "../utils/logger.js";

export const createNotification = async ({
  userId,
  userType,
  type,
  title,
  message,
  data = {},
  actionUrl = "",
  icon = "info",
}) => {
  try {
    const notification = new Notification({
      userId,
      userType,
      type,
      title,
      message,
      data,
      actionUrl,
      icon,
    });

    await notification.save();
    console.log(`📧 Notification created for ${userType} ${userId}:`, title);

    // Emit real-time notification via Socket.io
    const io = global.io; // Set in server.js
    if (io) {
      const roomName = `user_${userId}`;
      console.log(`🔔 Emitting to room: ${roomName}`);
      io.to(roomName).emit("notification", {
        _id: notification._id,
        type,
        title,
        message,
        icon,
        actionUrl,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } else {
      console.log("❌ Socket.io not available");
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotifications = async (userId, limit = 50, skip = 0) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

export const deleteNotification = async (notificationId) => {
  return Notification.findByIdAndDelete(notificationId);
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};
