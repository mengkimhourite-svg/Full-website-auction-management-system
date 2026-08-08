"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">Discover &amp; Bid</h1>
          <p className="text-white/50 mt-3 text-base max-w-xl mx-auto">
            Find exclusive items from premium sellers around the world
          </p>
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <SortDropdown options={sortOptions} onSort={setSortBy} />
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
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
