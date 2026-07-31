import { Bell } from "lucide-react";

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
