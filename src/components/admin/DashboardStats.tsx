import type { LucideIcon } from "lucide-react";

interface DashboardStatsProps {
  stats: { title: string; value: string; icon: LucideIcon; color: string }[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="stat-card flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
            <stat.icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
