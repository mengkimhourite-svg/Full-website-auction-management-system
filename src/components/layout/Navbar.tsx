"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, User as UserIcon, UserPlus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <span className={`text-lg font-bold tracking-tight hidden lg:inline ${isTransparent ? "text-white" : "text-gray-900"}`}>
              AuctionPro
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
                <span className="hidden lg:inline">Register</span>
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
