"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Gavel,
  Package,
  Users,
  Wallet,
  DollarSign,
  CreditCard,
  Activity,
  Bell,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import type { Auction, MonthlyReport, User, Payment } from "@/types";

export default function AdminDashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [reportRes, auctionsRes, usersRes, paymentsRes, notifRes] = await Promise.all([
          fetch("/api/reports/monthly", { credentials: "include" }),
          fetch("/api/auctions", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
          fetch("/api/payments", { credentials: "include" }),
          fetch("/api/notifications", { credentials: "include" }),
        ]);
        const [reportJson, auctionsJson, usersJson, paymentsJson, notifJson] = await Promise.all([
          reportRes.json(),
          auctionsRes.json(),
          usersRes.json(),
          paymentsRes.json(),
          notifRes.json(),
        ]);
        setReport(reportJson.data || reportJson.report || reportJson);
        setAuctions(auctionsJson.data || []);
        setUsers(usersJson.data || usersJson || []);
        setPayments(paymentsJson.data || paymentsJson || []);
        const notifs = notifJson.data || notifJson || [];
        setNotificationCount(Array.isArray(notifs) ? notifs.filter((n: { read?: boolean }) => !n.read).length : 0);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalAuctions = auctions.length;
  const uniqueProducts = new Set(auctions.map((a) => a.productId).filter(Boolean)).size;
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalBids = report?.totalBids || 0;
  const totalRevenue = report?.totalRevenue || 0;
  const pendingPayments = Array.isArray(payments) ? payments.filter((p) => p.status === "PENDING").length : 0;
  const activeAuctions = auctions.filter((a) => a.status === "ACTIVE").length;

  const stats = [
    { title: "Total Auctions", value: totalAuctions, icon: <Gavel size={18} />, color: "from-blue-500 to-blue-600", description: "All auctions listed" },
    { title: "Total Products", value: uniqueProducts, icon: <Package size={18} />, color: "from-emerald-500 to-emerald-600", description: "Products in system" },
    { title: "Total Users", value: totalUsers, icon: <Users size={18} />, color: "from-violet-500 to-violet-600", description: "Registered users" },
    { title: "Total Bids", value: totalBids, icon: <Wallet size={18} />, color: "from-amber-500 to-amber-600", description: "Bids placed" },
    { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={18} />, color: "from-green-500 to-green-600", description: "Total revenue" },
    { title: "Pending Payments", value: pendingPayments, icon: <CreditCard size={18} />, color: "from-orange-500 to-orange-600", description: "Awaiting processing" },
    { title: "Active Auctions", value: activeAuctions, icon: <Activity size={18} />, color: "from-cyan-500 to-cyan-600", description: "Currently running" },
    { title: "Notifications", value: notificationCount, icon: <Bell size={18} />, color: "from-rose-500 to-rose-600", description: "Unread notifications" },
  ];

  const revenueData = (report?.monthlyRevenue || report?.revenueByMonth || []).map((item) => ({
    name: item.month || "",
    revenue: item.amount || item.revenue || 0,
  }));

  const auctionData = (report?.monthlyAuctions || report?.auctionsByMonth || []).map((item) => ({
    name: item.month || "",
    auctions: item.count || item.auctions || 0,
  }));

  const recentAuctions = auctions.slice(0, 5);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor your auction business in real time</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-65 text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Auction Activity</h3>
          {auctionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={auctionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="auctions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-65 text-gray-400 text-sm">No auction data yet</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Gavel size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Auctions</h3>
          </div>
          <Link href="/admin/auctions" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {recentAuctions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No auctions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Seller</th>
                  <th>Current Bid</th>
                  <th>Status</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAuctions.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {a.product?.image ? (
                          <Image
                            src={a.product.image}
                            alt={a.product.title || "Auction"}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package size={14} />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 text-sm">{a.product?.title || "Untitled"}</span>
                      </div>
                    </td>
                    <td className="text-gray-500 text-sm">{a.product?.seller?.name || "Unknown"}</td>
                    <td className="font-semibold text-gray-900 text-sm">${(a.currentPrice || a.startPrice || 0).toLocaleString()}</td>
                    <td>
                      <StatusBadge variant={a.status?.toLowerCase() as "active" | "ended" | "pending" || "active"}>
                        {a.status || "Unknown"}
                      </StatusBadge>
                    </td>
                    <td className="text-gray-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {a.endTime ? new Date(a.endTime).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
