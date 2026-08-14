"use client";

import { useEffect, useState, useRef } from "react";
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
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
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
import type { Auction, MonthlyReport } from "@/types";

interface DashboardCounts {
  auctions: number;
  active: number;
  upcoming: number;
  ended: number;
  products: number;
  users: number;
  pendingPayments: number;
  unreadNotifications: number;
}

const TABLE_LIMIT = 100;

interface DashboardData {
  report: MonthlyReport;
  counts: DashboardCounts;
  auctions: Auction[];
  pagination?: { total: number };
}

// React StrictMode (dev) double-invokes effects; sharing the in-flight
// promise module-wide means the consolidated dashboard request is fired
// at most once concurrently per page load.
let dashboardLoadPromise: Promise<DashboardData> | null = null;

function fetchDashboardOnce(): Promise<DashboardData> {
  if (!dashboardLoadPromise) {
    dashboardLoadPromise = fetch("/api/admin/dashboard", { credentials: "include" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load dashboard");
        }
        return json.data as DashboardData;
      })
      .catch((err) => {
        dashboardLoadPromise = null;
        throw err;
      });
  }
  return dashboardLoadPromise;
}

interface SortHeaderProps {
  label: string;
  column: string;
  className?: string;
  sortKey: string;
  sortOrder: "asc" | "desc";
  onSort: (key: string) => void;
}

function SortHeader({ label, column, className, sortKey, sortOrder, onSort }: SortHeaderProps) {
  const active = sortKey === column;
  const Icon = active ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={className}>
      <button
        onClick={() => onSort(column)}
        className={`flex items-center gap-1.5 group transition-colors ${active ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`}
      >
        {label}
        <Icon size={13} className={active ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-500"} />
      </button>
    </th>
  );
}

export default function AdminDashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [counts, setCounts] = useState<DashboardCounts>({
    auctions: 0,
    active: 0,
    upcoming: 0,
    ended: 0,
    products: 0,
    users: 0,
    pendingPayments: 0,
    unreadNotifications: 0,
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const [tableAuctions, setTableAuctions] = useState<Auction[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableTotal, setTableTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // The initial table rows come from the consolidated dashboard
  // response, so the filter effect skips its first run.
  const tableInitialized = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================================================
  // CONSOLIDATED DASHBOARD LOAD (single request)
  // =========================================================

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardOnce();
        if (cancelled) return;
        setReport(data.report);
        setCounts(data.counts);
        setTableAuctions(Array.isArray(data.auctions) ? data.auctions : []);
        setTableTotal(data.pagination?.total ?? 0);
        setNotificationCount(data.counts?.unreadNotifications || 0);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTableLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // FILTERED TABLE (server-driven)
  // =========================================================

  useEffect(() => {
    if (!tableInitialized.current) {
      tableInitialized.current = true;
      return;
    }

    const params = new URLSearchParams({ limit: String(TABLE_LIMIT) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (sortKey) {
      params.set("sort", sortKey);
      params.set("order", sortOrder);
    }
    (async () => {
      setTableLoading(true);
      try {
        const res = await fetch(`/api/auctions?${params.toString()}`, { credentials: "include" });
        const json = await res.json();
        setTableAuctions(json.data || []);
        if (json.pagination) setTableTotal(json.pagination.total);
      } catch {
        setTableAuctions([]);
      } finally {
        setTableLoading(false);
      }
    })();
  }, [debouncedSearch, roleFilter, statusFilter, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const totalAuctions = counts.auctions;
  const uniqueProducts = counts.products;
  const totalUsers = counts.users;
  const totalBids = report?.totalBids || 0;
  const totalRevenue = report?.totalRevenue || 0;
  const pendingPayments = counts.pendingPayments;
  const activeAuctions = counts.active;

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

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

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
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Gavel size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Auctions Management</h3>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tableTotal} {tableTotal === 1 ? "auction" : "auctions"}
            </span>
          </div>
          <Link href="/admin/auctions" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            Manage <ArrowRight size={12} />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SELLER">SELLER</option>
            <option value="BIDDER">BIDDER</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ENDED">ENDED</option>
            <option value="UPCOMING">UPCOMING</option>
          </select>
        </div>

        {tableLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading auctions...
          </div>
        ) : tableAuctions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No auctions match your filters</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <SortHeader label="Role" column="role" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="Product Name" column="name" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="Current Bid" column="currentPrice" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="Status" column="status" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="End Time" column="endTime" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {tableAuctions.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="text-gray-500 text-sm">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        {a.product?.image && !failedImages.has(a.id) ? (
                          <Image
                            src={a.product.image}
                            alt=""
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                            onError={() => handleImageError(a.id)}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {a.product?.seller?.role ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          a.product.seller.role === "SUPER_ADMIN"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : a.product.seller.role === "ADMIN"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : a.product.seller.role === "SELLER"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                          {a.product.seller.role}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="font-medium text-gray-900 text-sm">{a.product?.title || "Untitled"}</td>
                    <td className="font-semibold text-gray-900 text-sm">${(a.currentPrice || a.startPrice || 0).toLocaleString()}</td>
                    <td>
                      <StatusBadge variant={a.status?.toLowerCase() as "active" | "ended" | "pending" || "active"}>
                        {a.status || "Unknown"}
                      </StatusBadge>
                    </td>
                    <td className="text-gray-500 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {a.endTime ? new Date(a.endTime).toLocaleString() : "N/A"}
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
