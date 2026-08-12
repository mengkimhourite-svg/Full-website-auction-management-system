"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface AuctionActionsProps {
  auctionId: string;
}

export default function AuctionActions({ auctionId }: AuctionActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this auction? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}`, { method: "DELETE" });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        alert(json.error || "Failed to delete auction");
        return;
      }

      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-all disabled:opacity-60"
    >
      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
