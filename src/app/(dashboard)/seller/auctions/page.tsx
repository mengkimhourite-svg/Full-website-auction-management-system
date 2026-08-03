import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Gavel, ImageOff } from "lucide-react";
import AuctionActions from "@/components/AuctionActions";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeAuction } from "@/lib/auction";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>;
  }
  if (status === "UPCOMING") {
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Upcoming</span>;
  }
  return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Ended</span>;
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
            <Gavel size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">My Auctions</h1>
            <p className="text-sm text-gray-500">Manage your listed auctions</p>
          </div>
        </div>
        <Link
          href="/seller/auctions/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all"
        >
          <Plus size={16} />
          Create New Auction
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Gavel size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500">No auctions yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first auction to get started.</p>
          <Link
            href="/seller/auctions/create"
            className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all"
          >
            <Plus size={16} />
            Create Auction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Image</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Bids</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">End Time</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((auction) => (
                  <tr key={auction.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      {auction.image ? (
                        <Image
                          src={auction.image}
                          alt={auction.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{auction.title}</td>
                    <td className="px-5 py-3.5 font-semibold text-purple-600">${auction.currentPrice.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-gray-500">{auction.bidCount}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{auction.endDate || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/seller/auctions/edit/${auction.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
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
