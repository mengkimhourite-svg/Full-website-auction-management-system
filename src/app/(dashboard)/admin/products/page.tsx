"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  ImageOff,
  Link2,
  Tags,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Auction, Product } from "@/types";

interface ExtractedProduct {
  id: string;
  productId: string;
  title: string;
  description: string;
  image: string;
  category: string;
  seller: string;
  sellerEmail: string;
  hasAuction: boolean;
  auctionId: string;
  startPrice: number;
  currentPrice: number;
}

type AuctionWithProduct = Auction & { product: Product; category?: string };

type ViewMode = "grid" | "table";

const extractProducts = (auctions: Auction[]): ExtractedProduct[] =>
  auctions
    .filter((a): a is AuctionWithProduct => !!a.product)
    .map((a) => ({
      id: a.id,
      productId: a.product.id,
      title: a.product.title || "Untitled",
      description: a.product.description || "",
      image: a.product.image || "",
      category: a.product.category || a.category || "Uncategorized",
      seller: a.product.seller?.name || a.product.seller?.email || "Unknown",
      sellerEmail: a.product.seller?.email || "",
      hasAuction: true,
      auctionId: a.id,
      startPrice: a.startPrice || 0,
      currentPrice: a.currentPrice || 0,
    }));

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auctions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const auctions: Auction[] = json.data || [];
      setProducts(extractProducts(auctions));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
    );
  }, [products, search]);

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const totalProducts = products.length;
  const withAuction = products.filter((p) => p.hasAuction).length;
  const topCategory = categories[0]?.[0] || "—";

  const stats = [
    { title: "Total", value: totalProducts, icon: <Package size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "With Auction", value: withAuction, icon: <Link2 size={22} />, color: "from-emerald-500 to-teal-500" },
    { title: "Categories", value: categories.length, icon: <Tags size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Top Category", value: topCategory, icon: <Tags size={22} />, color: "from-amber-500 to-orange-500" },
  ];

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (p: ExtractedProduct) =>
        p.image ? (
          <Image src={p.image} alt={p.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageOff size={16} />
          </div>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (p: ExtractedProduct) => <span className="text-sm font-semibold text-gray-900">{p.title}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (p: ExtractedProduct) => <StatusBadge variant="info">{p.category}</StatusBadge>,
    },
    {
      key: "seller",
      label: "Seller",
      render: (p: ExtractedProduct) => <span className="text-sm text-gray-500">{p.seller}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (p: ExtractedProduct) => (
        <span className="text-sm font-bold text-gray-900">
          ${((p.currentPrice || p.startPrice) || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "hasAuction",
      label: "Linked",
      render: (p: ExtractedProduct) => (
        <StatusBadge variant={p.hasAuction ? "active" : "ended"}>{p.hasAuction ? "Yes" : "No"}</StatusBadge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p: ExtractedProduct) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/admin/products/edit/${p.id}`)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
          >
            <Edit3 size={14} />
            Edit
          </button>
          <button
            onClick={() => setDeleteTarget(p.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Package size={22} />}
        title="Products"
        description="Manage all products"
        actions={
          <button
            onClick={() => router.push("/admin/products/create")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} />
            Create Product
          </button>
        }
      />

      {loading && <LoadingSpinner text="Loading products..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Search products by title, category, seller..." />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-lg transition-all ${view === "table" ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No products found"
              description={search ? "No products match your search" : "Create your first product to get started"}
              action={!search ? { label: "Create Product", onClick: () => router.push("/admin/products/create") } : undefined}
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div key={product.productId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {product.image ? (
                    <Image src={product.image} alt={product.title} width={400} height={200} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-300">
                      <ImageOff size={32} />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{product.title}</h3>
                      <StatusBadge variant="info">{product.category}</StatusBadge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{product.seller}</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${((product.currentPrice || product.startPrice) || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product.id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message="Are you sure you want to delete this product and its auction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
