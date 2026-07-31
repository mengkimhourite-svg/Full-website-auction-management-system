interface UserStatusBadgeProps {
  status: string;
  banned?: boolean;
}

export default function UserStatusBadge({ status, banned }: UserStatusBadgeProps) {
  if (banned) {
    return <span className="badge badge-danger">Banned</span>;
  }
  const isActive = status.toLowerCase() === "active";

  return (
    <span
      className={`badge ${
        isActive ? "badge-success" : "badge-danger"
      }`}
    >
      {status}
    </span>
  );
}
