"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Users,
  Gavel,
  DollarSign,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import EmptyState from "@/components/admin/EmptyState";
import type { MonthlyReport } from "@/types";

const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reports/monthly", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const json = await res.json();
        setReport(json.data || json.report || json);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { title: "Total Users", value: report?.totalUsers?.toLocaleString() || "0", icon: <Users size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Total Auctions", value: report?.totalAuctions?.toLocaleString() || "0", icon: <Gavel size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Total Revenue", value: `$${(report?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={22} />, color: "from-emerald-500 to-teal-500" },
    { title: "Total Bids", value: report?.totalBids?.toLocaleString() || "0", icon: <Wallet size={22} />, color: "from-amber-500 to-orange-500" },
  ];

  const revenueData = report?.monthlyRevenue || report?.revenueByMonth || [];
  const auctionsData = report?.monthlyAuctions || report?.auctionsByMonth || [];
  const roleData = report?.usersByRole || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<BarChart3 size={22} />}
        title="Reports"
        description="Platform analytics"
        actions={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Download size={16} />
            Export
          </button>
        }
      />

      {loading && <LoadingSpinner text="Loading reports..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900">Monthly Revenue</h3>
              </div>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">No revenue data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Gavel size={16} className="text-sky-500" />
                <h3 className="text-sm font-bold text-gray-900">Auctions by Month</h3>
              </div>
              {auctionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={auctionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="auctions" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">No auction data</div>
              )}
            </div>
          </div>

          {roleData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Users size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900">Users by Role</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="role"
                    >
                      {roleData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 min-w-[160px]">
                  {roleData.map((item, index) => (
                    <div key={item.role} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{item.role}</span>
                      <span className="text-sm font-bold text-gray-900 ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Platform Overview</h3>
                <p className="text-sm text-gray-500">
                  The platform is running with <strong className="text-gray-700">{report.totalUsers || 0}</strong> registered users,{" "}
                  <strong className="text-gray-700">{report.totalAuctions || 0}</strong> auctions listed, and{" "}
                  <strong className="text-gray-700">${(report.totalRevenue || 0).toLocaleString()}</strong> in total revenue.{" "}
                  A total of <strong className="text-gray-700">{report.totalBids || 0}</strong> bids have been placed.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !report && (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No report data available"
          description="Reports will be available once there is platform activity"
        />
      )}
    </div>
  );
}
