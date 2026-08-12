"use client";

import { Clock, TrendingUp } from "lucide-react";
import CountdownTimer from "@/components/auction/CountdownTimer";
import Link from "next/link";
import type { Auction, Bid } from "@/types";

interface ActiveBidCardProps {
  bid: Bid;
}

export default function ActiveBidCard({
  bid,
}: ActiveBidCardProps) {
  const auction = bid.auction || ({} as Auction);

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="block no-underline"
    >
      <div className="group overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">

        {/* =====================================================
            TOP ROW
        ===================================================== */}

        <div className="mb-4 flex items-center justify-between">

          {/* Active Status */}

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>

          {/* Countdown */}

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock size={13} className="text-blue-500" />

            <CountdownTimer
              endTime={auction.endTime}
            />
          </div>

        </div>

        {/* =====================================================
            AUCTION TITLE
        ===================================================== */}

        <h3 className="truncate text-base font-bold text-black transition-colors group-hover:text-blue-600">
          {auction.product?.title ||
            "Untitled Auction"}
        </h3>

        {/* =====================================================
            PRICE INFORMATION
        ===================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-4">

          {/* Your Bid */}

          <div className="border-r border-slate-100">

            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Your Bid
            </p>

            <p className="mt-1 text-lg font-extrabold text-blue-600">
              $
              {(bid.amount || 0).toLocaleString()}
            </p>

          </div>

          {/* Current Price */}

          <div className="text-right">

            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Current Price
            </p>

            <p className="mt-1 text-base font-bold text-black">
              $
              {(auction.currentPrice || 0).toLocaleString()}
            </p>

          </div>

        </div>

        {/* =====================================================
            VIEW AUCTION BUTTON
        ===================================================== */}

        <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-xs font-bold text-white transition-all duration-200 group-hover:bg-blue-700">
          <TrendingUp size={14} />
          View Auction
        </div>

        {/* =====================================================
            BLUE HOVER ACCENT
        ===================================================== */}

        <div className="mt-4 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />

      </div>
    </Link>
  );
}