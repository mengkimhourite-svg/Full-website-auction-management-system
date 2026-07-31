"use client";

import { Clock, Edit, Trash2, ImageOff, Users } from "lucide-react";
import CountdownTimer from "@/components/auction/CountdownTimer";

interface SellerAuctionCardProps {
  auction: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SellerAuctionCard({ auction, onEdit, onDelete }: SellerAuctionCardProps) {
  const product = auction.product || {};

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all">
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageOff size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`badge text-xs ${
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
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700">
          <Clock size={14} className="text-indigo-600" />
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 truncate">{product.title || "Untitled"}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xl font-bold text-indigo-600">${(auction.currentPrice || 0).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users size={14} />
            {auction._count?.bids || 0}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(auction.id)}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(auction.id)}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
