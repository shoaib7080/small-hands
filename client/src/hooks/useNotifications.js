import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useSocket } from "./useSocket";
import api from "../services/api";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  const fetchNotifications = async () => {
    try {
      console.log("📥 Fetching notifications from API...");
      const { data } = await api.get("/notifications");
      console.log("📋 Fetched notifications:", data);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };

  // Fetch notifications immediately on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up socket connection separately
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id || !socket) return;

    console.log("🔌 Connecting socket for user:", user.id, "Role:", user.role);

    // Connect socket and join user room
    socket?.emit("join", user.id);

    // Listen for join confirmation
    socket?.on("joined", (data) => {
      console.log("✅ Successfully joined room:", data);
    });

    const handleNotification = (notification) => {
      console.log("🔔 Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("joined");
    };
  }, [socket]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read/all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
