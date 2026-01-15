import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiX,
  HiCheckCircle,
  HiExclamation,
  HiInformationCircle,
} from "react-icons/hi";
import { useNotifications } from "../../hooks/useNotifications";

// Simple time ago function
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "case_resolved":
    case "account_accepted":
      return <HiCheckCircle className="w-5 h-5 text-success-500" />;
    case "new_case_nearby":
    case "case_claimed":
      return <HiExclamation className="w-5 h-5 text-warning-500" />;
    default:
      return <HiInformationCircle className="w-5 h-5 text-primary-500" />;
  }
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isRead === b.isRead) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.isRead ? 1 : -1;
  });

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    setIsOpen(false);

    const user = JSON.parse(localStorage.getItem("user"));

    // Navigate based on notification type
    switch (notif.type) {
      case "case_resolved":
        navigate(
          user.role === "reporter"
            ? "/dashboard/reporter/history?filter=resolved"
            : "/dashboard/ngo/resolved"
        );
        break;
      case "case_claimed":
        navigate("/dashboard/reporter/history");
        break;
      case "new_case_nearby":
        navigate("/dashboard/ngo/live");
        break;
      case "account_accepted":
      case "account_rejected":
        navigate(
          user.role === "ngo" ? "/dashboard/ngo" : "/dashboard/reporter"
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-[-2rem] mt-2 w-[calc(100vw-3rem)] max-w-sm bg-surface rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header with Clear All */}
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-text-primary">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-text-muted">
                    ({unreadCount})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 font-medium hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-background rounded-full"
                >
                  <HiX className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <HiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-text-muted text-sm">
                    No notifications yet
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                sortedNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 border-b border-border hover:bg-background active:bg-background cursor-pointer transition-colors group ${
                      !notif.isRead ? "bg-primary-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-text-primary">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                          <span>🕒</span>
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-text-muted hover:text-error-500 active:text-error-500 transition-all flex-shrink-0"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
