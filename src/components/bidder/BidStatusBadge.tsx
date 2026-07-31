interface BidStatusBadgeProps {
  status: string;
}

export default function BidStatusBadge({ status }: BidStatusBadgeProps) {
  const config: Record<string, { class: string; label: string }> = {
    winning: { class: "badge-success", label: "Winning" },
    outbid: { class: "badge-warning", label: "Outbid" },
    won: { class: "badge-success", label: "Won" },
    lost: { class: "badge-danger", label: "Lost" },
  };

  const { class: cls, label } = config[status.toLowerCase()] || {
    class: "badge-neutral",
    label: status,
  };

  return <span className={`badge ${cls}`}>{label}</span>;
}
