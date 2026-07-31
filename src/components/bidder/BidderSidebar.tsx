"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, Activity, User, X, LogOut } from "lucide-react";

interface BidderSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { label: "Dashboard", href: "/bidder/reports", icon: Activity },
  { label: "Browse Auctions", href: "/auctions", icon: Gavel },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BidderSidebar({ open, onClose }: BidderSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img
              src="/logo.png"
              alt="AuctionPro logo"
              className="w-9 h-9 object-contain rounded-xl shadow-md"
            />
            <span className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bidder</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bidder Panel</p>
          <nav className="space-y-1">
            {links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <LogOut size={18} className="text-gray-400" />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
