import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser, isAdminRole } from "@/lib/auth";
import { syncAuctionStatuses, serializeAuction } from "@/lib/auction";
import { auctionSchema } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { cached, invalidateCaches } from "@/lib/cache";

const ROLE_SORT_ORDER = [
  "SUPER_ADMIN",
  "ADMIN",
  "SELLER",
  "BIDDER",
];

const STATUS_SORT_ORDER = [
  "ACTIVE",
  "ENDED",
  "UPCOMING",
];

// Sorts with a custom (non-alphabetical) ordering or that depend on
// resolved relations cannot be expressed with a plain database orderBy
// (the store sorts raw rows before relations are attached). For these we
// fetch the full matching set, sort in JS, then slice the requested page.
const CUSTOM_SORTS = new Set(["role", "status", "name"]);

// Category list and status counts change only when auctions/products are
// created, updated or deleted (writes invalidate the cache), never per
// read request. Caching them removes two full-collection scans from every
// list request — including the admin auctions/products pages.
const CATEGORIES_TTL_MS = 60_000;
const STATUS_COUNTS_TTL_MS = 30_000;

// Only the fields the cards/tables render plus what serializeAuction needs.
// Avoids pulling full product/seller rows (descriptions, timestamps, ...)
// into memory and into the JSON payload.
const AUCTION_SELECT = {
  id: true,
  startPrice: true,
  currentPrice: true,
  startTime: true,
  endTime: true,
  status: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { bids: true } },
  product: {
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      category: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          name: true,
          role: true,
          avatar: true,
        },
      },
    },
  },
};

/**
 * GET /api/auctions
 *
 * Examples:
 *
 * /api/auctions
 * /api/auctions?status=ACTIVE
 * /api/auctions?category=Art
 * /api/auctions?search=gold
 * /api/auctions?sort=currentPrice&order=desc
 * /api/auctions?page=2&limit=24
 */
export async function GET(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // Query parameters
    // ---------------------------------------------------------

    const { searchParams } = new URL(request.url);

    const sellerId = searchParams.get("sellerId");
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const sort = searchParams.get("sort");
    const order =
      searchParams.get("order") === "desc"
        ? "desc"
        : "asc";

    // ---------------------------------------------------------
    // Pagination
    // ---------------------------------------------------------

    const pageParam = Number(
      searchParams.get("page") || "1"
    );

    const limitParam = Number(
      searchParams.get("limit") || "30"
    );

    const page = Math.max(
      1,
      Number.isFinite(pageParam)
        ? pageParam
        : 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.isFinite(limitParam)
          ? limitParam
          : 30
      )
    );

    const skip = (page - 1) * limit;

    // ---------------------------------------------------------
    // WHERE
    // ---------------------------------------------------------

    const where: Record<string, unknown> = {};

    if (sellerId) {
      where.product = {
        ...(where.product || {}),
        sellerId,
      };
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.product = {
        ...(where.product || {}),
        seller: {
          role,
        },
      };
    }

    if (category) {
      where.product = {
        ...(where.product || {}),
        category,
      };
    }

    if (search) {
      where.product = {
        ...(where.product || {}),
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // ---------------------------------------------------------
    // SORT (database level, before skip/take)
    // ---------------------------------------------------------

    const isCustomSort = CUSTOM_SORTS.has(
      sort || ""
    );

    const dbOrderBy: Record<string, unknown> =
      sort === "currentPrice"
        ? { currentPrice: order }
        : sort === "endTime"
          ? { endTime: order }
          : sort === "newest"
            ? { createdAt: order === "desc" ? "asc" : "desc" }
            : { createdAt: order };

    // ---------------------------------------------------------
    // DATABASE QUERY
    // ---------------------------------------------------------
    //
    // IMPORTANT:
    // Do NOT return unnecessary seller fields such as email.
    // This helps keep the API payload small.
    //
    // Sorting happens in the database BEFORE pagination so that
    // skip/take return the correct page. Role/status/name use a
    // custom ordering and are sorted in JS over the full set.
    //
    // Auction status sync runs in parallel with the queries so
    // it never adds latency, and it only touches auctions that
    // are expiring or starting.
    // ---------------------------------------------------------

    const [auctions, total, categoryGroups, statusGroups] =
      await Promise.all([
        isCustomSort
          ? prisma.auction.findMany({
              where,
              select: AUCTION_SELECT,
              orderBy: dbOrderBy,
            })
          : prisma.auction.findMany({
              where,
              select: AUCTION_SELECT,
              orderBy: dbOrderBy,
              skip,
              take: limit,
            }),

        prisma.auction.count({
          where,
        }),

        cached("product-categories", CATEGORIES_TTL_MS, () =>
          prisma.product.groupBy({
            by: ["category"],
            _count: { category: true },
          })
        ),

        cached("auction-status-counts", STATUS_COUNTS_TTL_MS, () =>
          prisma.auction.groupBy({
            by: ["status"],
            _count: { id: true },
          })
        ),

        syncAuctionStatuses(),
      ]);

    const categories = categoryGroups
      .map((group) => ({
        category: String(group.category || "General"),
        count: Number(group._count?.category || 0),
      }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.category.localeCompare(b.category)
      )
      .map((group) => group.category);

    // ---------------------------------------------------------
    // STATUS COUNTS
    // ---------------------------------------------------------

    const counts = {
      total,
      active: 0,
      upcoming: 0,
      ended: 0,
    };

    for (const group of statusGroups) {
      const status = String(group.status);
      const n = Number(group._count?.id || 0);
      if (status === "ACTIVE") counts.active = n;
      else if (status === "UPCOMING") counts.upcoming = n;
      else if (status === "ENDED") counts.ended = n;
    }

    // ---------------------------------------------------------
    // CUSTOM SORT (role / status) + PAGE SLICE
    // ---------------------------------------------------------

    let sorted = auctions;

    if (isCustomSort) {
      sorted = [...auctions]
        .sort((a, b) => {
          const direction =
            order === "desc" ? -1 : 1;

          let result = 0;

          switch (sort) {
            // -----------------------------------------------
            // ROLE
            // -----------------------------------------------

            case "role": {
              const ra =
                ROLE_SORT_ORDER.indexOf(
                  a.product?.seller?.role || ""
                );

              const rb =
                ROLE_SORT_ORDER.indexOf(
                  b.product?.seller?.role || ""
                );

              result =
                (ra === -1 ? 999 : ra) -
                (rb === -1 ? 999 : rb);

              break;
            }

            // -----------------------------------------------
            // NAME (resolved relation field)
            // -----------------------------------------------

            case "name": {
              result = (
                a.product?.title || ""
              ).localeCompare(
                b.product?.title || "",
                undefined,
                {
                  sensitivity: "base",
                }
              );

              break;
            }

            // -----------------------------------------------
            // STATUS
            // -----------------------------------------------

            case "status": {
              const sa =
                STATUS_SORT_ORDER.indexOf(
                  a.status
                );

              const sb =
                STATUS_SORT_ORDER.indexOf(
                  b.status
                );

              result =
                (sa === -1 ? 999 : sa) -
                (sb === -1 ? 999 : sb);

              break;
            }
          }

          return result * direction;
        })
        .slice(skip, skip + limit);
    }

    // ---------------------------------------------------------
    // SERIALIZE
    // ---------------------------------------------------------

    const data = sorted.map(
      serializeAuction
    );

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        data,

        categories,

        counts,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
          hasNextPage:
            page * limit < total,
          hasPreviousPage:
            page > 1,
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error in GET /api/auctions:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/auctions
 */
export async function POST(
  request: NextRequest
) {
  try {
    // ---------------------------------------------------------
    // RATE LIMIT
    // ---------------------------------------------------------

    const rl = rateLimit(
      "create-auction",
      {
        windowMs: 60_000,
        maxRequests: 10,
      }
    );

    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers:
            getRateLimitHeaders(rl),
        }
      );
    }

    // ---------------------------------------------------------
    // AUTH
    // ---------------------------------------------------------

    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------------------
    // ROLE
    // ---------------------------------------------------------

    if (
      !isAdminRole(user.role) &&
      user.role !== "SELLER"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    // ---------------------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------------------

    const body = await request.json();

    const parsed =
      auctionSchema.safeParse({
        productTitle:
          body.productTitle ??
          body.title ??
          "",

        productDescription:
          body.productDescription ??
          body.description ??
          "",

        productImage:
          body.productImage ??
          body.image ??
          undefined,

        category:
          body.category ??
          "General",

        startPrice: Number(
          body.startPrice ??
            body.startingPrice ??
            0
        ),

        startTime:
          body.startTime ||
          new Date().toISOString(),

        endTime:
          body.endTime,
      });

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.errors[0]
              ?.message ||
            "Invalid auction data",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------------
    // DATA
    // ---------------------------------------------------------

    const {
      productTitle,
      productDescription,
      productImage,
      category,
      startPrice,
      endTime,
      startTime,
    } = parsed.data;

    const start =
      new Date(startTime!);

    const end =
      new Date(endTime);

    // ---------------------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------------------

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid startTime or endTime",
        },
        {
          status: 400,
        }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          error:
            "endTime must be after startTime",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------------
    // CREATE PRODUCT
    // ---------------------------------------------------------

    const product =
      await prisma.product.create({
        data: {
          title: productTitle,

          description:
            productDescription || "",

          image:
            productImage || null,

          category:
            category || "General",

          sellerId: user.id,
        },
      });

    // ---------------------------------------------------------
    // CREATE AUCTION
    // ---------------------------------------------------------

    const now = new Date();

    const auction =
      await prisma.auction.create({
        data: {
          productId: product.id,

          startPrice,

          currentPrice:
            startPrice,

          startTime: start,

          endTime: end,

          status:
            now >= start
              ? "ACTIVE"
              : "UPCOMING",
        },

        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatar: true,
                },
              },
            },
          },

          _count: {
            select: {
              bids: true,
            },
          },
        },
      });

    // A new auction/product changed every cached aggregate.
    invalidateCaches();

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        data: serializeAuction(
          auction
        ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error in POST /api/auctions:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}