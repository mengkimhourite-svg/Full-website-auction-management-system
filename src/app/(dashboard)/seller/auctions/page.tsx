"use client";

import { useState, useEffect, useCallback } from "react";
import SellerAuctionTable from "@/components/seller/SellerAuctionTable";
import { Gavel, Plus, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuctions = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const user = meData.data;
      if (!user) {
        setError("Not authenticated. Please log in.");
        return;
      }

      const res = await fetch(`/api/auctions?sellerId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setAuctions(json.data);
        setError("");
      } else {
        setError(json.error || "Failed to fetch auctions");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        const user = meData.data;
        if (!user) {
          setError("Not authenticated. Please log in.");
          return;
        }

        const res = await fetch(`/api/auctions?sellerId=${user.id}`);
        const json = await res.json();
        if (json.success) {
          setAuctions(json.data);
          setError("");
        } else {
          setError(json.error || "Failed to fetch auctions");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this auction? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAuctions((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(json.error || "Failed to delete auction");
      }
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Gavel size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">My Auctions</h1>
            <p className="text-sm text-gray-500">Manage your listed auctions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuctions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/seller/creations"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            <Plus size={16} />
            Create New Auction
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <p className="text-sm">Loading auctions...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button
            onClick={fetchAuctions}
            className="mt-4 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
          >
            Retry
          </button>
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Gavel size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500">No auctions yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first auction to get started.</p>
          <Link
            href="/seller/creations"
            className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            <Plus size={16} />
            Create Auction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SellerAuctionTable
            auctions={auctions}
            onEdit={(id) => router.push(`/seller/creations/edit/${id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
