"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface FormState {
  productTitle: string;
  productDescription: string;
  productImage: string;
  category: string;
  startPrice: string;
  endTime: string;
}

const emptyForm: FormState = {
  productTitle: "",
  productDescription: "",
  productImage: "",
  category: "",
  startPrice: "",
  endTime: "",
};

export default function CreateAuctionPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.productTitle.trim()) next.productTitle = "Title is required";
    if (!form.productDescription.trim()) next.productDescription = "Description is required";
    const price = Number(form.startPrice);
    if (!form.startPrice || !Number.isFinite(price) || price <= 0) next.startPrice = "Enter a valid price greater than 0";
    if (!form.endTime) {
      next.endTime = "End time is required";
    } else if (new Date(form.endTime) <= new Date()) {
      next.endTime = "End time must be in the future";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: form.productTitle.trim(),
          productDescription: form.productDescription.trim(),
          productImage: form.productImage.trim() || null,
          category: form.category.trim() || "General",
          startPrice: Number(form.startPrice),
          endTime: new Date(form.endTime).toISOString(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create auction");
        return;
      }

      setSuccess(true);
      setForm(emptyForm);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30"
        : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link
        href="/seller/auctions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Auctions
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <Plus size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Create New Auction</h1>
            <p className="text-xs text-purple-100">Fill in the details to list your item</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl px-4 py-3">
              <CheckCircle size={16} />
              Auction created successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Title</label>
            <input
              type="text"
              name="productTitle"
              value={form.productTitle}
              onChange={handleChange}
              placeholder="e.g. Luxury Watch"
              className={inputClass(!!errors.productTitle)}
            />
            {errors.productTitle && <p className="text-xs text-red-500 mt-1">{errors.productTitle}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your item..."
              className={`${inputClass(!!errors.productDescription)} resize-none`}
            />
            {errors.productDescription && <p className="text-xs text-red-500 mt-1">{errors.productDescription}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL (optional)</label>
            <input
              type="url"
              name="productImage"
              value={form.productImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass(false)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Price ($)</label>
              <input
                type="number"
                name="startPrice"
                value={form.startPrice}
                onChange={handleChange}
                placeholder="0.00"
                min={1}
                step="0.01"
                className={inputClass(!!errors.startPrice)}
              />
              {errors.startPrice && <p className="text-xs text-red-500 mt-1">{errors.startPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className={inputClass(!!errors.endTime)}
            />
            {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? "Creating..." : "Create Auction"}
          </button>
        </form>
      </div>
    </div>
  );
}
