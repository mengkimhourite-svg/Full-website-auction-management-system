"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertCircle, Sparkles } from "lucide-react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import FilterPanel from "@/components/search/FilterPanel";
import SortDropdown from "@/components/search/SortDropdown";

const categories = ["Watches", "Jewelry", "Art", "Cars", "Wine", "Antiques", "Collectibles", "Electronics"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Ending Soon", value: "ending" },
];

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
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
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="eyebrow eyebrow-dark mb-5">
              <Sparkles size={14} className="text-yellow-400" /> Browse Auctions
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Discover & Bid</h1>
            <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto">Find exclusive items from premium sellers around the world</p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-gray-100 bg-white sticky top-[72px] z-20">
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
