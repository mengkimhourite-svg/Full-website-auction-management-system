"use client";

import { useState } from "react";
import { TrendingUp, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface PlaceBidFormProps {
  auctionId: string;
  currentPrice: number;
  onBidPlaced: () => void;
}

export default function PlaceBidForm({ auctionId, currentPrice, onBidPlaced }: PlaceBidFormProps) {
  const [amount, setAmount] = useState(currentPrice + 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= currentPrice) {
      setError(`Bid must be greater than $${currentPrice}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to place bid");
      }
      setSuccess(true);
      onBidPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <CheckCircle size={28} className="mx-auto text-emerald-500 mb-2" />
        <p className="font-semibold text-emerald-800">Bid Placed Successfully!</p>
        <p className="text-emerald-600 text-sm mt-1">Your bid of ${amount} is the current highest.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Place Your Bid</h3>

      {error && (
        <div className="auth-error"><AlertCircle size={15} />{error}</div>
      )}

      <div>
        <label className="text-xs text-gray-500 font-medium mb-1.5 block">Your Bid Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={currentPrice + 1}
            step={1}
            className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none text-base font-semibold text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all"
            required
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Minimum bid: ${(currentPrice + 1).toLocaleString()}</p>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
        {loading ? "Placing Bid..." : `Place Bid — $${amount.toLocaleString()}`}
      </button>
    </form>
  );
}
