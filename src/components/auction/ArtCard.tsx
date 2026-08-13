"use client";

import { Heart, Clock, Sparkles, TrendingUp, ImageOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import type { Auction, Product } from "@/types";

interface ArtCardProps {
  auction: Auction;
  watched: boolean;
  loading?: boolean;
  onToggleWatch: (auctionId: string) => void;
}

export default function ArtCard({ auction, watched, loading, onToggleWatch }: ArtCardProps) {
  const product = (auction.product ?? {}) as Partial<Product>;
  const sellerName = product.seller?.name || "AuctionPro Seller";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative">
        <Link href={`/auctions/${auction.id}`} className="block relative h-52 overflow-hidden bg-slate-100" aria-label={product.title || "Auction"}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title || "Auction item"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageOff size={28} />
            </div>
          )}
        </Link>

        <button
          onClick={() => onToggleWatch(auction.id)}
          disabled={loading}
          aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all disabled:opacity-60 ${
            watched
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/95 text-slate-500 hover:text-red-500 hover:scale-110"
          }`}
        >
          <Heart size={16} className={watched ? "fill-current" : ""} />
        </button>

        {auction.status && auction.status !== "ACTIVE" && (
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              auction.status === "ENDED"
                ? "bg-slate-900/80 text-white"
                : "bg-amber-400/95 text-amber-950"
            }`}
          >
            {auction.status}
          </span>
        )}
      </div>

      <div className="p-5">
        <Link href={`/auctions/${auction.id}`} className="block">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Sparkles size={12} className="text-indigo-400" />
            {product.category || "General"}
          </div>
          <h3 className="mt-1.5 truncate text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
            {product.title || "Untitled"}
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">by {sellerName}</p>
        </Link>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Current Bid</p>
            <p className="mt-0.5 text-xl font-extrabold text-slate-900">
              ${(auction.currentPrice || auction.startPrice || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <Clock size={13} className="text-indigo-500" />
            <CountdownTimer endTime={auction.endTime} />
          </div>
        </div>

        <Link
          href={`/auctions/${auction.id}`}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-md"
        >
          <TrendingUp size={15} />
          {auction.status === "ENDED" ? "View Details" : "Place Bid"}
        </Link>
      </div>
    </div>
  );
}