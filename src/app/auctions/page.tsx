"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Palette, ChevronLeft, ChevronRight } from "lucide-react";

import ArtCard from "@/components/auction/ArtCard";
import SortDropdown from "@/components/search/SortDropdown";
import { useAuth } from "@/hooks/useAuth";

import type { Auction } from "@/types";

const sortOptions = [
  { label: "Ending Soon", value: "ending" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

// Maps the dropdown values to the API's (sort, order) query params.
const SORT_TO_PARAMS: Record<
  string,
  { sort: string; order: "asc" | "desc" }
> = {
  ending: { sort: "endTime", order: "asc" },
  newest: { sort: "newest", order: "asc" },
  "price-asc": { sort: "currentPrice", order: "asc" },
  "price-desc": { sort: "currentPrice", order: "desc" },
};

const PAGE_SIZE = 24;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function AuctionsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // =========================================================
  // STATE
  // =========================================================

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [retryKey, setRetryKey] = useState(0);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );

  const [watchMap, setWatchMap] = useState<Record<string, string>>({});
  const [watchLoading, setWatchLoading] = useState(false);

  // =========================================================
  // URL-DERIVED FILTERS (single source of truth)
  // =========================================================

  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const search = searchParams.get("search") ?? "";
  const selectedCategory = searchParams.get("category") ?? "All";
  const sortParam = searchParams.get("sort");
  const orderParam = searchParams.get("order");
  const sortBy =
    sortParam === "currentPrice"
      ? orderParam === "desc"
        ? "price-desc"
        : "price-asc"
      : sortParam === "endTime"
        ? "ending"
        : sortParam === "newest"
          ? "newest"
          : "ending";

  // =========================================================
  // URL UPDATES
  // =========================================================

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(
        searchParams.toString()
      );

      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          value === "All"
        ) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      router.replace(
        `${pathname}?${next.toString()}`,
        { scroll: false }
      );
    },
    [searchParams, pathname, router]
  );

  const handleSort = (value: string) => {
    const { sort, order } =
      SORT_TO_PARAMS[value] ??
      SORT_TO_PARAMS.ending;

    pushParams({ sort, order, page: null });
  };

  const handleCategory = (category: string) => {
    pushParams({
      category: category === "All" ? null : category,
      page: null,
    });
  };

  const goToPage = (nextPage: number) => {
    pushParams({ page: String(nextPage) });
  };

  // =========================================================
  // SEARCH DEBOUNCE -> URL
  // =========================================================

  useEffect(() => {
    const trimmed = searchInput.trim();

    if (trimmed === search) {
      return;
    }

    const handler = setTimeout(() => {
      pushParams({
        search: trimmed || null,
        page: null,
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, search, pushParams]);

  // =========================================================
  // FETCH AUCTIONS (server-driven)
  // =========================================================

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const { sort, order } =
      SORT_TO_PARAMS[sortBy] ??
      SORT_TO_PARAMS.ending;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sort,
      order,
    });

    if (search) {
      params.set("search", search);
    }

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    fetch(`/api/auctions?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        setLoading(true);
        setError("");

        if (!res.ok) {
          throw new Error(
            `API returned ${res.status}`
          );
        }

        return res.json();
      })
      .then((json) => {
        if (cancelled) return;

        const auctionData = json?.data;

        if (!Array.isArray(auctionData)) {
          throw new Error(
            "Invalid auctions response format from server."
          );
        }

        setAuctions(auctionData);

        if (json?.pagination) {
          setPagination(json.pagination);
        }

        if (Array.isArray(json?.categories)) {
          setCategories(json.categories);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load auctions"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, search, selectedCategory, sortBy, retryKey]);

  // =========================================================
  // FETCH WATCHLIST
  // =========================================================

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      // -------------------------------------------------------
      // NOT LOGGED IN
      // -------------------------------------------------------

      if (res.status === 401) {
        setWatchMap({});

        return;
      }

      // -------------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------------

      if (!res.ok) {
        return;
      }

      // -------------------------------------------------------
      // JSON
      // -------------------------------------------------------

      const json = await res.json();

      const items = json?.data ?? [];

      if (!Array.isArray(items)) {
        return;
      }

      // -------------------------------------------------------
      // CREATE MAP
      // -------------------------------------------------------

      const map: Record<string, string> = {};

      for (const item of items) {
        if (item?.auctionId && item?.id) {
          map[item.auctionId] = item.id;
        }
      }

      setWatchMap(map);
    } catch (err) {
      console.warn(
        "Watchlist request failed:",
        err
      );

      // Watchlist should never break auctions page.
    }
  }, []);

  // Watchlist is only available to authenticated users.
  // Avoid firing requests (and 401s) for logged-out visitors.
  // Runs in a microtask so the effect body never sets state
  // synchronously (React lint rule).

  useEffect(() => {
    Promise.resolve().then(() => {
      if (user) {
        fetchWatchlist();
      } else {
        setWatchMap({});
      }
    });
  }, [user, fetchWatchlist]);

  // =========================================================
  // TOGGLE WATCHLIST
  // =========================================================

  const toggleWatch = useCallback(
    async (auctionId: string) => {
      // Prevent duplicate requests
      if (watchLoading) {
        return;
      }

      const entryId = watchMap[auctionId];
      const isWatched = Boolean(entryId);

      setWatchLoading(true);

      try {
        // =====================================================
        // REMOVE FROM WATCHLIST
        // =====================================================

        if (isWatched) {
          console.log(
            "Removing auction from watchlist:",
            auctionId
          );

          const res = await fetch(
            `/api/watchlist/${entryId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          // ---------------------------------------------------
          // AUTH ERROR
          // ---------------------------------------------------

          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }

          // ---------------------------------------------------
          // SUCCESS
          // ---------------------------------------------------

          if (res.ok) {
            setWatchMap((prev) => {
              const next = { ...prev };

              delete next[auctionId];

              return next;
            });

            console.log(
              "Removed from watchlist"
            );
          } else {
            console.warn(
              `Failed to remove watchlist item: ${res.status}`
            );
          }

          return;
        }

        // =====================================================
        // ADD TO WATCHLIST
        // =====================================================

        console.log(
          "Adding auction to watchlist:",
          auctionId
        );

        const res = await fetch(
          "/api/watchlist",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              auctionId,
            }),

            credentials: "include",
          }
        );

        // ---------------------------------------------------
        // AUTH ERROR
        // ---------------------------------------------------

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        // ---------------------------------------------------
        // RESPONSE
        // ---------------------------------------------------

        const json = await res
          .json()
          .catch(() => ({}));

        console.log(
          "Add watchlist response:",
          json
        );

        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        if (
          res.ok &&
          json?.data?.id
        ) {
          setWatchMap((prev) => ({
            ...prev,
            [auctionId]: json.data.id,
          }));

          console.log(
            "Added to watchlist"
          );
        } else {
          console.warn(
            "Failed to add auction to watchlist",
            {
              status: res.status,
              response: json,
            }
          );
        }
      } catch (err) {
        console.error(
          "Watchlist request failed:",
          err
        );
      } finally {
        setWatchLoading(false);
      }
    },
    [watchMap, watchLoading]
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen dashboard-admin bg-slate-50 pt-20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        {/* Background decoration */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

        </div>

        {/* Header content */}

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">

          <div className="flex items-center gap-3">

            {/* Icon */}

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20">

              <Palette
                size={22}
                className="text-white"
              />

            </div>

            {/* Title */}

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Auction Marketplace
              </p>

              <h1 className="mt-0.5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Auctions
              </h1>

            </div>

          </div>

          <p className="mt-3 max-w-2xl text-base text-slate-500">
            Discover unique artwork and bid in real time.
          </p>

        </div>
      </section>

      {/* =====================================================
          SEARCH / SORT
      ===================================================== */}

      <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          {/* Search + Sort */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search artworks..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* Sort */}

            <div className="shrink-0">

              <SortDropdown
                options={sortOptions}
                value={sortBy}
                onSort={handleSort}
              />

            </div>

          </div>

          {/* Categories */}

          <div className="mt-3 flex flex-wrap items-center gap-2">

            {categories.map(
              (category) => (

                <button
                  key={category}
                  onClick={() =>
                    handleCategory(category)
                  }
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    selectedCategory ===
                    category
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {category}
                </button>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (

              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse"
              >

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

          /* =================================================
             ERROR
          ================================================= */

          <div className="mx-auto max-w-md py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-red-50">

              <Search
                size={24}
                className="text-red-500"
              />

            </div>

            <p className="mt-5 text-lg font-bold text-slate-900">
              Something went wrong
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={() =>
                setRetryKey((key) => key + 1)
              }
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>

          </div>

        ) : auctions.length === 0 ? (

          /* =================================================
             NO RESULTS
          ================================================= */

          <div className="mx-auto max-w-md py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-50">

              <Search
                size={24}
                className="text-indigo-600"
              />

            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No auctions found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or picking a different category.
            </p>

            <button
              onClick={() => {
                setSearchInput("");
                pushParams({
                  search: null,
                  category: null,
                  page: null,
                });
              }}
              className="mt-5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* =================================================
             AUCTION RESULTS
          ================================================= */

          <>

            {/* Result count */}

            <div className="mb-6 flex items-center gap-3">

              <p className="text-sm font-medium text-slate-500">

                {pagination.total} auction
                {pagination.total !== 1
                  ? "s"
                  : ""}{" "}
                available

              </p>

              {selectedCategory !==
                "All" && (

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {selectedCategory}
                </span>

              )}

            </div>

            {/* Auction grid */}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {auctions.map(
                (auction) => (

                  <ArtCard
                    key={auction.id}
                    auction={auction}
                    watched={
                      !!watchMap[
                        auction.id
                      ]
                    }
                    loading={
                      watchLoading
                    }
                    onToggleWatch={
                      toggleWatch
                    }
                  />

                )
              )}

            </div>

            {/* Pagination */}

            {pagination.totalPages > 1 && (

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

                <button
                  onClick={() =>
                    goToPage(page - 1)
                  }
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-sm font-medium text-slate-500">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    goToPage(page + 1)
                  }
                  disabled={
                    !pagination.hasNextPage
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>

            )}

          </>

        )}

      </section>

    </div>
  );
}

export default function AuctionsPage() {
  return (
    <Suspense fallback={null}>
      <AuctionsContent />
    </Suspense>
  );
}