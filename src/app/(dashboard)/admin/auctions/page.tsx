"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Plus, RefreshCw } from "lucide-react";
import AuctionTable from "@/components/admin/AuctionTable";
import type { Auction } from "@/types";

export default function AdminAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auctions");
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
    (async () => {
      try {
        const res = await fetch("/api/auctions");
        if (!res.ok) throw new Error("Failed to fetch auctions");
        const json = await res.json();
        setAuctions(json.data || json.auctions || json || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch auctions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (!res.ok) throw new Error("Failed to approve auction");
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve auction");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete auction");
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete auction");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Gavel size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Auction Management</h1>
            <p className="text-sm text-gray-500">Manage all auctions in the system</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); fetchAuctions(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => router.push("/admin/create")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md"
          >
            <Plus size={16} />
            Create Auction
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="loading-spinner" />
          <p className="text-sm text-gray-500">Loading auctions...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!loading && !error && auctions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Gavel size={28} />
          </div>
          <p className="text-gray-500 font-medium">No auctions yet</p>
          <p className="text-sm text-gray-400">Create your first auction to get started</p>
          <button
            onClick={() => router.push("/admin/create")}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all"
          >
            <Plus size={16} />
            Create Auction
          </button>
        </div>
      )}

      {!loading && !error && auctions.length > 0 && (
        <AuctionTable auctions={auctions} onApprove={handleApprove} onDelete={handleDelete} />
      )}
    </div>
  );
}
