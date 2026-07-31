"use client";

import AccountSettings from "./AccountSettings";
import ChangePassword from "./ChangePassword";
import AvatarUpload from "./AvatarUpload";

interface ProfileFormProps {
  user: { name: string; email: string; role: string; avatar?: string | null };
  onSaveAccount: (data: { name: string; email: string }) => void;
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => void;
  onAvatarUpload: (file: File) => void;
  loading?: boolean;
}

export default function ProfileForm({
  user,
  onSaveAccount,
  onChangePassword,
  onAvatarUpload,
  loading,
}: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <AvatarUpload currentAvatar={user.avatar} onUpload={onAvatarUpload} loading={loading} />
      <AccountSettings initialData={user} onSave={onSaveAccount} loading={loading} />
      <ChangePassword onSubmit={onChangePassword} loading={loading} />
    </div>
  );
}
