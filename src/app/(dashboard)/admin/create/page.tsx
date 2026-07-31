"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Watches", "Jewelry", "Art", "Cars", "Wine", "Antiques"];

export default function AdminCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    productTitle: "",
    productDescription: "",
    productImage: "",
    category: "",
    startPrice: "",
    endTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        productTitle: form.productTitle,
        productDescription: form.productDescription,
        productImage: form.productImage,
        category: form.category,
        startPrice: parseFloat(form.startPrice),
        endTime: new Date(form.endTime).toISOString(),
      };

      if (!payload.productTitle || !payload.startPrice || !payload.category || !payload.endTime) {
        throw new Error("Please fill in all required fields");
      }

      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create auction");
      }

      router.push("/admin/auctions");
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
        <Link href="/admin/auctions" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Auction</h1>
          <p className="text-sm text-gray-500">List a new item for auction</p>
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
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><Package size={16} /></div>
            <input name="productTitle" value={form.productTitle} onChange={handleChange} placeholder="Enter product title" className={`${inputClass} pl-10`} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="productDescription" value={form.productDescription} onChange={handleChange} rows={3} placeholder="Describe the product..." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Image URL</label>
          <input name="productImage" value={form.productImage} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className={labelClass}>
              Start Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><DollarSign size={16} /></div>
              <input name="startPrice" type="number" min="0" step="0.01" value={form.startPrice} onChange={handleChange} placeholder="0.00" className={`${inputClass} pl-10`} required />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            End Date / Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><Calendar size={16} /></div>
            <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} className={`${inputClass} pl-10`} required />
          </div>
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
                <Clock size={16} />
                Create Auction
              </>
            )}
          </button>
          <Link href="/admin/auctions" className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
