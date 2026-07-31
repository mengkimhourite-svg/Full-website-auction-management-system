"use client";

import { useEffect, useState } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import UserTable from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data || json.users || json || []);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        setUsers(json.data || json.users || json || []);
        setError("");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBan = async (id: string) => {
    const user = users.find((u) => u.id === id);
    const action = user?.banned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`/api/users/${id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to ${action} user`);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/users/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = users.filter((u: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">Manage all registered users</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-sm"
            />
          </div>
          <button
            onClick={() => { setLoading(true); fetchUsers(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="loading-spinner" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Users size={28} />
          </div>
          <p className="text-gray-500 font-medium">
            {search ? "No users match your search" : "No users registered yet"}
          </p>
          <p className="text-sm text-gray-400">
            {search ? "Try a different search term" : "Users will appear here once they register"}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <UserTable users={filtered} onBan={handleBan} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
