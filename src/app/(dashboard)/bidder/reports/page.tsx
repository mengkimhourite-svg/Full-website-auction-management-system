"use client";

import { useState, useEffect } from "react";
import ActiveBidCard from "@/components/bidder/ActiveBidCard";
import WinningAuctionCard from "@/components/bidder/WinningAuctionCard";
import {
  Gavel,
  Trophy,
  Clock,
  TrendingUp,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { ApiResponse, Auction, Bid, Watchlist } from "@/types";

export default function BidderReportsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [won, setWon] = useState<Bid[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [bidsRes, wonRes, watchRes] = await Promise.all([
          fetch("/api/bids?scope=mine"),
          fetch("/api/bids?scope=won"),
          fetch("/api/watchlist"),
        ]);
        const [bidsJson, wonJson, watchJson] = await Promise.all([
          bidsRes.json() as Promise<ApiResponse<Bid[]>>,
          wonRes.json() as Promise<ApiResponse<Bid[]>>,
          watchRes.json() as Promise<ApiResponse<Watchlist[]>>,
        ]);
        if (!bidsRes.ok) throw new Error(bidsJson.error || "Failed to fetch bids");
        setBids(bidsJson.data || []);
        setWon(wonJson.data || []);
        setWatchlistCount((watchJson.data || []).length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeBids = bids.filter((b) => b.auction?.status === "ACTIVE");
  const activeAuctionIds = new Set(activeBids.map((b) => b.auction?.id));
  const wonAuctions = won.map((w) => w.auction).filter((a): a is Auction => !!a);

  const stats = [
    { label: "Total Bids", value: bids.length, icon: Gavel, color: "from-indigo-600 to-sky-500" },
    { label: "Active Auctions", value: activeAuctionIds.size, icon: Clock, color: "from-emerald-500 to-teal-500" },
    { label: "Won Auctions", value: wonAuctions.length, icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Watchlist", value: watchlistCount, icon: Eye, color: "from-purple-500 to-pink-500" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Bidder Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your bidding activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">{stat.label}</span>
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-3">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {activeBids.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Active Bids</h2>
            <span className="badge badge-info">{activeBids.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBids.map((bid) => (
              <ActiveBidCard key={bid.id} bid={bid} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Active Bids</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            <Gavel size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-gray-500">No active bids yet</p>
            <p className="text-xs text-gray-400 mt-1">Browse auctions and place your first bid.</p>
            <Link
              href="/auctions"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl hover:shadow-lg transition-all"
            >
              Browse Auctions
            </Link>
          </div>
        </section>
      )}

      {wonAuctions.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Won Auctions</h2>
            <span className="badge badge-success">{wonAuctions.length}</span>
          </div>
          <div className="space-y-3">
            {wonAuctions.map((auction) => (
              <WinningAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
      ) : (
        !loading && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Won Auctions</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
              <Trophy size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-gray-500">No auctions won yet</p>
              <p className="text-xs text-gray-400 mt-1">Keep bidding — your next win is just around the corner.</p>
            </div>
          </section>
        )
      )}
    </div>
  );
}
