"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Ban, User as UserIcon, Check, X } from "lucide-react";
import UserStatusBadge from "./UserStatusBadge";
import type { User, Role } from "@/types";

interface UserTableProps {
  users: User[];
  onBan: (id: string) => void;
  onUpdate: (id: string, data: { name: string; role: Role }) => void;
}

const roles = ["BIDDER", "SELLER", "ADMIN"];

export default function UserTable({ users, onBan, onUpdate }: UserTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<Role>("BIDDER");

  if (!users.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">No users found.</div>
    );
  }

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name || "");
    setEditRole(user.role || "BIDDER");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (user: User) => {
    const name = editName.trim();
    if (!name) return;
    onUpdate(user.id, { name, role: editRole });
    setEditingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEditing = editingId === user.id;
            return (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.avatar ? (
                        <Image src={user.avatar} alt="" width={32} height={32} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon size={14} />
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{user.name}</span>
                    )}
                  </div>
                </td>
                <td className="text-gray-500">{user.email}</td>
                <td>
                  {isEditing ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as Role)}
                      className="px-2 py-1 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge badge-info">{user.role}</span>
                  )}
                </td>
                <td>
                  <UserStatusBadge status={user.banned ? "Banned" : "Active"} banned={user.banned} />
                </td>
                <td className="text-gray-500 text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(user)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                        >
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(user)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => onBan(user.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            user.banned
                              ? "text-green-700 bg-green-50 hover:bg-green-100"
                              : "text-red-700 bg-red-50 hover:bg-red-100"
                          }`}
                        >
                          <Ban size={14} />
                          {user.banned ? "Unban" : "Ban"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
