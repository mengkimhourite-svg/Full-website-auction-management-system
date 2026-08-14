"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auth state is already loaded app-wide by AuthProvider (/api/auth/me is
  // fetched once per session there). Deriving the header user from it avoids
  // a second identical request on every admin page load.
  const { user } = useAuth();

  const currentUser: CurrentUser | null = useMemo(
    () =>
      user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          }
        : null,
    [user]
  );

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  function toggleTheme() {
    setDarkMode((prev) => {
      localStorage.setItem("admin-theme", prev ? "light" : "dark");
      return !prev;
    });
  }

  useEffect(() => {
    if (!currentUser) return;

    // Only the unread/total counts are needed for the bell badge — the
    // server returns a tiny summary payload instead of the full list.
    const fetchNotificationSummary = async () => {
      try {
        const res = await fetch("/api/notifications?summary=1", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        setNotificationCount(typeof json.unread === "number" ? json.unread : 0);
      } catch {}
    };

    fetchNotificationSummary();
    const interval = setInterval(fetchNotificationSummary, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  const userInitial = (currentUser?.name || "A").charAt(0).toUpperCase();
  const userName = currentUser?.name || "Admin";
  const userRole = currentUser?.role || "Administrator";

  return (
    <div className={`dashboard-layout dashboard-admin ${darkMode ? "dashboard-dark" : ""}`}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={darkMode ? "Switch to White mode" : "Switch to Dark mode"}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link href="/admin/notifications" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={userName}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {userInitial}
                  </span>
                )}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 leading-tight">{userName}</span>
                  <span className="text-[11px] text-gray-500 leading-tight">{userRole}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-150 hidden md:block ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-gray-200 shadow-xl py-1 z-50">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User size={14} className="text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Settings size={14} className="text-gray-400" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
