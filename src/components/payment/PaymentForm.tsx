"use client";

import { useState } from "react";
import { CreditCard, Lock, Loader2 } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function PaymentForm({ amount, onSubmit, loading }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cardNumber, expiry, cvv, name, amount });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard size={20} className="text-indigo-600" />
        <h3 className="text-base font-bold text-gray-900">Card Details</h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Cardholder Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Card Number</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19))}
          placeholder="4242 4242 4242 4242"
          required
          maxLength={19}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              if (v.length >= 3) setExpiry(v.slice(0, 2) + "/" + v.slice(2));
              else setExpiry(v);
            }}
            placeholder="MM/YY"
            required
            maxLength={5}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="123"
            required
            maxLength={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
        <Lock size={12} />
        Your payment is secured with encryption
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
        {loading ? "Processing..." : `Pay $${amount.toLocaleString()}`}
      </button>
    </form>
  );
}
