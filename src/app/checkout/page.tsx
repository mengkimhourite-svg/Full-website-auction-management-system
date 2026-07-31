"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import CheckoutSummary from "@/components/payment/CheckoutSummary";
import PaymentForm from "@/components/payment/PaymentForm";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const auctionId = searchParams.get("auctionId");
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.resolve(auctionId)
      .then(async (id) => {
        if (!id) {
          setError("No auction selected");
          return;
        }
        const res = await fetch(`/api/auctions/${id}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setAuction(json.data || json);
      })
      .catch(() => setError("Failed to load auction details"))
      .finally(() => setLoading(false));
  }, [auctionId]);

  const handlePayment = async (paymentData: any) => {
    setError("");
    setProcessing(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          amount: auction?.currentPrice || 0,
          userId: user?.id,
          ...paymentData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Payment failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-24">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md mx-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500 mt-2">Your payment has been processed successfully.</p>
          <Link href="/auctions"
            className="mt-6 inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          >
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Error</h2>
        <p className="text-gray-500">{error}</p>
        <Link href="/auctions"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-semibold text-sm"
        >
          <ArrowLeft size={16} /> Back to Auctions
        </Link>
      </div>
    );
  }

  const amount = auction?.currentPrice || 0;
  const title = auction?.product?.title || auction?.title || "Auction Item";

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Auctions
        </Link>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <PaymentForm amount={amount} onSubmit={handlePayment} loading={processing} />
            {error && <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</div>}
          </div>
          <div className="md:col-span-2">
            <CheckoutSummary amount={amount} auctionTitle={title} />
          </div>
        </div>
      </div>
    </div>
  );
}
