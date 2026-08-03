"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Gavel,
  DollarSign,
  Wallet,
  LayoutDashboard,
  ArrowRight,
  PlusCircle,
  BarChart3,
  CreditCard,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Auction, MonthlyReport, User } from "@/types";

export default function AdminDashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [reportRes, auctionsRes, usersRes] = await Promise.all([
          fetch("/api/reports/monthly"),
          fetch("/api/auctions"),
          fetch("/api/users"),
        ]);
        const [reportJson, auctionsJson, usersJson] = await Promise.all([
          reportRes.json(),
          auctionsRes.json(),
          usersRes.json(),
        ]);
        setReport(reportJson.data || reportJson.report || reportJson);
        setAuctions((auctionsJson.data || []).slice(0, 5));
        setUsers((usersJson.data || []).slice(0, 5));
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { title: "Total Users", value: report?.totalUsers?.toLocaleString() || "0", icon: Users, color: "from-indigo-600 to-purple-600" },
    { title: "Total Auctions", value: report?.totalAuctions?.toLocaleString() || "0", icon: Gavel, color: "from-sky-500 to-cyan-500" },
    { title: "Total Revenue", value: `$${(report?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { title: "Total Bids", value: report?.totalBids?.toLocaleString() || "0", icon: Wallet, color: "from-amber-500 to-orange-500" },
  ];

  const quickLinks = [
    { label: "Create Auction", href: "/admin/create", icon: PlusCircle, color: "from-indigo-600 to-purple-600" },
    { label: "Manage Users", href: "/admin/users", icon: Users, color: "from-sky-500 to-cyan-500" },
    { label: "View Payments", href: "/admin/payments", icon: CreditCard, color: "from-emerald-500 to-teal-500" },
    { label: "Reports", href: "/admin/reports", icon: BarChart3, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor users, auctions, and platform activity</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="stat-card flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {link.label}
                  </span>
                  <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Gavel size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Recent Auctions</h3>
                </div>
                <Link href="/admin/auctions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  View All
                </Link>
              </div>
              {auctions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No auctions yet</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {auctions.map((a) => (
                    <li key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      {a.product?.image ? (
                        <Image
                          src={a.product.image}
                          alt={a.product.title || "Auction"}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{a.product?.title || "Untitled"}</p>
                        <p className="text-xs text-gray-400 capitalize">{a.status?.toLowerCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${(a.currentPrice || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                          <Clock size={11} /> {a._count?.bids || 0} bids
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Recent Users</h3>
                </div>
                <Link href="/admin/users" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  View All
                </Link>
              </div>
              {users.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No users yet</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <li key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {(u.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className={`badge ${u.banned ? "badge-danger" : u.role === "ADMIN" ? "badge-gold" : u.role === "SELLER" ? "badge-info" : "badge-neutral"}`}>
                        {u.banned ? "Banned" : u.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
