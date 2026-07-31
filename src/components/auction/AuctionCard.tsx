"use client";

import { Clock, TrendingUp, ImageOff, Eye } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import Link from "next/link";

interface AuctionCardProps {
  auction: any;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const product = auction.product || {};
  const status = auction.status || "ACTIVE";
  const isEnded = status === "ENDED" || status === "SOLD";

  return (
    <Link href={`/auctions/${auction.id}`} className="block no-underline">
      <div className="card-premium group">
        <div className="relative h-52 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.title || "Auction item"} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><ImageOff size={32} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`badge ${isEnded ? "badge-danger" : status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
              {isEnded ? "Ended" : status}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
            <Clock size={12} className="text-indigo-600" />
            <CountdownTimer endTime={auction.endTime} />
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{product.title || "Untitled"}</h3>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Current Bid</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5">${(auction.currentPrice || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Eye size={13} />
              {auction._count?.bids || auction.bids?.length || 0} bids
            </div>
          </div>
          <div className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 rounded-full font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-indigo-200 transition-all group/btn">
            <TrendingUp size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
            {isEnded ? "View Details" : "Place Bid"}
          </div>
        </div>
      </div>
    </Link>
  );
}
