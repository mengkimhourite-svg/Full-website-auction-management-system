"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, type User } from "@/services/auth.service";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const { loading: authLoading, setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);
      } catch {
        setError("Failed to load profile");
      } finally {
        setFetchLoading(false);
      }
    };
    if (!authLoading) fetchUser();
  }, [authLoading]);

  const handleSaveAccount = async (data: { name: string; email: string }) => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setCurrentUser(json.data || json);
      if (setUser) setUser(json.data || json);
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
      });
      const json = await res.json();
      if (!json.success) throw new Error("Failed to upload");
      setCurrentUser(json.data || json);
      if (setUser) setUser(json.data || json);
    } catch {
      alert("Failed to upload avatar");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || fetchLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Error</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="loading-page">
        <AlertCircle size={40} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Not Logged In</h2>
        <p className="text-gray-500">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
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
