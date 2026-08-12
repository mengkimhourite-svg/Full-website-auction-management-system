"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import SellerImageUpload from "@/components/seller/SellerImageUpload";
import type { Auction } from "@/types";

interface FormState {
  productTitle: string;
  productDescription: string;
  productImage: string;
  category: string;
  startPrice: string;
  endTime: string;
}

function formatDateForInput(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function EditAuctionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [form, setForm] = useState<FormState>({
    productTitle: "",
    productDescription: "",
    productImage: "",
    category: "",
    startPrice: "",
    endTime: "",
  });
  const [originalEndTime, setOriginalEndTime] = useState("");
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/auctions/${id}`);

        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
          if (res.status === 404) {
            setNotFound(true);
          } else {
            setError(json.error || "Failed to load auction");
          }
          return;
        }

        const auction: Auction = json.data;
        const endInput = formatDateForInput(auction.endTime);

        if (!cancelled) {
          setForm({
            productTitle: auction.title ?? "",
            productDescription: auction.description ?? "",
            productImage: auction.image ?? "",
            category: auction.category ?? "",
            startPrice: auction.startPrice != null ? String(auction.startPrice) : "",
            endTime: endInput,
          });
          setOriginalEndTime(endInput);
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

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

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const endTimeUnchanged = form.endTime === originalEndTime;

      const body: Record<string, unknown> = {
        productTitle: form.productTitle.trim(),
        productDescription: form.productDescription.trim(),
        productImage: form.productImage.trim() || null,
        category: form.category.trim() || "General",
        startPrice: Number(form.startPrice),
      };
      if (!endTimeUnchanged) body.endTime = new Date(form.endTime).toISOString();

      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to update auction");
        return;
      }

      setSuccess(true);
      setOriginalEndTime(formatDateForInput(json.data?.endTime));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30"
        : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="text-purple-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-semibold text-gray-700">Auction not found</p>
        <Link
          href="/seller/auctions"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all"
        >
          <ArrowLeft size={16} />
          Back to My Auctions
        </Link>
      </div>
    );
  }

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
            <Save size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Edit Auction</h1>
            <p className="text-xs text-purple-100">Update the details of your listing</p>
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
              Auction updated successfully!
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Image (optional)</label>
            <SellerImageUpload
              value={form.productImage}
              onChange={(dataUrl) => setForm((prev) => ({ ...prev, productImage: dataUrl }))}
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
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
