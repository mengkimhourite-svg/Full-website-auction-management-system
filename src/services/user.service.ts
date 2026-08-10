import axiosInstance from "./api";
import type { User, Role } from "@/types";

export type { User };

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: Role;
  avatar?: string | null;
  banned?: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get("/api/users");
  return res.data.data;
};

export const updateUser = async (id: string, data: UpdateUserInput): Promise<User> => {
  const res = await axiosInstance.put(`/api/users/${id}/update`, data);
  return res.data.data;
};

export const banUser = async (id: string): Promise<void> => {
  await axiosInstance.put(`/api/users/${id}/ban`);
};
