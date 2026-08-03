import { Calendar, Mail, Shield, User } from "lucide-react";
import Image from "next/image";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    createdAt?: string;
  };
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white text-3xl font-bold mx-auto overflow-hidden">
        {user.avatar ? (
          <Image src={user.avatar} alt="" width={80} height={80} className="w-full h-full object-cover" />
        ) : (
          <User size={36} />
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h2>
      <div className="flex items-center justify-center gap-2 mt-1">
        <Mail size={14} className="text-gray-400" />
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Shield size={14} className="text-indigo-500" />
        <span className="badge badge-info capitalize">{user.role}</span>
      </div>
      {user.createdAt && (
        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
          <Calendar size={12} />
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
