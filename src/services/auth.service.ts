import axiosInstance from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  const res = await axiosInstance.post('/api/auth/login', { email, password });
  return res.data.data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/api/auth/logout');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await axiosInstance.get('/api/auth/me');
    return res.data.data;
  } catch {
    return null;
  }
};
