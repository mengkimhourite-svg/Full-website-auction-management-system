"use client";

import Image from "next/image";
import { Clock, Edit, Trash2, ImageOff, Users } from "lucide-react";
import CountdownTimer from "@/components/auction/CountdownTimer";
import type { Auction, Product } from "@/types";

interface SellerAuctionCardProps {
  auction: Auction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SellerAuctionCard({ auction, onEdit, onDelete }: SellerAuctionCardProps) {
  const product: Partial<Product> = auction.product || {};

  return (
    <div className="card overflow-hidden group">
      <div className="relative h-44 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title || "Auction image"}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
            <ImageOff size={28} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
        <div className="absolute top-3 left-3">
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
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700">
          <Clock size={11} className="text-indigo-500" />
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{product.title || "Untitled"}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-base font-bold text-indigo-600">${(auction.currentPrice || auction.startPrice || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            {auction._count?.bids || 0}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onEdit(auction.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <Edit size={10} />
            Edit
          </button>
          <button
            onClick={() => onDelete(auction.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={10} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
