"use client";

import { useState } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { Menu, Bell, LogOut, Gavel } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
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
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Gavel size={14} />
              </span>
              <h2 className="text-sm font-semibold text-gray-900 hidden sm:block">Seller Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-indigo-600 transition-colors relative">
              <Bell size={19} />
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-600 transition-colors"
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
