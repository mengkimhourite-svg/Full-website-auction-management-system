"use client";

import { ArrowUpDown } from "lucide-react";

interface SortDropdownProps {
  options: { label: string; value: string }[];
  onSort: (value: string) => void;
}

export default function SortDropdown({ options, onSort }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={16} className="text-gray-400" />
      <select
        onChange={(e) => onSort(e.target.value)}
        className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
