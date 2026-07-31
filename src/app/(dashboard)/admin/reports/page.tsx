"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Download, Users, Gavel, DollarSign, Wallet } from "lucide-react";
import DashboardStats from "@/components/admin/DashboardStats";
import ReportChart from "@/components/admin/ReportChart";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/reports/monthly");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const json = await res.json();
        setReport(json.data || json.report || json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { title: "Total Users", value: report?.totalUsers?.toLocaleString() || "0", icon: Users, color: "#4f46e5" },
    { title: "Total Auctions", value: report?.totalAuctions?.toLocaleString() || "0", icon: Gavel, color: "#0ea5e9" },
    { title: "Total Revenue", value: `$${(report?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "#10b981" },
    { title: "Total Bids", value: report?.totalBids?.toLocaleString() || "0", icon: Wallet, color: "#f59e0b" },
  ];

  const auctionChartData = report?.monthlyAuctions || report?.auctionsByMonth || [];
  const revenueChartData = report?.monthlyRevenue || report?.revenueByMonth || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">Monthly platform analytics and insights</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="loading-spinner" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && report && (
        <>
          <DashboardStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportChart data={auctionChartData} title="Auctions Created per Month" />
            <ReportChart data={revenueChartData} title="Monthly Revenue" />
          </div>

          <div className="stat-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Platform Overview</h3>
              <p className="text-sm text-gray-500">
                The platform is running with <strong className="text-gray-700">{report.totalUsers || 0}</strong> registered users,{" "}
                <strong className="text-gray-700">{report.totalAuctions || 0}</strong> auctions listed, and{" "}
                <strong className="text-gray-700">${(report.totalRevenue || 0).toLocaleString()}</strong> in total revenue.{" "}
                A total of <strong className="text-gray-700">{report.totalBids || 0}</strong> bids have been placed.
              </p>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !report && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <BarChart3 size={28} />
          </div>
          <p className="text-gray-500 font-medium">No report data available</p>
          <p className="text-sm text-gray-400">Reports will be available once there is platform activity</p>
        </div>
      )}
    </div>
  );
}
