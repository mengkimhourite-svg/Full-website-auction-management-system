"use client";

import { Clock, TrendingUp, ImageOff, Eye } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import Link from "next/link";
import Image from "next/image";
import type { Auction } from "@/types";

interface AuctionCardProps {
  auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const product = auction.product;
  const status = auction.status || "ACTIVE";
  const isEnded = status === "ENDED" || (status as string) === "SOLD";

  return (
    <Link href={`/auctions/${auction.id}`} className="block no-underline">
      <div className="card group">
        <div className="relative h-48 overflow-hidden">
          {product?.image ? (
            <Image src={product.image} alt={product.title || "Auction item"} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><ImageOff size={28} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`badge ${isEnded ? "badge-danger" : status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
              {isEnded ? "Ended" : status}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-md px-2.5 py-1 text-xs font-medium text-gray-700">
            <Clock size={11} />
            <CountdownTimer endTime={auction.endTime} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight text-sm">{product?.title || "Untitled"}</h3>
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Current Bid</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">${(auction.currentPrice || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye size={12} />
              {auction._count?.bids || auction.bids?.length || 0} bids
            </div>
          </div>
          <div className="mt-3 w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">
            <TrendingUp size={14} />
            {isEnded ? "View Details" : "Place Bid"}
          </div>
        </div>
      </div>
    </Link>
  );
}
