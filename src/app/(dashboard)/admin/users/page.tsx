"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Shield,
  ShoppingBag,
  Gavel,
  RefreshCw,
  Ban,
  CheckCircle,
  Edit3,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SearchInput from "@/components/admin/SearchInput";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Role, User } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmBan, setConfirmBan] = useState<{ id: string; name: string; banned: boolean } | null>(null);
  const [roleEdit, setRoleEdit] = useState<{ id: string; name: string; role: Role } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data || json.users || json || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const sellerCount = users.filter((u) => u.role === "SELLER").length;
  const bidderCount = users.filter((u) => u.role === "BIDDER").length;

  const stats = [
    { title: "Total", value: totalUsers, icon: <Users size={22} />, color: "from-indigo-600 to-purple-600" },
    { title: "Admins", value: adminCount, icon: <Shield size={22} />, color: "from-amber-500 to-orange-500" },
    { title: "Sellers", value: sellerCount, icon: <ShoppingBag size={22} />, color: "from-sky-500 to-cyan-500" },
    { title: "Bidders", value: bidderCount, icon: <Gavel size={22} />, color: "from-emerald-500 to-teal-500" },
  ];

  const handleBan = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user");
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleRoleUpdate = async (id: string, role: Role) => {
    try {
      const user = users.find((u) => u.id === id);
      const res = await fetch(`/api/users/${id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user?.name || "", role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update role");
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <StatusBadge variant="warning">Admin</StatusBadge>;
      case "SELLER":
        return <StatusBadge variant="info">Seller</StatusBadge>;
      case "BIDDER":
        return <StatusBadge variant="active">Bidder</StatusBadge>;
      default:
        return <StatusBadge variant="pending">{role}</StatusBadge>;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const columns = [
    {
      key: "avatar",
      label: "",
      render: (u: User) => (
        <div className="relative w-10 h-10">
          {u.avatar && (
            <img
              src={u.avatar}
              alt={u.name}
              className="w-10 h-10 rounded-full object-cover shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ${u.avatar ? "absolute inset-0" : ""}`}>
            {(u.name || "?").charAt(0).toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (u: User) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{u.name}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (u: User) => <span className="text-sm text-gray-500">{u.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (u: User) => getRoleBadge(u.role),
    },
    {
      key: "status",
      label: "Status",
      render: (u: User) =>
        u.banned ? (
          <StatusBadge variant="failed">Banned</StatusBadge>
        ) : (
          <StatusBadge variant="active">Active</StatusBadge>
        ),
    },
    {
      key: "joined",
      label: "Joined",
      render: (u: User) => <span className="text-sm text-gray-500">{formatDate(u.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: User) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setConfirmBan({ id: u.id, name: u.name, banned: u.banned })}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              u.banned
                ? "text-green-700 bg-green-50 hover:bg-green-100"
                : "text-red-700 bg-red-50 hover:bg-red-100"
            }`}
          >
            {u.banned ? <CheckCircle size={14} /> : <Ban size={14} />}
            {u.banned ? "Unban" : "Ban"}
          </button>
          <button
            onClick={() => setRoleEdit({ id: u.id, name: u.name, role: u.role })}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
          >
            <Edit3 size={14} />
            Role
          </button>
        </div>
      ),
    },
  ];

  const roles: Role[] = ["ADMIN", "SELLER", "BIDDER"];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Users size={22} />}
        title="Users"
        description="Manage all registered users"
        actions={
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {loading && <LoadingSpinner text="Loading users..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <SearchInput value={search} onChange={setSearch} placeholder="Search users by name, email, or role..." />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No users found"
              description={search ? "No users match your search" : "No users registered yet"}
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmBan}
        title={confirmBan?.banned ? "Unban User" : "Ban User"}
        message={
          confirmBan?.banned
            ? `Are you sure you want to unban ${confirmBan?.name}? They will regain access to the platform.`
            : `Are you sure you want to ban ${confirmBan?.name}? They will lose access to the platform.`
        }
        confirmLabel={confirmBan?.banned ? "Unban" : "Ban"}
        variant={confirmBan?.banned ? "info" : "danger"}
        onConfirm={() => {
          if (confirmBan) handleBan(confirmBan.id);
          setConfirmBan(null);
        }}
        onCancel={() => setConfirmBan(null)}
      />

      {roleEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRoleEdit(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Change Role</h3>
            <p className="text-sm text-gray-500 mb-5">Update role for {roleEdit.name}</p>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    handleRoleUpdate(roleEdit.id, role);
                    setRoleEdit(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    roleEdit.role === role
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                      : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => setRoleEdit(null)}
              className="w-full mt-4 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
