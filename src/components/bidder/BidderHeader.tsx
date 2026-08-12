"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

export default function BidderHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="dashboard-header border-b border-slate-200 bg-white">

      {/* =========================================================
          LEFT — DASHBOARD TITLE
      ========================================================= */}

      <div className="flex items-center">

        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-black">
            Bidder Dashboard
          </h1>

          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
            Manage your bids and winning auctions
          </p>
        </div>

      </div>

      {/* =========================================================
          RIGHT — USER AREA
      ========================================================= */}

      <div className="flex items-center gap-3">

        {user && (
          <div className="flex items-center gap-3">

            {/* User Information */}

            <div className="hidden text-right sm:block">

              <p className="text-sm font-bold text-black">
                {user.name}
              </p>

              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {user.role}
              </span>

            </div>

            {/* Avatar */}

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-blue-50">
              <User size={17} />
            </div>

            {/* Dropdown Icon */}

            <ChevronDown
              size={15}
              className="hidden text-slate-400 sm:block"
            />

          </div>
        )}

        {/* Divider */}

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* =======================================================
            LOGOUT
        ======================================================= */}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut size={15} />

          <span className="hidden sm:inline">
            Logout
          </span>
        </button>

      </div>

    </header>
  );
}