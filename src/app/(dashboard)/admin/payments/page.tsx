"use client";

import { useEffect, useState, useMemo } from "react";
import { CreditCard, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Payment } from "@/types";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payments", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch payments");
        const json = await res.json();
        setPayments(json.data || json.payments || json || []);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        (p.user?.name || "").toLowerCase().includes(q) ||
        (p.user?.email || "").toLowerCase().includes(q) ||
        (p.auction?.product?.title || "").toLowerCase().includes(q) ||
        (p.method || "").toLowerCase().includes(q)
    );
  }, [payments, search]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successfulPayments = payments.filter((p) => p.status === "SUCCESS");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const failedPayments = payments.filter((p) => p.status === "FAILED");
  const successfulRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    { title: "Total Revenue", value: `$${successfulRevenue.toLocaleString()}`, icon: <DollarSign size={22} />, color: "from-emerald-500 to-teal-500" },
    { title: "Successful", value: successfulPayments.length, icon: <CheckCircle size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Pending", value: pendingPayments.length, icon: <Clock size={22} />, color: "from-amber-500 to-orange-500" },
    { title: "Failed", value: failedPayments.length, icon: <AlertCircle size={22} />, color: "from-red-500 to-pink-500" },
  ];

  const getStatusVariant = (status: string): "active" | "pending" | "failed" => {
    switch (status) {
      case "SUCCESS":
        return "active";
      case "PENDING":
        return "pending";
      case "FAILED":
        return "failed";
      default:
        return "pending";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const columns = [
    {
      key: "user",
      label: "User",
      render: (p: Payment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {(p.user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{p.user?.name || "Unknown"}</p>
            <p className="text-xs text-gray-400">{p.user?.email || ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (p: Payment) => (
        <span className="text-sm text-gray-700">{p.auction?.product?.title || "Untitled"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (p: Payment) => (
        <span className="text-sm font-bold text-gray-900">${(p.amount || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (p: Payment) => (
        <span className="text-sm text-gray-500 capitalize">{p.method || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p: Payment) => (
        <StatusBadge variant={getStatusVariant(p.status)}>
          {p.status}
        </StatusBadge>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (p: Payment) => (
        <span className="text-sm text-gray-500">{formatDate(p.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<CreditCard size={22} />}
        title="Payments"
        description="Payment transactions"
      />

      {loading && <LoadingSpinner text="Loading payments..." />}

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

          <SearchInput value={search} onChange={setSearch} placeholder="Search by user, product, or method..." />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={28} />}
              title="No payments found"
              description={search ? "No payments match your search" : "Payments will appear here once transactions occur"}
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}
    </div>
  );
}
