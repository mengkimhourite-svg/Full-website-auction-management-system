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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-scale-in">
        <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
        <p className="font-bold text-emerald-800">Bid Placed Successfully!</p>
        <p className="text-emerald-600 text-sm mt-1">Your bid of ${amount} is the current highest.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 card-premium">
      <h3 className="font-bold text-gray-900">Place Your Bid</h3>

      {error && (
        <div className="auth-error"><AlertCircle size={16} />{error}</div>
      )}

      <div>
        <label className="text-sm text-gray-500 font-medium mb-2 block">Your Bid Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={currentPrice + 1}
            step={1}
            className="w-full pl-8 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none text-lg font-bold text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
            required
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Minimum bid: ${currentPrice + 1}</p>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-full font-bold text-sm hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
        {loading ? "Placing Bid..." : `Place Bid - $${amount}`}
      </button>
    </form>
  );
}
