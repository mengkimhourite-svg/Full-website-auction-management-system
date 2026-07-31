interface PaymentStatusProps {
  status: string;
}

export default function PaymentStatus({ status }: PaymentStatusProps) {
  const config: Record<string, { class: string; label: string }> = {
    PENDING: { class: "badge-warning", label: "Pending" },
    SUCCESS: { class: "badge-success", label: "Success" },
    FAILED: { class: "badge-danger", label: "Failed" },
  };

  const { class: cls, label } = config[status] || {
    class: "badge-neutral",
    label: status,
  };

  return <span className={`badge ${cls}`}>{label}</span>;
}
