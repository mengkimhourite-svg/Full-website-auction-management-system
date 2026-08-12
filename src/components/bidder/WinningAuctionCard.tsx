"use client";

import {
  CheckCircle,
  CreditCard,
  ImageOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Auction, Product } from "@/types";

type WonAuction = Auction & {
  paymentStatus?: string;
};

interface WinningAuctionCardProps {
  auction: WonAuction;
}

export default function WinningAuctionCard({
  auction,
}: WinningAuctionCardProps) {
  const product = auction.product || ({} as Product);
  const paymentStatus = auction.paymentStatus || "PENDING";

  return (
    <div className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">

      {/* =========================================================
          MAIN CARD
      ========================================================= */}

      <div className="flex items-center gap-4 p-4 sm:p-5">

        {/* =======================================================
            PRODUCT IMAGE
        ======================================================= */}

        <Link
          href={`/auctions/${auction.id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title || "Auction product"}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageOff size={20} />
            </div>
          )}
        </Link>

        {/* =======================================================
            PRODUCT INFORMATION
        ======================================================= */}

        <div className="min-w-0 flex-1">

          {/* Won Badge */}

          <div className="mb-1.5 flex items-center gap-2">

            <CheckCircle
              size={15}
              className="text-emerald-500"
            />

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Won
            </span>

          </div>

          {/* Product Title */}

          <Link
            href={`/auctions/${auction.id}`}
            className="no-underline"
          >
            <h3 className="truncate text-sm font-bold text-slate-950 transition-colors hover:text-blue-600">
              {product.title || "Untitled Auction"}
            </h3>
          </Link>

          {/* Price */}

          <p className="mt-1.5 text-lg font-extrabold text-blue-600">
            $
            {(auction.currentPrice || 0).toLocaleString()}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Winning bid
          </p>

        </div>

        {/* =======================================================
            PAYMENT INFORMATION
        ======================================================= */}

        <div className="shrink-0 text-right">

          {/* Payment Status */}

          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${
                paymentStatus === "SUCCESS"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : paymentStatus === "FAILED"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }
            `}
          >

            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  paymentStatus === "SUCCESS"
                    ? "bg-emerald-500"
                    : paymentStatus === "FAILED"
                    ? "bg-red-500"
                    : "bg-amber-500"
                }
              `}
            />

            {paymentStatus === "SUCCESS"
              ? "Paid"
              : paymentStatus === "FAILED"
              ? "Failed"
              : "Pending"}

          </span>

          {/* Pay Now */}

          {paymentStatus !== "SUCCESS" && (
            <Link
              href={`/checkout?auctionId=${auction.id}`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100"
            >
              <CreditCard size={12} />
              Pay Now
            </Link>
          )}

        </div>

      </div>

      {/* =========================================================
          BOTTOM ACCENT
      ========================================================= */}

      <div className="h-0.5 w-full bg-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

    </div>
  );
}