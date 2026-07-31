"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

interface FilterPanelProps {
  categories: string[];
  onFilter: (filters: any) => void;
}

export default function FilterPanel({ categories, onFilter }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("");

  const applyFilters = () => {
    onFilter({
      categories: selectedCategories,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status: status || undefined,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setStatus("");
    onFilter({});
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        </div>
        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 transition-colors">
          Clear all
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-indigo-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Status</h4>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="ENDED">Ended</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <button
        onClick={applyFilters}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
      >
        <Filter size={14} />
        Apply Filters
      </button>
    </div>
  );
}
