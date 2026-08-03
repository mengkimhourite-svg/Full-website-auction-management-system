"use client";

import { CheckCircle, CreditCard, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Auction, Product } from "@/types";

type WonAuction = Auction & { paymentStatus?: string };

interface WinningAuctionCardProps {
  auction: WonAuction;
}

export default function WinningAuctionCard({ auction }: WinningAuctionCardProps) {
  const product = auction.product || ({} as Product);
  const paymentStatus = auction.paymentStatus || "PENDING";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all">
      <div className="flex items-center gap-4 p-4">
        <Link href={`/auctions/${auction.id}`} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 no-underline">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              <ImageOff size={20} />
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-500" />
            <span className="badge badge-success">Won</span>
          </div>
          <Link href={`/auctions/${auction.id}`} className="no-underline">
            <h3 className="text-sm font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">
              {product.title || "Untitled Auction"}
            </h3>
          </Link>
          <p className="text-lg font-bold text-indigo-600 mt-1">
            ${(auction.currentPrice || 0).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`badge text-xs ${
              paymentStatus === "SUCCESS"
                ? "badge-success"
                : paymentStatus === "FAILED"
                ? "badge-danger"
                : "badge-warning"
            }`}
          >
            {paymentStatus === "SUCCESS" ? "Paid" : paymentStatus === "FAILED" ? "Failed" : "Pending"}
          </span>
          {paymentStatus !== "SUCCESS" && (
            <Link
              href={`/checkout?auctionId=${auction.id}`}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors no-underline"
            >
              <CreditCard size={12} />
              Pay Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
