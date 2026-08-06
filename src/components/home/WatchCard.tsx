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
    <div className="card-premium group">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff size={32} />
          </div>
        )}

        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/10">
          <Clock size={13} className="text-purple-300" />
          {endingIn || "Ending soon"}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
          <Eye size={12} className="text-purple-500" />
          {bids}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight truncate">
          {title}
        </h3>

        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Current Bid</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
              ${currentBid.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 rounded-full px-3 py-1.5">
            <Users size={13} className="text-purple-500" />
            {bids} bids
          </div>
        </div>

        <Link
          href="/auctions"
          className="mt-5 w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 text-white py-3 rounded-full font-semibold text-sm hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all group/btn"
        >
          <TrendingUp size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
          Place Bid
        </Link>
      </div>
    </div>
  );
}