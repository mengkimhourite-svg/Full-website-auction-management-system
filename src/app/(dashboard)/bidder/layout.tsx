"use client";

import { useState } from "react";
import BidderSidebar from "@/components/bidder/BidderSidebar";
import { Menu, Bell, LogOut, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BidderLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="dashboard-layout">
      <BidderSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-700 lg:hidden transition-all"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Activity size={15} />
              </span>
              <h2 className="text-lg font-bold text-gray-900 hidden sm:block">Bidder Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="p-2.5 rounded-xl hover:bg-indigo-50 text-gray-500 hover:text-indigo-700 transition-all relative">
              <Bell size={20} />
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
