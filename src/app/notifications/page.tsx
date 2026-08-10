"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, AlertCircle } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notification.service";
import type { Notification } from "@/types";
import NotificationList from "@/components/notification/NotificationList";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setError(null);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setError(null);
      } catch {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setError(null);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p className="text-gray-500 text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Error</h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchNotifications}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-indigo-600" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all bg-white"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
        </div>

        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkRead}
        />
      </div>
    </div>
  );
}
