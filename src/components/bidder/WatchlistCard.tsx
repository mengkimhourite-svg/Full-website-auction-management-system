"use client";

import { Clock, Trash2, TrendingUp, ImageOff } from "lucide-react";
import Image from "next/image";
import CountdownTimer from "@/components/auction/CountdownTimer";
import type { Auction, Product } from "@/types";

interface WatchlistCardProps {
  auction: Auction;
  onRemove: (id: string) => void;
}

export default function WatchlistCard({ auction, onRemove }: WatchlistCardProps) {
  const product = auction.product || ({} as Product);

  return (
    <div className="card overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title || "Auction item"}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageOff size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700">
          <Clock size={14} className="text-indigo-500" />
          <CountdownTimer endTime={auction.endTime} />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onRemove(auction.id); }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 truncate">
          {product.title || "Untitled Auction"}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-xl font-bold text-indigo-600">
              ${(auction.currentPrice || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {auction._count?.bids || auction.bids?.length || 0} bids
          </div>
        </div>
        <button onClick={(e) => { e.preventDefault(); window.location.href = `/auctions/${auction.id}`; }}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
          <TrendingUp size={10} />
          Place Bid
        </button>
      </div>
    </div>
  );
}
