import axiosInstance from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get('/api/users');
  return res.data.data;
};

export const updateUser = async (id: string, data: any): Promise<User> => {
  const res = await axiosInstance.put(`/api/users/${id}/update`, data);
  return res.data.data;
};

export const banUser = async (id: string): Promise<void> => {
  await axiosInstance.put(`/api/users/${id}/ban`);
};
