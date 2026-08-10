import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Gavel, ImageOff } from "lucide-react";
import AuctionActions from "@/components/auction/AuctionActions";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { serializeAuction } from "@/lib/auction";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
  }
  if (status === "UPCOMING") {
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Upcoming</span>;
  }
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">Ended</span>;
}

export default async function SellerAuctionsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.role !== "SELLER" && user.role !== "ADMIN") redirect("/bidder/reports");

  const auctions = await prisma.auction.findMany({
    where: { product: { sellerId: user.id } },
    include: {
      product: {
        include: {
          seller: {
            select: { id: true, name: true, email: true, role: true, avatar: true },
          },
        },
      },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = auctions.map(serializeAuction);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">My Auctions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your listed auctions</p>
        </div>
        <Link
          href="/seller/auctions/create"
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} />
          Create New Auction
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <Gavel size={36} className="mb-2 opacity-40" />
          <p className="text-sm font-medium text-gray-500">No auctions yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Create your first auction to get started.</p>
          <Link
            href="/seller/auctions/create"
            className="mt-4 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            Create Auction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Image</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Bids</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">End Time</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((auction) => (
                  <tr key={auction.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {auction.image ? (
                        <Image
                          src={auction.image}
                          alt={auction.title}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageOff size={14} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{auction.title}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${auction.currentPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{auction.bidCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{auction.endDate || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/seller/auctions/edit/${auction.id}`}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <AuctionActions auctionId={auction.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
