"use client";

import type { Notification } from "@/types";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <div
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${
        notification.read ? "bg-white" : "bg-indigo-50/50"
      } hover:bg-gray-50 border-b border-gray-50 last:border-b-0`}
    >
      <div
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          notification.read ? "bg-transparent" : "bg-indigo-600"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
}
