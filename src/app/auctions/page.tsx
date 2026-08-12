"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertCircle, Gavel, Sparkles, TrendingUp } from "lucide-react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import FilterPanel from "@/components/search/FilterPanel";
import SortDropdown from "@/components/search/SortDropdown";
import type { Auction } from "@/types";

const categories = ["Watches", "Jewelry", "Art", "Cars", "Wine", "Antiques", "Collectibles", "Electronics"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Ending Soon", value: "ending" },
];

type AuctionItem = Auction & {
  title?: string;
  description?: string;
  category?: string;
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        if (category) setSelectedCategories([category]);
        const res = await fetch("/api/auctions", { credentials: "include" });
        const data = await res.json();
        setAuctions(data?.data || data?.auctions || data || []);
      } catch {
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  let filtered = [...auctions];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((a) => {
      const title = a.product?.title || a.title || "";
      const desc = a.product?.description || a.description || "";
      return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter((a) => selectedCategories.includes(a.product?.category || a.category || ""));
  }

  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
      break;
    case "price-desc":
      filtered.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
      break;
    case "ending":
      filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
      break;
    default:
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Banner */}
      <section className="relative bg-linear-to-br from-[#0a0e1a] via-[#111827] to-[#1a1040] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 mb-6">
              <Gavel size={13} className="text-indigo-400" />
              <span className="text-indigo-300 text-xs font-semibold tracking-wide uppercase">Live Auctions</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-white">Discover &amp; </span>
              <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Bid</span>
            </h1>
            <p className="text-white/50 mt-4 text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
              Find exclusive items from premium sellers around the world
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Sparkles size={14} className="text-indigo-400" />
                <span>{auctions.length} Active Lots</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2 text-white/40">
                <TrendingUp size={14} className="text-indigo-400" />
                <span>Real-time Bidding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-200 bg-white sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <SortDropdown options={sortOptions} onSort={setSortBy} />
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 animate-fade-down">
              <FilterPanel categories={categories} onFilter={(f) => setSelectedCategories(f.categories || [])} />
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="loading-spinner" />
            <p className="text-gray-500 text-sm">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={40} className="text-gray-300" />
            <p className="text-gray-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm">Try Again</button>
          </div>
        ) : (
          <AuctionGrid auctions={filtered} loading={false} />
        )}
      </section>
    </div>
  );
}