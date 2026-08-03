"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar flex flex-col">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-base font-extrabold bg-linear-to-r from-purple-300 to-purple-200 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <Icon size={18} className={isActive ? "text-purple-300" : ""} />
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
