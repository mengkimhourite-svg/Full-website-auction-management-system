interface ReportChartProps {
  data: any[];
  title: string;
}

const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportChart({ data, title }: ReportChartProps) {
  if (!data.length) {
    return (
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0));

  return (
    <div className="stat-card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="flex items-end gap-3 h-48">
        {data.map((item, idx) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-xs font-semibold text-gray-600">{item.value}</span>
              <div
                className="w-full rounded-t-lg transition-all hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: colors[idx % colors.length],
                  minHeight: height > 0 ? "4px" : "0",
                }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-gray-500 text-center truncate w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
