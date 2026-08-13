"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User, Tag, Loader2, AlertCircle, ImageOff, Heart, CreditCard } from "lucide-react";
import { getAuctionById } from "@/services/auction.service";
import { useCountdown } from "@/hooks/useCountdown";
import BidHistory from "@/components/auction/BidHistory";
import PlaceBidForm from "@/components/auction/PlaceBidForm";
import type { Bid, Product, UserSummary, Watchlist } from "@/types";

interface AuctionDetail {
  id: string;
  currentPrice: number;
  startPrice?: number;
  startTime?: string;
  endTime?: string;
  endDate?: string;
  status?: string;
  title?: string;
  description?: string;
  category?: string;
  productId?: string;
  product?: Product;
  bids?: Bid[];
  createdAt?: string;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [watchlisted, setWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const timeLeft = useCountdown(auction?.endDate || auction?.endTime || "");

  const fetchAuction = async () => {
    try {
      const data = await getAuctionById(id);
      setAuction(data);
      setError(null);
    } catch {
      setError("Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  const refreshAuction = async () => {
    setLoading(true);
    setError(null);
    await fetchAuction();
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const data = await getAuctionById(id);
          setAuction(data);
          setError(null);
        } catch {
          setError("Failed to load auction");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch("/api/watchlist", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const items: Watchlist[] = json?.data || [];
        setWatchlisted(items.some((w) => w.auctionId === id));
      })
      .catch(() => {});
  }, [id]);

  async function toggleWatchlist() {
    if (watchlistLoading) return;
    setWatchlistLoading(true);
    try {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const me = await meRes.json();
      if (!me?.data) {
        router.push("/login");
        return;
      }
      if (watchlisted) {
        const res = await fetch("/api/watchlist", { credentials: "include" });
        const json = await res.json();
        const items: Watchlist[] = json?.data || [];
        const entry = items.find((w) => w.auctionId === id);
        if (entry) await fetch(`/api/watchlist/${entry.id}`, { method: "DELETE", credentials: "include" });
        setWatchlisted(false);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auctionId: id }),
          credentials: "include",
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || "Failed to update watchlist");
        }
        setWatchlisted(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update watchlist");
    } finally {
      setWatchlistLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p className="text-gray-500 text-sm">Loading auction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-lg font-semibold text-gray-900">Error</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={refreshAuction}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">Auction Not Found</h2>
        <p className="text-gray-500 text-sm">The auction you are looking for does not exist or has been removed.</p>
        <Link
          href="/auctions"
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Auctions
        </Link>
      </div>
    );
  }

  const product = auction.product || ({} as Product);
  const images = product.image ? [product.image] : [];
  const seller = auction.product?.seller || ({} as UserSummary);
  const isEnded = auction.status === "ENDED" || auction.status === "SOLD";

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to Auctions
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden h-80 lg:h-96 flex items-center justify-center">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.title || "Auction image"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <ImageOff size={40} />
                  <span className="text-sm text-gray-400">No image available</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      idx === selectedImage
                        ? "border-indigo-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`} >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="64px" className="object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`badge ${
                    isEnded
                      ? "badge-danger"
                      : auction.status === "ACTIVE"
                      ? "badge-success"
                      : "badge-warning"
                  }`}
                >
                  {isEnded ? "Ended" : auction.status || "ACTIVE"}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Tag size={11} />
                  {auction.category || product.category || "General"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.title || auction.title || "Untitled Auction"}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border transition-colors ${
                    watchlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
                  }`}
                >
                  {watchlistLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Heart size={14} className={watchlisted ? "fill-red-500 text-red-500" : ""} />
                  )}
                  {watchlisted ? "Watchlisted" : "Add to Watchlist"}
                </button>
                {isEnded && (
                  <button
                    onClick={() => router.push(`/checkout?auctionId=${auction.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    <CreditCard size={14} />
                    Pay Now
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                {product.description || auction.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-3.5">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Seller</p>
                <p className="text-sm font-medium text-gray-900">
                  {seller.name || seller.email || "Unknown Seller"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Current Bid</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${(auction.currentPrice || auction.startPrice || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Starting Price</p>
                  <p className="text-base font-semibold text-gray-600">
                    ${(auction.startPrice || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                <Clock size={16} className="text-indigo-600" />
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Time Remaining</p>
                  <p className={`text-sm font-semibold ${isEnded ? "text-red-600" : "text-gray-900"}`}>
                    {isEnded ? "Auction Ended" : timeLeft}
                  </p>
                </div>
              </div>
            </div>

            {!isEnded && (
              <PlaceBidForm
                auctionId={auction.id}
                currentPrice={auction.currentPrice || auction.startPrice || 0}
                onBidPlaced={fetchAuction}
              />
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Bid History ({auction.bids?.length || 0})
              </h3>
              <BidHistory bids={auction.bids || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
