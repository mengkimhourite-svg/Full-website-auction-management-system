"use client";

import { useEffect, useState, useMemo } from "react";
import { Gavel, DollarSign, Activity, Trophy, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Bid } from "@/types";

const PAGE_SIZE = 12;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface BidStats {
  total: number;
  active: number;
  ended: number;
  totalValue: number;
}

// React StrictMode double-invokes effects in development, which would fire
// two identical requests. A module-level in-flight promise keyed by the
// request dedupes them without disabling StrictMode (production is unaffected).
let inflightBids: { key: string; promise: Promise<Record<string, unknown>> } | null = null;

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [stats, setStats] = useState<BidStats>({ total: 0, active: 0, ended: 0, totalValue: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const key = `${page}|${debouncedSearch}|${refreshKey}`;
    // Deferred so the effect body never calls setState synchronously.
    Promise.resolve().then(() => {
      setLoading(true);
      setError("");
    });

    if (!inflightBids || inflightBids.key !== key) {
      const params = new URLSearchParams({
        scope: "all",
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      inflightBids = {
        key,
        promise: fetch(`/api/bids?${params.toString()}`, { credentials: "include" })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch bids");
            return res.json();
          }),
      };
    }

    let cancelled = false;
    inflightBids.promise
      .then((json) => {
        if (cancelled) return;
        setBids(Array.isArray(json.data) ? json.data : []);
        if (json.pagination) setPagination(json.pagination as Pagination);
        if (json.stats) setStats(json.stats as BidStats);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch bids");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, refreshKey]);

  const totalBids = stats.total;
  const activeBids = stats.active;
  const wonBids = stats.ended;
  const totalValue = stats.totalValue;

  const filtered = useMemo(() => {
    return bids;
  }, [bids]);

  const statItems = [
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

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Gavel size={22} />}
        title="Bids"
        description="Manage all bids in the system"
        actions={
          <button
            onClick={handleRefresh}
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
            {statItems.map((stat) => (
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
            <>
              <DataTable columns={columns} data={filtered} />
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {pagination.total} bids
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <span className="text-xs font-medium text-gray-500">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}