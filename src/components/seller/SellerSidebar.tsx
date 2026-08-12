"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Gavel, PlusCircle, User, X, LogOut } from "lucide-react";

interface SellerSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { label: "My Auctions", href: "/seller/auctions", icon: Gavel },
  { label: "Create Auction", href: "/seller/auctions/create", icon: PlusCircle },
  { label: "Profile", href: "/profile", icon: User },
];

export default function SellerSidebar({ open, onClose }: SellerSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
              <Image src="/logo.png" alt="AuctionPro" width={24} height={24} className="w-6 h-6 object-contain" />
            </span>
            <span className="text-base font-bold text-white">Seller</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-3 py-3">
          <p className="sidebar-section-label mb-2">Seller Panel</p>
          <nav className="space-y-0.5">
            {links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} onClick={onClose}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <Icon size={17} className={isActive ? "text-indigo-400" : ""} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-3 py-3 border-t border-white/5">
          <Link href="/" className="sidebar-link text-slate-400">
            <LogOut size={17} />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
