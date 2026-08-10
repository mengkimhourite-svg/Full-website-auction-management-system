"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, User as UserIcon, UserPlus, X, CheckCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationItem from "@/components/notification/NotificationItem";
import type { Notification } from "@/types";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Auctions", href: "/auctions" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

const transparentRoutes = ["/"];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isTransparent = transparentRoutes.includes(pathname) && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      const notifs = json.data || json || [];
      if (Array.isArray(notifs)) setNotifications(notifs);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkNotifRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  }

  async function handleMarkAllNotifRead() {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  function getDashboardLink() {
    if (!user) return "/login";
    const role = (user.role || "").toUpperCase();
    if (role === "ADMIN") return "/admin";
    if (role === "SELLER") return "/seller/auctions";
    return "/bidder/reports";
  }

  const linkClass = (active: boolean) =>
    `nav-link text-sm font-medium transition-colors ${isTransparent ? (active ? "text-white font-semibold" : "text-white/80 hover:text-white") : active ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`;

  return (
    <nav className={`navbar ${isTransparent ? "navbar-transparent" : "navbar-scrolled"}`}>
      <div className="navbar-inner">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <Image
              src="/logo.png"
              alt="AuctionPro logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className={`text-xl font-extrabold tracking-[0.12em] hidden lg:inline ${isTransparent ? "text-white" : "text-gray-900"}`}>
              AUCTION PRO
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-5 px-2 lg:px-4">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(pathname === href)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`relative p-2 rounded-lg transition-colors ${isTransparent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllNotifRead} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkNotifRead} />
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-gray-100">
                        <Link href="/notifications" onClick={() => setNotifOpen(false)} className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isTransparent ? "bg-white/10 text-white hover:bg-white/15" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <UserIcon size={15} />
                <span className="text-sm font-medium">{user.name}</span>
                <ChevronDown size={13} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                  {[
                    { label: "Dashboard", href: getDashboardLink(), icon: LayoutDashboard },
                    { label: "Profile", href: "/profile", icon: UserIcon },
                    { label: "Notifications", href: "/notifications", icon: Bell },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={15} /> {label}
                    </Link>
                  ))}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="Login"
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <LogIn size={15} />
                <span className="hidden lg:inline">Login</span>
              </Link>
              <Link
                href="/register"
                aria-label="Register"
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isTransparent
                    ? "bg-white text-gray-900 hover:bg-white/90"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
              >
                <UserPlus size={15} />
                <span className="hidden lg:inline">Sign Up</span>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 shadow-lg">
          <div className="flex flex-col gap-1 pt-3">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === href ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon size={15} /> Profile
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bell size={15} /> Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={15} /> Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus size={15} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
