import axiosInstance from "./api";
import type { Notification } from "@/types";

export type { Notification };

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await axiosInstance.get("/api/notifications");
  return res.data.data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await axiosInstance.put(`/api/notifications/${id}`, { read: true });
};

export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.put("/api/notifications/mark-all-read");
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/notifications/${id}`);
};
