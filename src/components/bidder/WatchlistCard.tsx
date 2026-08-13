"use client";

import {
  Clock,
  Trash2,
  TrendingUp,
  ImageOff,
} from "lucide-react";
import Image from "next/image";
import CountdownTimer from "@/components/auction/CountdownTimer";
import type { Auction, Product } from "@/types";

interface WatchlistCardProps {
  auction: Auction;
  onRemove: (id: string) => void;
}

export default function WatchlistCard({
  auction,
  onRemove,
}: WatchlistCardProps) {
  const product = auction.product || ({} as Product);

  return (
    <div className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">

      {/* =========================================================
          IMAGE
      ========================================================= */}

      <div className="relative h-48 overflow-hidden bg-slate-100">

        {product.image ? (
          <Image
            src={product.image}
            alt={product.title || "Auction item"}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageOff size={32} />
          </div>
        )}

        {/* Image Overlay */}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {/* =====================================================
            COUNTDOWN
        ===================================================== */}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">

          <Clock
            size={13}
            className="text-blue-600"
          />

          <CountdownTimer
            endTime={auction.endTime}
          />

        </div>

        {/* =====================================================
            REMOVE BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove(auction.id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-white/95 text-red-500 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove from watchlist"
        >
          <Trash2 size={15} />
        </button>

      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="p-5">

        {/* Title */}

        <h3 className="truncate text-base font-bold text-black transition-colors group-hover:text-blue-600">
          {product.title || "Untitled Auction"}
        </h3>

        {/* =====================================================
            PRICE + BIDS
        ===================================================== */}

        <div className="mt-4 flex items-end justify-between">

          {/* Current Bid */}

          <div>

            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Current Bid
            </p>

            <p className="mt-1 text-xl font-extrabold text-blue-600">
              $
              {(auction.currentPrice || auction.startPrice || 0).toLocaleString()}
            </p>

          </div>

          {/* Bid Count */}

          <div className="text-right">

            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Bids
            </p>

            <p className="mt-1 text-sm font-bold text-black">
              {auction._count?.bids ||
                auction.bids?.length ||
                0}
            </p>

          </div>

        </div>

        {/* =====================================================
            PLACE BID BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/auctions/${auction.id}`;
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-sm"
        >
          <TrendingUp size={14} />
          Place Bid
        </button>

        {/* =====================================================
            BLUE HOVER ACCENT
        ===================================================== */}

        <div className="mt-4 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />

      </div>

    </div>
  );
}