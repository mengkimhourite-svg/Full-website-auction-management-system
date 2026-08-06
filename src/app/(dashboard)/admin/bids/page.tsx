"use client";

import { useEffect, useState, useMemo } from "react";
import { Gavel, DollarSign, Activity, Trophy, RefreshCw } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Bid } from "@/types";

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bids?scope=all");
      if (!res.ok) throw new Error("Failed to fetch bids");
      const json = await res.json();
      setBids(json.data || json.bids || json || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return bids;
    const q = search.toLowerCase();
    return bids.filter(
      (b) =>
        (b.user?.name || "").toLowerCase().includes(q) ||
        (b.user?.email || "").toLowerCase().includes(q) ||
        (b.auction?.product?.title || "").toLowerCase().includes(q) ||
        String(b.amount).includes(q)
    );
  }, [bids, search]);

  const totalBids = bids.length;
  const activeBids = bids.filter((b) => b.auction?.status === "ACTIVE").length;
  const wonBids = bids.filter((b) => b.auction?.status === "ENDED").length;
  const totalValue = bids.reduce((sum, b) => sum + (b.amount || 0), 0);

  const stats = [
    { title: "Total Bids", value: totalBids, icon: <Gavel size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Active Bids", value: activeBids, icon: <Activity size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Won Bids", value: wonBids, icon: <Trophy size={22} />, color: "from-emerald-500 to-teal-500" },
    { title: "Total Value", value: `$${totalValue.toLocaleString()}`, icon: <DollarSign size={22} />, color: "from-amber-500 to-orange-500" },
  ];

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const getBidStatus = (bid: Bid): { variant: "active" | "pending" | "ended"; label: string } => {
    if (bid.auction?.status === "ACTIVE") return { variant: "active", label: "Active" };
    if (bid.auction?.status === "ENDED") return { variant: "ended", label: "Ended" };
    return { variant: "pending", label: "Pending" };
  };

  const columns = [
    {
      key: "bidder",
      label: "Bidder",
      render: (bid: Bid) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {(bid.user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{bid.user?.name || "Unknown"}</p>
            <p className="text-xs text-gray-400">{bid.user?.email || ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (bid: Bid) => (
        <span className="text-sm text-gray-700">{bid.auction?.product?.title || "Untitled"}</span>
      ),
    },
    {
      key: "amount",
      label: "Bid Amount",
      render: (bid: Bid) => (
        <span className="text-sm font-bold text-gray-900">${(bid.amount || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (bid: Bid) => (
        <span className="text-sm text-gray-500">{formatRelativeTime(bid.createdAt)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (bid: Bid) => {
        const status = getBidStatus(bid);
        return <StatusBadge variant={status.variant}>{status.label}</StatusBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Gavel size={22} />}
        title="Bids"
        description="Manage all bids in the system"
        actions={
          <button
            onClick={fetchBids}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {loading && <LoadingSpinner text="Loading bids..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <SearchInput value={search} onChange={setSearch} placeholder="Search bids by bidder, product, or amount..." />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Gavel size={28} />}
              title="No bids found"
              description={search ? "No bids match your search criteria" : "Bids will appear here once users start bidding"}
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}
    </div>
  );
}
