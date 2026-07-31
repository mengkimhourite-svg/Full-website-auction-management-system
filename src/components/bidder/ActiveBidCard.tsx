"use client";

import { Clock, TrendingUp } from "lucide-react";
import CountdownTimer from "@/components/auction/CountdownTimer";
import Link from "next/link";

interface ActiveBidCardProps {
  bid: any;
}

export default function ActiveBidCard({ bid }: ActiveBidCardProps) {
  const auction = bid.auction || {};

  return (
    <Link href={`/auctions/${auction.id}`} className="block no-underline">
      <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="badge badge-success">Active</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <CountdownTimer endTime={auction.endTime} />
          </div>
        </div>
        <h3 className="text-base font-bold text-gray-900 truncate">
          {auction.product?.title || "Untitled Auction"}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-gray-500">Your Bid</p>
            <p className="text-lg font-bold text-indigo-600">${(bid.amount || 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Current Price</p>
            <p className="text-sm font-semibold text-gray-700">${(auction.currentPrice || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white py-2 rounded-xl font-semibold text-xs hover:shadow-lg transition-all">
          <TrendingUp size={14} />
          View Auction
        </div>
      </div>
    </Link>
  );
}
