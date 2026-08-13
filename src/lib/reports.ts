import prisma from "@/lib/db";

/**
 * Monthly business report used by /api/reports/monthly and the admin
 * dashboard. All queries are independent and run in parallel so the
 * endpoint latency is bounded by the slowest query, not the sum.
 */
export async function getMonthlyReport() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    usersByRole,
    auctionsByStatus,
    monthPayments,
    bidCount,
    totalUsers,
    totalAuctions,
    totalRevenueAgg,
    monthlyPayments,
    monthlyUsers,
    monthlyAuctions,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
      where: {
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    }),

    prisma.auction.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    }),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    }),

    prisma.bid.count({
      where: {
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    }),

    prisma.user.count(),

    prisma.auction.count(),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),

    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    }),

    prisma.user.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),

    prisma.auction.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.amount || 0;

  const series: { month: string; auctions: number; revenue: number; users: number }[] = [];
  const seriesIndex = new Map<string, number>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    seriesIndex.set(key, series.length);
    series.push({ month: key, auctions: 0, revenue: 0, users: 0 });
  }

  for (const p of monthlyPayments) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = series[seriesIndex.get(key)!];
    if (entry) entry.revenue += p.amount;
  }
  for (const u of monthlyUsers) {
    const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = series[seriesIndex.get(key)!];
    if (entry) entry.users += 1;
  }
  for (const a of monthlyAuctions) {
    const key = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = series[seriesIndex.get(key)!];
    if (entry) entry.auctions += 1;
  }

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    totalUsers,
    totalAuctions,
    totalRevenue,
    usersByRole: usersByRole.map((r: { role: string; _count: { id: number } }) => ({
      role: r.role,
      count: r._count.id,
    })),
    auctionsByStatus: auctionsByStatus.map((s: { status: string; _count: { id: number } }) => ({
      status: s.status,
      count: s._count.id,
    })),
    monthlyAuctions: series.map((s) => ({ month: s.month, count: s.auctions })),
    auctionsByMonth: series.map((s) => ({ month: s.month, count: s.auctions })),
    monthlyRevenue: series.map((s) => ({ month: s.month, amount: s.revenue })),
    revenueByMonth: series.map((s) => ({ month: s.month, amount: s.revenue })),
    totalPayments: monthPayments._sum.amount || 0,
    totalBids: bidCount,
  };
}