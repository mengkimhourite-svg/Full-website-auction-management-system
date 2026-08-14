import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser, isAdminRole } from "@/lib/auth";
import { syncAuctionStatuses, serializeAuction } from "@/lib/auction";
import { getMonthlyReport } from "@/lib/reports";
import { cached } from "@/lib/cache";

const DASHBOARD_LIMIT = 100;

// Report/status statistics are monthly analytics and stored-status counts —
// not real-time bidding data. They are cached briefly and invalidated on
// every write, so the dashboard only pays for them once per window.
const REPORT_TTL_MS = 60_000;
const STATUS_COUNTS_TTL_MS = 30_000;

// Only the fields the dashboard table renders (image, seller role/name,
// title, prices, status, end time) plus what serializeAuction needs.
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
 * GET /api/admin/dashboard
 *
 * Consolidated payload for the Admin Dashboard home page so the initial
 * load is a single request instead of six separate API invocations
 * (each of which would independently load the database on a cold
 * serverless instance).
 */
export async function GET() {
  try {
    const actor = await getAuthUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(actor.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const [report, statusGroups, totalAuctions, totalProducts, totalUsers, pendingPayments, unreadNotifications, auctions] =
      await Promise.all([
        cached("report", REPORT_TTL_MS, () => getMonthlyReport()),

        cached("auction-status-counts", STATUS_COUNTS_TTL_MS, () =>
          prisma.auction.groupBy({
            by: ["status"],
            _count: { id: true },
          })
        ),

        prisma.auction.count(),

        prisma.product.count(),

        prisma.user.count(),

        prisma.payment.count({
          where: { status: "PENDING" },
        }),

        prisma.notification.count({
          where: { userId: actor.id, read: { not: true } },
        }),

        (async () => {
          await syncAuctionStatuses();

          const rows = await prisma.auction.findMany({
            orderBy: { createdAt: "asc" },
            take: DASHBOARD_LIMIT,
            select: AUCTION_SELECT,
          });

          return rows.map(serializeAuction);
        })(),
      ]);

    const counts = {
      auctions: totalAuctions,
      active: 0,
      upcoming: 0,
      ended: 0,
      products: totalProducts,
      users: totalUsers,
      pendingPayments,
      unreadNotifications,
    };

    for (const group of statusGroups) {
      const status = String(group.status);
      const n = Number(group._count?.id || 0);
      if (status === "ACTIVE") counts.active = n;
      else if (status === "UPCOMING") counts.upcoming = n;
      else if (status === "ENDED") counts.ended = n;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          report,
          counts,
          auctions,
          pagination: {
            page: 1,
            limit: DASHBOARD_LIMIT,
            total: totalAuctions,
            totalPages: Math.ceil(totalAuctions / DASHBOARD_LIMIT),
            hasNextPage: DASHBOARD_LIMIT < totalAuctions,
            hasPreviousPage: false,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/dashboard:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}