"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, Users, Package, CreditCard, BarChart3, X, LogOut } from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { label: "Dashboard", href: "/admin", icon: Home, exact: true },
  { label: "Auctions", href: "/admin/auctions", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Image
              src="/logo.png"
              alt="AuctionPro logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain rounded-xl shadow-md ring-1 ring-white/10"
            />
            <span className="text-base font-extrabold bg-linear-to-r from-purple-300 to-purple-200 bg-clip-text text-transparent">AuctionPro</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-4">
          <p className="sidebar-section-label mb-3">Admin Panel</p>
          <nav className="space-y-1.5">
            {links.map(({ label, href, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} onClick={onClose}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <Icon size={18} className={isActive ? "text-purple-300" : ""} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <Link href="/"
            className="sidebar-link text-slate-300/70"
          >
            <LogOut size={18} className="text-slate-400" />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
