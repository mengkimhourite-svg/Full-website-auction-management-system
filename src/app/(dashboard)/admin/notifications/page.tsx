"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  BellDot,
  CheckCheck,
  Check,
  Trash2,
  MessageSquare,
  Gavel,
  CreditCard,
  AlertCircle,
  Info,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Notification } from "@/types";

type FilterTab = "all" | "unread" | "read";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      setNotifications(json.data || json.notifications || json || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    if (activeTab === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, activeTab]);

  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const stats = [
    { title: "Total", value: totalNotifications, icon: <Bell size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Unread", value: unreadCount, icon: <BellDot size={22} />, color: "from-amber-500 to-orange-500" },
    { title: "Read", value: readCount, icon: <CheckCheck size={22} />, color: "from-emerald-500 to-teal-500" },
  ];

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete notification");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete notification");
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("bid")) return <Gavel size={18} className="text-indigo-500" />;
    if (lower.includes("payment")) return <CreditCard size={18} className="text-emerald-500" />;
    if (lower.includes("auction")) return <Bell size={18} className="text-amber-500" />;
    if (lower.includes("warning") || lower.includes("alert")) return <AlertCircle size={18} className="text-red-500" />;
    return <Info size={18} className="text-blue-500" />;
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalNotifications },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: readCount },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Bell size={22} />}
        title="Notifications"
        description="Manage platform notifications"
      />

      {loading && <LoadingSpinner text="Loading notifications..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Bell size={28} />}
              title="No notifications found"
              description={
                activeTab === "unread"
                  ? "All caught up! No unread notifications"
                  : activeTab === "read"
                  ? "No read notifications yet"
                  : "No notifications yet"
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    notification.read
                      ? "bg-white border-gray-100"
                      : "bg-indigo-50/50 border-indigo-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notification.read ? "bg-gray-100" : "bg-indigo-100"
                  }`}>
                    {getNotificationIcon(notification.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {notification.userId && (
                        <span className="text-xs text-gray-400">
                          <MessageSquare size={12} className="inline mr-1" />
                          User: {notification.userId}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        <Check size={14} />
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
