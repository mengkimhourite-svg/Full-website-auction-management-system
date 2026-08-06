"use client";

type BadgeVariant = "active" | "pending" | "ended" | "success" | "failed" | "warning" | "info" | "draft";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: "badge-success",
  pending: "badge-warning",
  ended: "badge-neutral",
  success: "badge-success",
  failed: "badge-danger",
  warning: "badge-warning",
  info: "badge-info",
  draft: "badge-neutral",
};

export default function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
