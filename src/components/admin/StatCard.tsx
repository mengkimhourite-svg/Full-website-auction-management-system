"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}

export default function StatCard({ title, value, description, icon, trend, color = "from-indigo-600 to-purple-600" }: StatCardProps) {
  return (
    <div className="stat-card flex items-start gap-5">
      <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.isPositive ? "text-green-600" : "text-red-500"}`}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
