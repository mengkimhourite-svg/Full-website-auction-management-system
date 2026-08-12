"use client";

import { useState, useEffect, useCallback } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { Menu, Bell, LogOut, Gavel } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      const notifs = json.data || json || [];
      if (Array.isArray(notifs)) {
        setNotificationCount(notifs.filter((n: { read?: boolean }) => !n.read).length);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  return (
    <div className="dashboard-layout dashboard-dark">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Gavel size={14} />
              </span>
              <h2 className="text-sm font-semibold text-gray-900 hidden sm:block">Seller Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
