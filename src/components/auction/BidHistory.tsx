"use client";

import { Clock } from "lucide-react";
import type { Bid } from "@/types";

interface BidHistoryProps {
  bids: Bid[];
}

export default function BidHistory({ bids }: BidHistoryProps) {
  if (!bids || bids.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No bids yet. Be the first to bid!</p>;
  }

  return (
    <div className="space-y-3">
      {bids.map((bid, i) => (
        <div key={bid.id || i}
          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all animate-fade-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {(bid.user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{bid.user?.name || "Anonymous"}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {new Date(bid.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-lg font-extrabold text-indigo-600">${bid.amount.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
