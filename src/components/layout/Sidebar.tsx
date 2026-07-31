"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-sky-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
