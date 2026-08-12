"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import SellerImageUpload from "@/components/seller/SellerImageUpload";

export interface AuctionFormData {
  product: {
    title: string;
    description: string;
    image: string;
  };
  category: string;
  startPrice: number;
  endTime: string;
  title?: string;
  description?: string;
  image?: string;
}

interface AuctionFormProps {
  initialData?: {
    product?: {
      title?: string;
      description?: string;
      image?: string | null;
    };
    category?: string;
    startPrice?: number;
    endTime?: string;
  } | null;

  onSubmit: (data: AuctionFormData) => void;
  loading?: boolean;
}

export default function AuctionForm({
  initialData,
  onSubmit,
  loading,
}: AuctionFormProps) {
  const [title, setTitle] = useState(
    initialData?.product?.title || ""
  );

  const [description, setDescription] = useState(
    initialData?.product?.description || ""
  );

  const [image, setImage] = useState(
    initialData?.product?.image || ""
  );

  const [category, setCategory] = useState(
    initialData?.category || ""
  );

  const [startPrice, setStartPrice] = useState<
    string | number
  >(initialData?.startPrice || "");

  const [endTime, setEndTime] = useState(
    initialData?.endTime || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      product: {
        title,
        description,
        image,
      },
      category,
      startPrice: Number(startPrice),
      endTime,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

        <h3 className="text-lg font-extrabold tracking-tight text-black">
          {initialData
            ? "Edit Auction"
            : "Create New Auction"}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {initialData
            ? "Update your auction information below."
            : "Add your product details and create a new auction."}
        </p>

      </div>

      {/* =========================================================
          FORM CONTENT
      ========================================================= */}

      <div className="space-y-5 p-6">

        {/* =======================================================
            PRODUCT TITLE
        ======================================================= */}

        <div>

          <label
            htmlFor="product-title"
            className="mb-1.5 block text-sm font-bold text-black"
          >
            Product Title
          </label>

          <input
            id="product-title"
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
            placeholder="Enter product title"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* =======================================================
            DESCRIPTION
        ======================================================= */}

        <div>

          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-bold text-black"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={4}
            required
            placeholder="Describe your product..."
            className="w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-6 text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1.5 text-[11px] text-slate-400">
            Provide useful information about the item,
            condition, and features.
          </p>

        </div>

        {/* =======================================================
            PRODUCT IMAGE
        ======================================================= */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-black">
            Product Image
          </label>

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <SellerImageUpload
              value={image}
              onChange={setImage}
            />
          </div>

        </div>

        {/* =======================================================
            CATEGORY + START PRICE
        ======================================================= */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Category */}

          <div>

            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-bold text-black"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="e.g. Electronics"
              className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Start Price */}

          <div>

            <label
              htmlFor="start-price"
              className="mb-1.5 block text-sm font-bold text-black"
            >
              Start Price ($)
            </label>

            <div className="relative">

              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                $
              </span>

              <input
                id="start-price"
                type="number"
                value={startPrice}
                onChange={(e) =>
                  setStartPrice(e.target.value)
                }
                required
                min={1}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-8 pr-3.5 text-sm font-semibold text-black outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

        </div>

        {/* =======================================================
            END TIME
        ======================================================= */}

        <div>

          <label
            htmlFor="end-time"
            className="mb-1.5 block text-sm font-bold text-black"
          >
            End Time
          </label>

          <input
            id="end-time"
            type="datetime-local"
            value={endTime}
            onChange={(e) =>
              setEndTime(e.target.value)
            }
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-black outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1.5 text-[11px] text-slate-400">
            Choose when the auction should automatically end.
          </p>

        </div>

        {/* =======================================================
            SUBMIT BUTTON
        ======================================================= */}

        <div className="border-t border-slate-200 pt-5">

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {loading
              ? "Saving..."
              : initialData
              ? "Update Auction"
              : "Create Auction"}

          </button>

        </div>

      </div>
    </form>
  );
}