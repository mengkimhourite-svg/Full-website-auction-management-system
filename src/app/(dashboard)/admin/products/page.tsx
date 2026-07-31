"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, Edit3, Trash2, ImageOff } from "lucide-react";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auctions");
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const auctions = json.data || [];
      const extracted = auctions
        .filter((a: any) => a.product)
        .map((a: any) => ({
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
        }));
      setProducts(extracted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auctions");
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();
        const auctions = json.data || [];
        const extracted = auctions
          .filter((a: any) => a.product)
          .map((a: any) => ({
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
          }));
        setProducts(extracted);
        setError("");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product and its auction?")) return;
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">All products listed in auctions</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/admin/products/create")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md"
        >
          <Plus size={16} />
          Create Product
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="loading-spinner" />
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Package size={28} />
          </div>
          <p className="text-gray-500 font-medium">No products yet</p>
          <p className="text-sm text-gray-400">Create a product to link with an auction</p>
          <button
            onClick={() => router.push("/admin/products/create")}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all"
          >
            <Plus size={16} />
            Create Product
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Linked Auction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId || product.id}>
                  <td>
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageOff size={16} />
                      </div>
                    )}
                  </td>
                  <td className="font-medium text-gray-900">{product.title}</td>
                  <td>
                    <span className="badge badge-info">{product.category}</span>
                  </td>
                  <td className="text-gray-500 text-sm">{product.seller}</td>
                  <td>
                    <span className={`badge ${product.hasAuction ? "badge-success" : "badge-neutral"}`}>
                      {product.hasAuction ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
