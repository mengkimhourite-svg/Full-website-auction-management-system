"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Home,
  Gavel,
  Package,
  DollarSign,
  Heart,
  Users,
  Bell,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const topLinks = [
  { label: "Dashboard", href: "/admin", icon: Home, exact: true },
  { label: "Auctions", href: "/admin/auctions", icon: Gavel },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Bids", href: "/admin/bids", icon: DollarSign },
  { label: "Watchlist", href: "/admin/watchlist", icon: Heart },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const bottomLinks = [
  { label: "Logout", href: "/", icon: LogOut },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`dashboard-sidebar ${open ? "open" : ""} flex flex-col`}
        style={{
          width: collapsed ? "72px" : undefined,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 no-underline overflow-hidden">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 shrink-0">
              <Trophy size={18} className="text-white" />
            </span>
            {!collapsed && (
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent whitespace-nowrap">
                AuctionHub
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={16}
                className="transition-transform duration-300"
                style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className={`sidebar-section-label mb-3 ${collapsed ? "text-center text-[10px]" : ""}`}>
            {collapsed ? "•••" : "Admin Panel"}
          </p>
          <nav className="space-y-1">
            {topLinks.map(({ label, href, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className={`shrink-0 ${isActive ? "text-blue-400" : ""}`} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-3 border-t border-white/5">
          {bottomLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link text-slate-400 hover:text-red-400 ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
