"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Tag, Loader2, AlertCircle, ImageOff, Heart, CreditCard } from "lucide-react";
import { getAuctionById } from "@/services/auction.service";
import { useCountdown } from "@/hooks/useCountdown";
import BidHistory from "@/components/auction/BidHistory";
import PlaceBidForm from "@/components/auction/PlaceBidForm";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [auction, setAuction] = useState<any>(null);
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
    fetch("/api/watchlist")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const items: any[] = json?.data || [];
        setWatchlisted(items.some((w) => w.auctionId === id));
      })
      .catch(() => {});
  }, [id]);

  async function toggleWatchlist() {
    if (watchlistLoading) return;
    setWatchlistLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();
      if (!me?.data) {
        router.push("/login");
        return;
      }
      if (watchlisted) {
        const res = await fetch("/api/watchlist");
        const json = await res.json();
        const items: any[] = json?.data || [];
        const entry = items.find((w) => w.auctionId === id);
        if (entry) await fetch(`/api/watchlist/${entry.id}`, { method: "DELETE" });
        setWatchlisted(false);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auctionId: id }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || "Failed to update watchlist");
        }
        setWatchlisted(true);
      }
    } catch (err: any) {
      alert(err.message);
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
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Error</h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={refreshAuction}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="loading-page">
        <AlertCircle size={48} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Auction Not Found</h2>
        <p className="text-gray-500">The auction you are looking for does not exist or has been removed.</p>
        <Link
          href="/auctions"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
        >
          <ArrowLeft size={16} />
          Back to Auctions
        </Link>
      </div>
    );
  }

  const product = auction.product || {};
  const images = product.image ? [product.image] : [];
  const seller = auction.product?.seller || {};
  const isEnded = auction.status === "ENDED" || auction.status === "SOLD";

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Auctions
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-96 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title || "Auction image"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageOff size={48} />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      idx === selectedImage
                        ? "border-indigo-600 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
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
                  <Tag size={12} />
                  {auction.category || product.category || "General"}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {product.title || auction.title || "Untitled Auction"}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                    watchlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
                  }`}
                >
                  {watchlistLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Heart size={16} className={watchlisted ? "fill-red-500 text-red-500" : ""} />
                  )}
                  {watchlisted ? "Watchlisted" : "Add to Watchlist"}
                </button>
                {isEnded && (
                  <button
                    onClick={() => router.push(`/checkout?auctionId=${auction.id}`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    <CreditCard size={16} />
                    Pay Now
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3 leading-relaxed">
                {product.description || auction.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Seller</p>
                <p className="text-sm font-semibold text-gray-900">
                  {seller.name || seller.email || "Unknown Seller"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                    ${(auction.currentPrice || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Starting Price</p>
                  <p className="text-lg font-semibold text-gray-700">
                    ${(auction.startPrice || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-500">Time Remaining</p>
                  <p className={`font-bold ${isEnded ? "text-red-600" : "text-gray-900"}`}>
                    {isEnded ? "Auction Ended" : timeLeft}
                  </p>
                </div>
              </div>
            </div>

            {!isEnded && (
              <PlaceBidForm
                auctionId={auction.id}
                currentPrice={auction.currentPrice || 0}
                onBidPlaced={fetchAuction}
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
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
