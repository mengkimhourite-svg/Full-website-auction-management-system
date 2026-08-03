import type { LucideIcon } from "lucide-react";

interface DashboardStatsProps {
  stats: { title: string; value: string; icon: LucideIcon; color: string }[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="stat-card flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-${stat.color}/20`}>
            <stat.icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
