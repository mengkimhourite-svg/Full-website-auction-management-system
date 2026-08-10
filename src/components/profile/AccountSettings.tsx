"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

interface AccountSettingsProps {
  initialData: { name: string; email: string; role: string };
  onSave: (data: { name: string; email: string }) => void;
  loading?: boolean;
}

export default function AccountSettings({ initialData, onSave, loading }: AccountSettingsProps) {
  const [name, setName] = useState(initialData.name ?? "");
  const [email, setEmail] = useState(initialData.email ?? "");

  useEffect(() => {
    setName(initialData.name ?? "");
    setEmail(initialData.email ?? "");
  }, [initialData.name, initialData.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-900">Account Settings</h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
        <input
          type="text"
          value={initialData.role}
          disabled
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-linear-gradient-to-r from-indigo-600 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
