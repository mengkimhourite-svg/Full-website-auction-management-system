"use client";

import { useState, useEffect } from "react";
import AuctionForm from "@/components/seller/AuctionForm";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Auction } from "@/types";
import type { AuctionFormData } from "@/components/seller/AuctionForm";

export default function EditAuctionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Auction | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/auctions/${id}`);
        const json = await res.json();
        if (json.success) {
          setInitialData(json.data);
        } else {
          setFetchError(json.error || "Auction not found");
        }
      } catch {
        setFetchError("Network error");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data: AuctionFormData) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const product = data.product || {};
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: product.title || data.title,
          productDescription: product.description || data.description || "",
          productImage: product.image || data.image || "",
          category: data.category,
          startPrice: data.startPrice,
          endTime: new Date(data.endTime).toISOString(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/seller/auctions");
      } else {
        setSubmitError(json.error || "Failed to update auction");
      }
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm">Loading auction...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={32} className="text-red-400 mb-3" />
        <p className="text-sm font-medium text-red-500">{fetchError}</p>
        <Link
          href="/seller/auctions"
          className="mt-4 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
        >
          Back to Auctions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/auctions"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Edit Auction</h1>
          <p className="text-sm text-gray-500">Update your auction listing details</p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <AuctionForm onSubmit={handleSubmit} initialData={initialData} loading={submitting} />
    </div>
  );
}
