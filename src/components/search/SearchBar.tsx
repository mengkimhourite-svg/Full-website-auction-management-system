"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search auctions..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex shadow-lg rounded-xl overflow-hidden bg-white border border-gray-100">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-5 py-3.5 outline-none text-sm"
      />
      <button
        type="submit"
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-6 font-semibold text-sm transition-all hover:shadow-lg"
      >
        <Search size={18} />
        Search
      </button>
    </form>
  );
}
