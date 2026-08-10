"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginUser, logoutUser, getCurrentUser } from "@/services/auth.service";
import type { User } from "@/types";

export type { User };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearAllClientState = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore storage errors
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setError(null);
    clearAllClientState();
    setUser(null);

    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const axiosErr = err as { response?: { data?: { success?: boolean; error?: string; message?: string } } };
      const message =
        axiosErr?.response?.data?.error ||
        axiosErr?.response?.data?.message ||
        "Invalid credentials.";
      setError(message);
      throw err;
    }
  }, [clearAllClientState]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      setError(null);
      clearAllClientState();
    }
  }, [clearAllClientState]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
