"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Shield } from "lucide-react";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                <Shield size={10} />
                {user.role}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-linear-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <User size={16} />
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
