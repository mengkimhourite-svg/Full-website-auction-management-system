"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertCircle, Sparkles } from "lucide-react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import FilterPanel from "@/components/search/FilterPanel";
import SortDropdown from "@/components/search/SortDropdown";
import Reveal from "@/components/animations/Reveal";
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
        const res = await fetch("/api/auctions");
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
    <div className="min-h-screen bg-white pt-24">
      {/* Hero Banner */}
      <section className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="scale" className="mb-5">
            <span className="eyebrow eyebrow-dark">
              <Sparkles size={14} className="text-yellow-400" /> Browse Auctions
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Discover &amp; Bid</h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Find exclusive items from premium sellers around the world
            </p>
          </Reveal>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-100 bg-white sticky top-18 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <SortDropdown options={sortOptions} onSort={setSortBy} />
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${showFilters ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 animate-fade-down">
              <FilterPanel categories={categories} onFilter={(f) => setSelectedCategories(f.categories || [])} />
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner" />
            <p className="text-gray-500 text-sm">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={48} className="text-gray-300" />
            <p className="text-gray-500">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
          </div>
        ) : (
          <AuctionGrid auctions={filtered} loading={false} />
        )}
      </section>
    </div>
  );
}
