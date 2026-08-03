"use client";

import Image from "next/image";
import { CheckCircle, Trash2, ImageOff } from "lucide-react";
import type { Auction, AuctionStatus } from "@/types";

interface AuctionTableProps {
  auctions: Auction[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AuctionTable({ auctions, onApprove, onDelete }: AuctionTableProps) {
  if (!auctions.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">No auctions found.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Current Price</th>
            <th>Status</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((auction) => (
            <tr key={auction.id}>
              <td>
                {auction.product?.image ? (
                  <Image
                    src={auction.product.image}
                    alt={auction.product.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageOff size={16} />
                  </div>
                )}
              </td>
              <td className="font-medium text-gray-900">{auction.product?.title || "Untitled"}</td>
              <td className="font-semibold text-indigo-600">${auction.currentPrice?.toLocaleString() || 0}</td>
              <td>
                <span
                  className={`badge ${
                    auction.status === "ACTIVE"
                      ? "badge-success"
                      : auction.status === ("PENDING" as AuctionStatus)
                      ? "badge-warning"
                      : auction.status === "ENDED"
                      ? "badge-neutral"
                      : "badge-danger"
                  }`}
                >
                  {auction.status || "UNKNOWN"}
                </span>
              </td>
              <td className="text-gray-500 text-sm">
                {auction.endDate || (auction.endTime ? new Date(auction.endTime).toLocaleDateString() : "—")}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  {auction.status === ("PENDING" as AuctionStatus) && (
                    <button
                      onClick={() => onApprove(auction.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(auction.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
