"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import ProductImageUpload from "@/components/admin/ProductImageUpload";

const CATEGORIES = ["Watches", "Jewelry", "Art", "Cars", "Wine", "Antiques"];

export default function AdminProductsEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    startPrice: "",
  });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/auctions/${id}`, { credentials: "include" });

        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          else throw new Error("Failed to fetch auction");
          return;
        }

        const data = await res.json();
        const auction = data.data || data;
        if (!cancelled) {
          setForm({
            title: auction.product?.title || auction.title || "",
            description: auction.product?.description || auction.description || "",
            image: auction.product?.image || auction.image || "",
            category: auction.product?.category || auction.category || "",
            startPrice: auction.startPrice != null ? String(auction.startPrice) : "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch auction");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      if (!form.title || !form.category) {
        throw new Error("Title and category are required");
      }

      const payload: Record<string, unknown> = {
        productTitle: form.title,
        productDescription: form.description,
        productImage: form.image || null,
        category: form.category,
      };
      if (form.startPrice !== "") {
        const startPrice = Number(form.startPrice);
        if (!Number.isFinite(startPrice) || startPrice <= 0) {
          throw new Error("Starting price must be a positive number");
        }
        payload.startPrice = startPrice;
      }

      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update product");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => router.push("/admin/products"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="loading-spinner" />
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-lg font-semibold text-gray-700">Product not found</p>
        <Link href="/admin/products" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        <Link href="/admin/products" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {success && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            <CheckCircle size={16} />
            Product updated successfully!
          </div>
        )}

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
          <label className={labelClass}>Starting Price ($)</label>
          <input name="startPrice" value={form.startPrice} onChange={handleChange} type="number" min="0" step="0.01" placeholder="e.g. 500" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Product Image</label>
          <ProductImageUpload
            value={form.image}
            onChange={(dataUrl) => setForm((prev) => ({ ...prev, image: dataUrl }))}
          />
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
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
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
