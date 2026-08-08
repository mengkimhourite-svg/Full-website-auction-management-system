"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => setCurrentUser(json.data || json.user || json))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((json) => {
        const notifs = json.data || json || [];
        if (Array.isArray(notifs)) {
          setNotificationCount(notifs.filter((n: { read?: boolean }) => !n.read).length);
        }
      })
      .catch(() => {});
  }, []);

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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const userInitial = (currentUser?.name || "A").charAt(0).toUpperCase();
  const userName = currentUser?.name || "Admin";
  const userRole = currentUser?.role || "Administrator";

  return (
    <div className="dashboard-layout dashboard-dark">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/notifications" className="relative p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={userName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {userInitial}
                  </span>
                )}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-200 leading-tight">{userName}</span>
                  <span className="text-[11px] text-slate-500 leading-tight">{userRole}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-150 hidden md:block ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg bg-[#1e293b] border border-white/10 shadow-xl py-1 z-50">
                  <div className="px-3.5 py-2.5 border-b border-white/5">
                    <p className="text-sm font-medium text-slate-200">{userName}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <User size={14} className="text-slate-500" />
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings size={14} className="text-slate-500" />
                    Settings
                  </Link>
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
