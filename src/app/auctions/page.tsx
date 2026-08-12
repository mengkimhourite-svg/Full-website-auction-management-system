"use client";
import Link from "next/link";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  Gavel,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import FilterPanel from "@/components/search/FilterPanel";
import SortDropdown from "@/components/search/SortDropdown";
import type { Auction } from "@/types";

const categories = [
  "Watches",
  "Jewelry",
  "Art",
  "Cars",
  "Wine",
  "Antiques",
  "Collectibles",
  "Electronics",
];

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

        if (category) {
          setSelectedCategories([category]);
        }

        const res = await fetch("/api/auctions", {
          credentials: "include",
        });

        const data = await res.json();

        setAuctions(
          data?.data ||
            data?.auctions ||
            data ||
            []
        );
      } catch {
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  /* ============================================================
     FILTER
  ============================================================ */

  let filtered = [...auctions];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();

    filtered = filtered.filter((a) => {
      const title =
        a.product?.title ||
        a.title ||
        "";

      const desc =
        a.product?.description ||
        a.description ||
        "";

      return (
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q)
      );
    });
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter((a) =>
      selectedCategories.includes(
        a.product?.category ||
          a.category ||
          ""
      )
    );
  }

  /* ============================================================
     SORT
  ============================================================ */

  switch (sortBy) {
    case "price-asc":
      filtered.sort(
        (a, b) =>
          (a.currentPrice || 0) -
          (b.currentPrice || 0)
      );
      break;

    case "price-desc":
      filtered.sort(
        (a, b) =>
          (b.currentPrice || 0) -
          (a.currentPrice || 0)
      );
      break;

    case "ending":
      filtered.sort(
        (a, b) =>
          new Date(a.endTime).getTime() -
          new Date(b.endTime).getTime()
      );
      break;

    default:
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden bg-white">

        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -right-40 -top-40 h-125 w-125 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="absolute -left-40 top-40 h-100 w-100 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="absolute right-[25%] top-24 h-3 w-3 rounded-full bg-blue-400/40" />

          <div className="absolute right-[12%] top-[50%] h-2 w-2 rounded-full bg-indigo-400/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">

            {/* LEFT */}
            <div>

              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                <Gavel size={14} />
                Live Auctions
              </div>

              {/* Heading */}
              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Discover.
                <br />

                <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Bid. Win.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Explore exclusive products from trusted sellers around
                the world and participate in exciting real-time auctions.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-4">

                <a
                  href="#auctions"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Explore Auctions
                  <ArrowRight size={17} />
                </a>

                <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
                    <ShieldCheck size={17} className="text-emerald-500" /> Secure Bidding
                </Link>

              </div>

              {/* Stats */}
              
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative mx-auto w-full max-w-xl">

              {/* Main auction preview */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-900/10">

                <div className="relative h-82.5 overflow-hidden rounded-xl bg-slate-100">

                  <img src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=85" alt="Luxury watch auction" className="h-full w-full object-cover transition duration-700 hover:scale-105"/>

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Live badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

                    LIVE AUCTION
                  </div>

                  {/* Category */}
                  <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                    Luxury Watches
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-4 left-4 right-4">

                    <div className="rounded-xl bg-slate-950/80 p-4 text-white backdrop-blur-md">

                      <div className="flex items-end justify-between gap-4">

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50">
                            Featured Auction
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            Rolex Submariner Date
                          </h3>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] uppercase text-white/50">
                            Current Bid
                          </p>

                          
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
                {/* Card bottom */}
                <div className="flex items-center justify-between px-3 py-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Bidding activity
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <TrendingUp
                        size={16}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-bold text-slate-900">
                        High demand
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    24 bids
                  </div>

                </div>

              </div>
              {/* Floating card */}
              {/* Verified card */}
              

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SEARCH / FILTER BAR
      ======================================================== */}

      <section className="sticky top-16 z-20 border-y border-slate-200 bg-white/95 backdrop-blur-md">

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* Search */}
            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search auctions..."
                className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">

              <SortDropdown
                options={sortOptions}
                onSort={setSortBy}
              />

              <button
                onClick={() =>
                  setShowFilters(!showFilters)
                }
                className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-all ${
                  showFilters
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <SlidersHorizontal size={15} />

                Filters
              </button>

            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 border-t border-slate-100 pt-4 animate-fade-down">
              <FilterPanel
                categories={categories}
                onFilter={(f) =>
                  setSelectedCategories(
                    f.categories || []
                  )
                }
              />
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          RESULTS
      ======================================================== */}

      <section
        id="auctions"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >

        {/* Result header */}
        {!loading && !error && (
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Marketplace
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                Live Auctions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} auction
                {filtered.length !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* Active filters */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">

                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                  >
                    {category}
                  </span>
                ))}

              </div>
            )}

          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">

            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading auctions...
            </p>

          </div>
        ) : error ? (

          /* Error */
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-50">
              <AlertCircle
                size={24}
                className="text-red-500"
              />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        ) : filtered.length === 0 ? (

          /* Empty */
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-blue-50">
              <Search
                size={25}
                className="text-blue-600"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No auctions found
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Try changing your search or removing some filters.
            </p>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
              }}
              className="mt-5 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* Auction grid */
          <AuctionGrid
            auctions={filtered}
            loading={false}
          />

        )}

      </section>
    </div>
  );
}