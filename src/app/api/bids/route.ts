import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser, isAdminRole } from "@/lib/auth";
import { syncAuctionStatuses, computeStatus } from "@/lib/auction";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const BID_SELECT = {
  id: true,
  amount: true,
  userId: true,
  auctionId: true,
  createdAt: true,
};

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
};

const SELLER_SELECT = { id: true, name: true };

const PRODUCT_SELECT = {
  id: true,
  title: true,
  image: true,
  category: true,
  seller: { select: SELLER_SELECT },
};

const AUCTION_SELECT = {
  id: true,
  status: true,
  startPrice: true,
  currentPrice: true,
  startTime: true,
  endTime: true,
  createdAt: true,
  productId: true,
  product: { select: PRODUCT_SELECT },
};

function parsePage(searchParams: URLSearchParams): number {
  const page = Number(searchParams.get("page") || String(DEFAULT_PAGE));
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : DEFAULT_PAGE;
}

function parseLimit(searchParams: URLSearchParams): number {
  const limit = Number(searchParams.get("limit") || String(DEFAULT_LIMIT));
  if (!Number.isFinite(limit) || limit < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

function buildSearchClauses(search: string): Record<string, unknown>[] {
  if (!search) return [];
  const clauses: Record<string, unknown>[] = [
    { user: { name: { contains: search, mode: "insensitive" } } },
    { user: { email: { contains: search, mode: "insensitive" } } },
    { auction: { product: { title: { contains: search, mode: "insensitive" } } } },
    { auction: { product: { category: { contains: search, mode: "insensitive" } } } },
  ];
  const numeric = Number(search);
  if (Number.isFinite(numeric)) {
    clauses.push({ amount: numeric });
  }
  return clauses;
}

function applyFilters(
  baseWhere: Record<string, unknown>,
  clauses: Record<string, unknown>[]
): Record<string, unknown> {
  const active = clauses.filter(Boolean);
  if (active.length === 0) return baseWhere;
  return { ...baseWhere, AND: active };
}

function withEffectiveStatus(bid: Record<string, unknown>): Record<string, unknown> {
  const auction = bid.auction as Record<string, unknown> | null | undefined;
  if (!auction) return bid;
  return {
    ...bid,
    auction: { ...auction, status: computeStatus(auction as Parameters<typeof computeStatus>[0]) },
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "mine";
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();

    // Role always comes from the authenticated server-side user, never from the client.
    const isAdmin = isAdminRole(user.role);
    const baseWhere: Record<string, unknown> = {};
    // Admins see every bid (scope=all) and every winner (scope=won); everyone
    // else is always limited to their own bids.
    if ((scope !== "all" && scope !== "won") || !isAdmin) {
      baseWhere.userId = user.id;
    }

    const searchClauses = buildSearchClauses(search);

    if (scope === "won") {
      // "won" = highest bid per ENDED auction that meets currentPrice.
      // Filtered database-side to ended/expired auctions only (by stored
      // status OR by endTime) so the JS aggregation never touches active bids.
      const now = new Date();
      const where = applyFilters(baseWhere, [
        {
          OR: [
            { auction: { status: "ENDED" } },
            { auction: { endTime: { lte: now } } },
          ],
        },
        ...(searchClauses.length ? [{ OR: searchClauses }] : []),
      ]);

      const bids = await prisma.bid.findMany({
        where,
        select: {
          ...BID_SELECT,
          user: { select: USER_SELECT },
          auction: {
            select: {
              ...AUCTION_SELECT,
              // Payments are resolved for every auction here (no user filter)
              // because the winner is only known after aggregation below.
              payments: {
                select: { id: true, status: true, userId: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const wonByAuction = new Map<
        string,
        { bid: Record<string, unknown>; auction: Record<string, unknown> }
      >();
      for (const bid of bids) {
        const auction = bid.auction as Record<string, unknown> | undefined;
        if (!auction || computeStatus(auction as Parameters<typeof computeStatus>[0]) !== "ENDED") {
          continue;
        }
        const current = wonByAuction.get(String(auction.id));
        if (!current || Number(bid.amount) > Number(current.bid.amount)) {
          wonByAuction.set(String(auction.id), {
            bid,
            auction,
          });
        }
      }

      const won = Array.from(wonByAuction.values())
        .filter(({ bid, auction }) => Number(bid.amount) >= Number(auction.currentPrice))
        .map(({ bid, auction }) => {
          // The winner's own payments decide the payment status, not the
          // requesting user's (admins have none).
          const winnerPayments = (Array.isArray(auction.payments) ? auction.payments : []).filter(
            (payment) => (payment as { userId?: string }).userId === bid.userId
          );
          return {
            ...bid,
            auction: {
              ...auction,
              status: computeStatus(auction as Parameters<typeof computeStatus>[0]),
              paymentStatus:
                winnerPayments.length > 0
                  ? (winnerPayments[0] as { status?: string })?.status || "PENDING"
                  : "PENDING",
              payments: winnerPayments,
            },
          };
        });

      const total = won.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return NextResponse.json(
        {
          success: true,
          data: won.slice(skip, skip + limit),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
        { status: 200 }
      );
    }

    const where = applyFilters(baseWhere, searchClauses.length ? [{ OR: searchClauses }] : []);

    // Non-admins only see their own bids (enforced above). Payments are only
    // resolved for non-admins; the admin UI does not render them, so loading
    // them for scope=all would be wasted work.
    const paymentInclude = isAdmin
      ? undefined
      : { where: { userId: user.id }, select: { id: true, status: true } };

    // Status sync runs in parallel with the queries so it never adds latency,
    // and it only writes auctions that actually transitioned.
    // Stats are computed against the whole scope (not the search filter),
    // matching the previous client-side behaviour of the admin bids page.
    const statsWhere = applyFilters(baseWhere, []);
    const [bids, total, active, ended, totalValue] = await Promise.all([
      prisma.bid.findMany({
        where,
        select: {
          ...BID_SELECT,
          user: { select: USER_SELECT },
          auction: {
            select: {
              ...AUCTION_SELECT,
              payments: paymentInclude,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bid.count({ where }),
      prisma.bid.count({ where: { ...statsWhere, auction: { status: "ACTIVE" } } }),
      prisma.bid.count({ where: { ...statsWhere, auction: { status: "ENDED" } } }),
      prisma.bid.aggregate({ _sum: { amount: true }, where: statsWhere }),
      syncAuctionStatuses(),
    ]);

    const data = bids.map(withEffectiveStatus);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        success: true,
        data,
        stats: {
          total,
          active,
          ended,
          totalValue: Number(totalValue._sum?.amount || 0),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/bids:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}