"use client";

import Image from "next/image";
import { Edit, Trash2, ImageOff } from "lucide-react";
import type { Auction } from "@/types";

interface SellerAuctionTableProps {
  auctions: Auction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SellerAuctionTable({ auctions, onEdit, onDelete }: SellerAuctionTableProps) {
  if (!auctions.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">No auctions yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Bids</th>
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
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImageOff size={16} />
                  </div>
                )}
              </td>
              <td className="font-medium text-gray-900">{auction.product?.title || "Untitled"}</td>
              <td className="font-semibold text-indigo-600">${(auction.currentPrice || 0).toLocaleString()}</td>
              <td className="text-gray-500">{auction._count?.bids || 0}</td>
              <td>
                <span
                  className={`badge ${
                    auction.status === "ACTIVE"
                      ? "badge-success"
                      : auction.status === "ENDED"
                      ? "badge-neutral"
                      : "badge-warning"
                  }`}
                >
                  {auction.status || "DRAFT"}
                </span>
              </td>
              <td className="text-gray-500 text-sm">
                {auction.endDate || (auction.endTime ? new Date(auction.endTime).toLocaleDateString() : "—")}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(auction.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(auction.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
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
