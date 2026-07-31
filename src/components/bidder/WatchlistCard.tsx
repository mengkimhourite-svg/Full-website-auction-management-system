"use client";

import { Clock, Trash2, TrendingUp, ImageOff } from "lucide-react";
import CountdownTimer from "@/components/auction/CountdownTimer";

interface WatchlistCardProps {
  auction: any;
  onRemove: (id: string) => void;
}

export default function WatchlistCard({ auction, onRemove }: WatchlistCardProps) {
  const product = auction.product || {};

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title || "Auction item"}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageOff size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700">
          <Clock size={14} className="text-indigo-600" />
          <CountdownTimer endTime={auction.endTime} />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onRemove(auction.id); }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 transition-all"
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
        <button
          onClick={(e) => { e.preventDefault(); window.location.href = `/auctions/${auction.id}`; }}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all"
        >
          <TrendingUp size={16} />
          Place Bid
        </button>
      </div>
    </div>
  );
}
