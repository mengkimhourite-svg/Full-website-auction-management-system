interface SellerStatsProps {
  stats: {
    totalAuctions: number;
    activeAuctions: number;
    totalBids: number;
    revenue: number;
  };
}

export default function SellerStats({ stats }: SellerStatsProps) {
  const cards = [
    { label: "Total Auctions", value: stats.totalAuctions, color: "#4f46e5" },
    { label: "Active Auctions", value: stats.activeAuctions, color: "#0ea5e9" },
    { label: "Total Bids", value: stats.totalBids, color: "#10b981" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="stat-card">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
