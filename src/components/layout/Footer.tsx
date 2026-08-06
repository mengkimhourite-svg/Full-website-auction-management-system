import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, ArrowUpRight } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Home", href: "/" },
    { label: "Auctions", href: "/auctions" },
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Categories", href: "/categories" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Shipping Info", href: "/shipping" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="AuctionPro logo"
                width={44}
                height={44}
                className="w-11 h-11 object-contain rounded-xl shadow-lg shadow-indigo-500/20"
              />
              <span className="text-xl font-extrabold bg-linear-to-r from-purple-200 to-white/80 bg-clip-text text-transparent">
                AuctionPro
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              The premium online auction platform connecting buyers and sellers worldwide.
              Discover unique items, place secure bids, and win amazing treasures.
            </p>
            <div className="flex gap-3 mt-8">
              {[
                { icon: Facebook, href: "#", name: "Facebook" },
                { icon: Twitter, href: "#", name: "Twitter" },
                { icon: Instagram, href: "#", name: "Instagram" },
                { icon: Youtube, href: "#", name: "Youtube" },
              ].map(({ icon: Icon, href, name }) => (
                <a key={name} href={href}
                  className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-5 text-sm tracking-wider uppercase">Platform</h5>
            <ul className="space-y-3.5">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-purple-400 transition-colors group"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-5 text-sm tracking-wider uppercase">Support</h5>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-purple-400 transition-colors group"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-5 text-sm tracking-wider uppercase">Contact</h5>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-purple-400 shrink-0" />
                <span className="text-slate-400">123 Merchant St, London, UK</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-purple-400 shrink-0" />
                <a href="mailto:info@auctionpro.com" className="text-slate-400 hover:text-purple-400 transition-colors">info@auctionpro.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-purple-400 shrink-0" />
                <span className="text-slate-400">+44 20 7123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-purple-400 shrink-0" />
                <span className="text-slate-400">24/7 Live Support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AuctionPro. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
