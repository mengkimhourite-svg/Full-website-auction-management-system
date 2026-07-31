"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

interface AuctionFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function AuctionForm({ initialData, onSubmit, loading }: AuctionFormProps) {
  const [title, setTitle] = useState(initialData?.product?.title || "");
  const [description, setDescription] = useState(initialData?.product?.description || "");
  const [image, setImage] = useState(initialData?.product?.image || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [startPrice, setStartPrice] = useState(initialData?.startPrice || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      product: { title, description, image },
      category,
      startPrice: Number(startPrice),
      endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-900">
        {initialData ? "Edit Auction" : "Create New Auction"}
      </h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Electronics"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Start Price ($)</label>
          <input
            type="number"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required
            min={1}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {loading ? "Saving..." : initialData ? "Update Auction" : "Create Auction"}
      </button>
    </form>
  );
}
