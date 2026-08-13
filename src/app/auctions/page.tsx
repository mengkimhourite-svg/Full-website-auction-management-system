"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Palette } from "lucide-react";
import ArtCard from "@/components/auction/ArtCard";
import SortDropdown from "@/components/search/SortDropdown";
import type { Auction } from "@/types";

const sortOptions = [
  { label: "Ending Soon", value: "ending" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("ending");
  const [watchMap, setWatchMap] = useState<Record<string, string>>({});
  const [watchLoading, setWatchLoading] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        if (category) setSelectedCategory(category);

        const res = await fetch("/api/auctions", { credentials: "include" });
        const data = await res.json();
        setAuctions(data?.data || data?.auctions || data || []);
      } catch {
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };

    const fetchWatchlist = async () => {
      try {
        const res = await fetch("/api/watchlist", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data || [];
        if (Array.isArray(items)) {
          const map: Record<string, string> = {};
          for (const w of items) if (w.auctionId) map[w.auctionId] = w.id;
          setWatchMap(map);
        }
      } catch {
        // ignore
      }
    };

    fetchAuctions();
    fetchWatchlist();
  }, []);

  const toggleWatch = useCallback(
    async (auctionId: string) => {
      if (watchLoading) return;
      const entryId = watchMap[auctionId];
      const isWatched = !!entryId;
      setWatchLoading(true);
      try {
        if (isWatched) {
          const res = await fetch(`/api/watchlist/${entryId}`, { method: "DELETE", credentials: "include" });
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          if (res.ok) {
            setWatchMap((prev) => {
              const next = { ...prev };
              delete next[auctionId];
              return next;
            });
          }
        } else {
          const res = await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ auctionId }),
            credentials: "include",
          });
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          const json = await res.json().catch(() => ({}));
          if (res.ok && json.data?.id) setWatchMap((prev) => ({ ...prev, [auctionId]: json.data.id }));
        }
      } catch {
        // ignore network errors
      } finally {
        setWatchLoading(false);
      }
    },
    [watchMap, watchLoading]
  );

  const categories = ["All", ...Array.from(new Set(auctions.map((a) => a.product?.category || a.category || "General")))];

  let filtered = [...auctions];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((a) =>
      ((a.product?.title || a.title || "") + " " + (a.product?.description || a.description || "")).toLowerCase().includes(q)
    );
  }

  if (selectedCategory !== "All") {
    filtered = filtered.filter((a) => (a.product?.category || a.category || "General") === selectedCategory);
  }

  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => ((a.currentPrice || a.startPrice) || 0) - ((b.currentPrice || b.startPrice) || 0));
      break;
    case "price-desc":
      filtered.sort((a, b) => ((b.currentPrice || b.startPrice) || 0) - ((a.currentPrice || a.startPrice) || 0));
      break;
    case "newest":
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      break;
    default:
      filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
  }

  return (
    <div className="min-h-screen dashboard-admin bg-slate-50 pt-20">
      {/* ===================== HEADER ===================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <Palette size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Auction Marketplace</p>
              <h1 className="mt-0.5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Auctions</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-base text-slate-500">
            Discover unique artwork and bid in real time.
          </p>
        </div>
      </section>

      {/* ===================== SEARCH / SORT ===================== */}
      <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="shrink-0">
              <SortDropdown options={sortOptions} onSort={setSortBy} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== RESULTS ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/4 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-10 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="text-lg font-bold text-slate-900">Something went wrong</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-50">
              <Search size={24} className="text-indigo-600" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">No auctions found</h3>
            <p className="mt-2 text-sm text-slate-500">Try changing your search or picking a different category.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <p className="text-sm font-medium text-slate-500">
                {filtered.length} auction{filtered.length !== 1 ? "s" : ""} available
              </p>
              {selectedCategory !== "All" && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {selectedCategory}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((auction) => (
                <ArtCard
                  key={auction.id}
                  auction={auction}
                  watched={!!watchMap[auction.id]}
                  loading={watchLoading}
                  onToggleWatch={toggleWatch}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}