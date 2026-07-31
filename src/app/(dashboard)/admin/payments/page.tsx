"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Calendar, Search } from "lucide-react";
import PaymentHistory from "@/components/payment/PaymentHistory";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error("Failed to fetch payments");
        const json = await res.json();
        setPayments(json.data || json.payments || json || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = payments.filter((p: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.user?.email || "").toLowerCase().includes(q) ||
      (p.user?.name || "").toLowerCase().includes(q) ||
      (p.auction?.product?.title || "").toLowerCase().includes(q)
    );
  });

  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const successfulCount = payments.filter((p: any) => p.status === "SUCCESS").length;
  const pendingCount = payments.filter((p: any) => p.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500">Monitor all payment transactions</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Successful</p>
            <p className="text-xl font-bold text-gray-900">{successfulCount}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="loading-spinner" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <CreditCard size={28} />
          </div>
          <p className="text-gray-500 font-medium">
            {search ? "No payments match your search" : "No payments yet"}
          </p>
          <p className="text-sm text-gray-400">
            {search ? "Try a different search term" : "Payments will appear here once users make purchases"}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && <PaymentHistory payments={filtered} />}
    </div>
  );
}
