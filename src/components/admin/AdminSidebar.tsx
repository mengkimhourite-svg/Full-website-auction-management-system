"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
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

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`dashboard-sidebar ${open ? "open" : ""} flex flex-col`}
        style={{
          width: collapsed ? "72px" : undefined,
          transition: "width 0.25s ease, transform 0.25s ease",
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5 no-underline overflow-hidden">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shrink-0">
              <Image src="/logo.png" alt="AuctionPro" width={24} height={24} className="w-6 h-6 object-contain" />
            </span>
            {!collapsed && (
              <span className="sidebar-brand text-base font-bold text-white whitespace-nowrap">
                AuctionPro
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={16}
                className="transition-transform duration-250"
                style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className={`sidebar-section-label mb-2 ${collapsed ? "text-center text-[10px]" : ""}`}>
            {collapsed ? "•••" : "Admin Panel"}
          </p>
          <nav className="space-y-0.5">
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
                  <Icon size={17} className={`shrink-0 ${isActive ? "text-blue-600" : ""}`} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-3 border-t border-gray-100">
          <Link
            href="/"
            className={`sidebar-link text-gray-400 hover:text-red-500 ${collapsed ? "justify-center px-0" : ""}`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
