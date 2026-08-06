"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => setCurrentUser(json.data || json.user || json))
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white lg:hidden transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#05060a]" />
            </button>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={userName}
                    className="w-8 h-8 rounded-lg object-cover shadow-lg"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                    {userInitial}
                  </span>
                )}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-200 leading-tight">{userName}</span>
                  <span className="text-[11px] text-slate-500 leading-tight">{userRole}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-200 hidden md:block ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1119] border border-white/10 shadow-2xl shadow-black/50 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-sm font-semibold text-slate-200">{userName}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email || "admin@gmail.com"}</p>
                  </div>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <User size={15} className="text-slate-500" />
                    Profile
                  </button>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings size={15} className="text-slate-500" />
                    Settings
                  </button>
                  <div className="border-t border-white/5 mt-1.5 pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={15} />
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
