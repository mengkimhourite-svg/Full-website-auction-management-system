"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const { user: currentUser, loading: authLoading, setUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSaveAccount = async (data: { name: string; email: string }) => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setUser(json.data || json);
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to change password");
      alert("Password changed successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to upload");
      setUser(json.data || json);
    } catch {
      alert("Failed to upload avatar");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="loading-page">
        <AlertCircle size={36} className="text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">Not Logged In</h2>
        <p className="text-gray-500 text-sm">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account settings and preferences</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div><ProfileCard user={currentUser} /></div>
          <div className="md:col-span-2">
            <ProfileForm
              user={currentUser}
              onSaveAccount={handleSaveAccount}
              onChangePassword={handleChangePassword}
              onAvatarUpload={handleAvatarUpload}
              loading={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
