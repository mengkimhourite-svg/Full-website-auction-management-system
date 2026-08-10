"use client";

import { useEffect, useState, useMemo } from "react";
import { Heart, Users, Gavel } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Watchlist } from "@/types";

export default function AdminWatchlistPage() {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/watchlist?scope=all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      const json = await res.json();
      setWatchlist(json.data || json.watchlist || json || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return watchlist;
    const q = search.toLowerCase();
    return watchlist.filter(
      (w) =>
        (w.auction?.product?.title || "").toLowerCase().includes(q) ||
        w.userId.toLowerCase().includes(q)
    );
  }, [watchlist, search]);

  const totalWatchlists = watchlist.length;
  const uniqueUsers = new Set(watchlist.map((w) => w.userId)).size;
  const uniqueAuctions = new Set(watchlist.map((w) => w.auctionId)).size;

  const stats = [
    { title: "Total Watchlists", value: totalWatchlists, icon: <Heart size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Unique Users", value: uniqueUsers, icon: <Users size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Unique Auctions", value: uniqueAuctions, icon: <Gavel size={22} />, color: "from-emerald-500 to-teal-500" },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (w: Watchlist) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {w.userId?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">User</p>
            <p className="text-xs text-gray-400">{w.userId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Auction Product",
      render: (w: Watchlist) => (
        <span className="text-sm text-gray-700">
          {w.auction?.product?.title || "Untitled"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Added Date",
      render: (w: Watchlist) => (
        <span className="text-sm text-gray-500">{formatDate(w.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Heart size={22} />}
        title="Watchlist"
        description="User watchlist activity"
      />

      {loading && <LoadingSpinner text="Loading watchlist..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <SearchInput value={search} onChange={setSearch} placeholder="Search watchlist by product or user..." />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} />}
              title="No watchlist entries found"
              description={search ? "No watchlist entries match your search" : "Watchlist entries will appear here when users add auctions"}
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}
    </div>
  );
}
