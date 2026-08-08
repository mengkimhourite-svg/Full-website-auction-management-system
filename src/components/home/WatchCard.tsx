"use client";

import { Clock, Users, TrendingUp, Eye, ImageOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface WatchCardProps {
  title: string;
  currentBid: number;
  image: string;
  endingIn?: string;
  bids: number;
}

export default function WatchCard({ title, currentBid, image, endingIn, bids }: WatchCardProps) {
  return (
    <div className="card group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff size={28} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm rounded-md px-2.5 py-1 text-xs font-medium text-white">
          <Clock size={12} />
          {endingIn || "Ending soon"}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 rounded-md px-2 py-1 text-xs font-medium text-gray-600">
          <Eye size={11} />
          {bids}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
          {title}
        </h3>

        <div className="flex items-end justify-between mt-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Current Bid</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              ${currentBid.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-1">
            <Users size={11} />
            {bids} bids
          </div>
        </div>

        <Link
          href="/auctions"
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          <TrendingUp size={14} />
          Place Bid
        </Link>
      </div>
    </div>
  );
}
