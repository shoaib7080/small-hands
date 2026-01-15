// server/src/routes/notificationRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../services/notificationService.js";

const router = express.Router();

// Get all notifications for user
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    console.log(`📋 Fetching notifications for user: ${req.user.id}`);
    
    const notifications = await getNotifications(
      req.user.id,
      parseInt(limit),
      parseInt(skip)
    );
    const unreadCount = await getUnreadCount(req.user.id);
    
    console.log(`📊 Found ${notifications.length} notifications, ${unreadCount} unread`);

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("❌ Notification fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get("/unread/count", protect, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark single notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.put("/read/all", protect, async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:id", protect, async (req, res) => {
  try {
    await deleteNotification(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
