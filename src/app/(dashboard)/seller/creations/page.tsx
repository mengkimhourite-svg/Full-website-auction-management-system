"use client";

import { useState } from "react";
import AuctionForm from "@/components/seller/AuctionForm";
import { ArrowLeft, Package, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuctionFormData } from "@/components/seller/AuctionForm";

export default function CreateAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: AuctionFormData) => {
    setLoading(true);
    setError("");
    try {
      const product = data.product || {};
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: product.title || data.title,
          productDescription: product.description || data.description || "",
          productImage: product.image || data.image || "",
          category: data.category,
          startPrice: data.startPrice,
          startTime: new Date().toISOString(),
          endTime: new Date(data.endTime).toISOString(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/seller/auctions");
      } else {
        setError(json.error || "Failed to create auction");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/auctions"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Create New Auction</h1>
            <p className="text-sm text-gray-500">Fill in the details for your new auction listing</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <AuctionForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
