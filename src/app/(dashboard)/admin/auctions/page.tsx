"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Gavel,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Check,
  Trash2,
  Clock,
  ImageOff,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Auction } from "@/types";

type ViewMode = "grid" | "table";

export default function AdminAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "delete"; id: string } | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auctions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch auctions");
      const json = await res.json();
      setAuctions(json.data || json.auctions || json || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return auctions;
    const q = search.toLowerCase();
    return auctions.filter(
      (a) =>
        (a.product?.title || "").toLowerCase().includes(q) ||
        (a.title || "").toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
    );
  }, [auctions, search]);

  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter((a) => a.status === "ACTIVE").length;
  const upcomingAuctions = auctions.filter((a) => a.status === "UPCOMING").length;
  const endedAuctions = auctions.filter((a) => a.status === "ENDED").length;

  const stats = [
    { title: "Total", value: totalAuctions, icon: <Gavel size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Active", value: activeAuctions, icon: <Gavel size={22} />, color: "from-emerald-500 to-teal-500" },
    { title: "Upcoming", value: upcomingAuctions, icon: <Clock size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Ended", value: endedAuctions, icon: <Gavel size={22} />, color: "from-gray-400 to-gray-500" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <StatusBadge variant="active">Active</StatusBadge>;
      case "UPCOMING":
        return <StatusBadge variant="info">Upcoming</StatusBadge>;
      case "ENDED":
        return <StatusBadge variant="ended">Ended</StatusBadge>;
      default:
        return <StatusBadge variant="pending">{status}</StatusBadge>;
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return "Ended";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve auction");
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve auction");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete auction");
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete auction");
    }
  };

  const columns = [
    {
      key: "index",
      label: "ID",
      render: (a: Auction) => (
        <span className="text-sm font-medium text-gray-600">{filtered.indexOf(a) + 1}</span>
      ),
    },
    {
      key: "image",
      label: "Image",
      render: (a: Auction) =>
        a.product?.image || a.image ? (
          <Image
            src={a.product?.image || a.image || ""}
            alt={a.product?.title || "Auction"}
            width={48}
            height={48}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageOff size={16} />
          </div>
        ),
    },
    {
      key: "Name",
      label: "Name",
      render: (a: Auction) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{a.product?.title || a.title || "Untitled"}</p>
          <p className="text-xs text-gray-400">{a.category || a.product?.category || "—"}</p>
        </div>
      ),
    },
    {
      key: "currentPrice",
      label: "Current Bid",
      render: (a: Auction) => (
        <span className="text-sm font-bold text-gray-900">${(a.currentPrice || a.startPrice || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "bids",
      label: "Bids",
      render: (a: Auction) => (
        <span className="text-sm text-gray-600">{a._count?.bids || a.bidCount || 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a: Auction) => getStatusBadge(a.status),
    },
    {
      key: "endTime",
      label: "End Time",
      render: (a: Auction) => (
        <div>
          <p className="text-sm text-gray-700">{getTimeRemaining(a.endTime)}</p>
          <p className="text-xs text-gray-400">
            {new Date(a.endTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (a: Auction) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {a.status !== "ACTIVE" && a.status !== "ENDED" && (
            <button
              onClick={() => setConfirmAction({ type: "approve", id: a.id })}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
            >
              <Check size={14} />
              Approve
            </button>
          )}
          <button
            onClick={() => setConfirmAction({ type: "delete", id: a.id })}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Gavel size={22} />}
        title="Auctions"
        description="Manage all auctions"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAuctions}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin/create")}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} />
              Create Auction
            </button>
          </div>
        }
      />

      {loading && <LoadingSpinner text="Loading auctions..." />}

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

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search auctions by title, category..." />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-lg transition-all ${view === "table" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Gavel size={28} />}
              title="No auctions found"
              description={search ? "No auctions match your search" : "Create your first auction to get started"}
              action={!search ? { label: "Create Auction", onClick: () => router.push("/admin/create") } : undefined}
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((auction) => (
                <div key={auction.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {auction.product?.image || auction.image ? (
                    <Image
                      src={auction.product?.image || auction.image || ""}
                      alt={auction.product?.title || "Auction"}
                      width={400}
                      height={200}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-300">
                      <ImageOff size={32} />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{auction.product?.title || auction.title || "Untitled"}</h3>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Current Bid</p>
                        <p className="text-lg font-extrabold text-gray-900">${(auction.currentPrice || auction.startPrice || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Bids</p>
                        <p className="text-sm font-bold text-gray-700">{auction._count?.bids || auction.bidCount || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{getTimeRemaining(auction.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {auction.status !== "ACTIVE" && auction.status !== "ENDED" && (
                        <button
                          onClick={() => handleApprove(auction.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmAction({ type: "delete", id: auction.id })}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === "approve" ? "Approve Auction" : "Delete Auction"}
        message={
          confirmAction?.type === "approve"
            ? "Are you sure you want to approve this auction? It will become active."
            : "Are you sure you want to delete this auction? This action cannot be undone."
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Delete"}
        variant={confirmAction?.type === "approve" ? "info" : "danger"}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction.type === "approve"
              ? handleApprove(confirmAction.id)
              : handleDelete(confirmAction.id);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
