"use client";

import NotificationItem from "./NotificationItem";
import { Bell } from "lucide-react";
import type { Notification } from "@/types";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export default function NotificationList({ notifications, onMarkRead }: NotificationListProps) {
  if (!notifications.length) {
    return (
      <div className="text-center py-16">
        <Bell size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-400 text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </div>
  );
}
