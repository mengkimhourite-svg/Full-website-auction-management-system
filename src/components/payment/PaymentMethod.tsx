"use client";

import { useState } from "react";
import { CreditCard, Building2, Check } from "lucide-react";

const methods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
];

interface PaymentMethodProps {
  onSelect: (method: string) => void;
}

export default function PaymentMethod({ onSelect }: PaymentMethodProps) {
  const [selected, setSelected] = useState("card");

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Payment Method</h3>
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => handleSelect(method.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Icon size={20} className={isSelected ? "text-indigo-600" : "text-gray-400"} />
            <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
              {method.label}
            </span>
            {isSelected && <Check size={16} className="ml-auto text-indigo-600" />}
          </button>
        );
      })}
    </div>
  );
}
