"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Watches", "Jewelry", "Art", "Cars", "Wine", "Antiques"];

export default function AdminProductsCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.title || !form.category) {
        throw new Error("Title and category are required");
      }

      const payload = {
        productTitle: form.title,
        productDescription: form.description,
        productImage: form.image,
        category: form.category,
        startPrice: 0,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create product");
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Product</h1>
          <p className="text-sm text-gray-500">Add a new product to the system</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>
            Product Title <span className="text-red-500">*</span>
          </label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Enter product title" className={inputClass} required />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the product..." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Image URL</label>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>
            Category <span className="text-red-500">*</span>
          </label>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass} required>
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package size={16} />
                Create Product
              </>
            )}
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
