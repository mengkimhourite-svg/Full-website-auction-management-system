"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Gavel,
  Activity,
  User,
  X,
  LogOut,
} from "lucide-react";

interface BidderSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  {
    label: "Dashboard",
    href: "/bidder/reports",
    icon: Activity,
  },
  {
    label: "Browse Auctions",
    href: "/auctions",
    icon: Gavel,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function BidderSidebar({
  open,
  onClose,
}: BidderSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={`dashboard-sidebar bidder-sidebar ${
          open ? "open" : ""
        } bg-slate-950`}
      >

        {/* =======================================================
            LOGO / BRAND
        ======================================================= */}

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">

          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
          >

            {/* Logo */}

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 shadow-sm">
              <Image
                src="/logo.png"
                alt="AuctionPro"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </span>

            {/* Brand */}

            <div>
              <span className="sidebar-brand block text-sm font-extrabold tracking-wide text-white">
                auctionpro
              </span>

              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Bidder Panel
              </span>
            </div>

          </Link>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={17} />
          </button>

        </div>

        {/* =======================================================
            NAVIGATION
        ======================================================= */}

        <div className="px-3 py-4">

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Bidder Panel
          </p>

          <nav className="space-y-1">

            {links.map(
              ({
                label,
                href,
                icon: Icon,
              }) => {

                const isActive =
                  pathname === href ||
                  pathname.startsWith(
                    href + "/"
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      rounded-md
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      no-underline
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >

                    {/* Active Indicator */}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-white" />
                    )}

                    {/* Icon */}

                    <Icon
                      size={17}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500 transition-colors group-hover:text-blue-400"
                      }
                    />

                    {/* Label */}

                    <span>
                      {label}
                    </span>

                  </Link>
                );
              }
            )}

          </nav>

        </div>

        {/* =======================================================
            BOTTOM
        ======================================================= */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-3 py-3">

          <Link
            href="/"
            className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-400 no-underline transition-all hover:bg-white/5 hover:text-white"
          >

            <LogOut
              size={17}
              className="text-slate-500 transition-colors group-hover:text-blue-400"
            />

            <span>
              Back to Website
            </span>

          </Link>

        </div>

      </aside>
    </>
  );
}