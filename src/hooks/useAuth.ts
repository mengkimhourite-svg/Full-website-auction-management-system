import { useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { loginUser, logoutUser, getCurrentUser } from '@/services/auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        setError(null);
        try {
            const userData = await loginUser(email, password);
            setUser(userData);
            return userData;
        } catch (err) {
            const message =
                (err as AxiosError<{ message?: string }>).response?.data?.message ||
                'Invalid credentials.';
            setError(message);
            throw err;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await logoutUser();
        } catch {
            // ignore
        } finally {
            setUser(null);
        }
    };

    return { user, loading, error, login, logout, setUser };
};
