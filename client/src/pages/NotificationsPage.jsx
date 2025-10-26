import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { notificationAPI } from "../api";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getNotifications();
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="icon-like" />;
      case "comment":
        return <MessageCircle size={20} className="icon-comment" />;
      case "follow":
        return <UserPlus size={20} className="icon-follow" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    const senderName = notification.sender?.name || "Someone";
    switch (notification.type) {
      case "like":
        return `${senderName} liked your post`;
      case "comment":
        return `${senderName} commented on your post`;
      case "follow":
        return `${senderName} started following you`;
      default:
        return "New notification";
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notifications-page">
      <div className="notifications-header card">
        <h1>Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllAsRead} className="btn btn-outline">
            <Check size={18} /> Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications card">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item card ${
                !notification.isRead ? "unread" : ""
              }`}
              onClick={() =>
                !notification.isRead && markAsRead(notification._id)
              }
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <Link
                  to={`/profile/${notification.sender?._id}`}
                  className="notification-sender"
                >
                  <img
                    src={
                      notification.sender?.profilePicture ||
                      "https://via.placeholder.com/40"
                    }
                    alt={notification.sender?.username}
                  />
                </Link>
                <div className="notification-text">
                  <p>{getNotificationText(notification)}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {!notification.isRead && <div className="unread-indicator" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
