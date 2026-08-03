"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, User as UserIcon, UserPlus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/types";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Auctions", href: "/auctions" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

const transparentRoutes = ["/"];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isTransparent = transparentRoutes.includes(pathname) && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.success ? d.data : d.user || null))
      .catch(() => { });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
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
    `nav-link text-sm font-medium transition-colors ${isTransparent ? (active ? "text-white font-semibold" : "text-white/90 hover:text-white") : active ? "text-indigo-700" : "text-gray-600 hover:text-indigo-700"}`;

  return (
    <nav className={`navbar ${isTransparent ? "navbar-transparent" : "navbar-scrolled"} animate-fade-down`}>
      <div className="navbar-inner">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <Image
              src="/logo.png"
              alt="AuctionPro logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain rounded-xl shadow-lg ring-1 ring-black/5 group-hover:scale-105 transition-transform"
            />
            <span className={`text-xl font-extrabold tracking-tight hidden lg:inline ${isTransparent ? "text-white" : "bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent"}`}>
              AuctionPro
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-8 px-2 lg:px-4">
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

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${isTransparent ? "bg-white/15 text-white hover:bg-white/25" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
              >
                <UserIcon size={16} />
                <span className="text-sm font-semibold">{user.name}</span>
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-down">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
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
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Icon size={16} /> {label}
                    </Link>
                  ))}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="Login"
                className={`flex items-center justify-center gap-2 px-3 lg:px-5 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors ${isTransparent ? "border-white/30 text-white hover:bg-white/10" : "border-indigo-600 text-indigo-700 hover:bg-indigo-50"
                  }`}
              >
                <LogIn size={16} />
                <span className="hidden lg:inline">Login</span>
              </Link>
              <Link
                href="/register"
                aria-label="Register"
                className="flex items-center justify-center gap-2 px-3 lg:px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-indigo-700 to-indigo-600 shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <UserPlus size={16} />
                <span className="hidden lg:inline">Register</span>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2.5 rounded-xl transition-colors ${isTransparent ? "text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-5 animate-fade-down shadow-xl">
          <div className="flex flex-col gap-1.5 pt-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === href ? "text-indigo-700 bg-indigo-50" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}`}
              >
                {label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <UserIcon size={16} /> Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <LogIn size={16} /> Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-700 to-indigo-600 transition-colors"
                >
                  <UserPlus size={16} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
