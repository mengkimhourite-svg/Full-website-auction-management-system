import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="AuctionPro logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="text-lg font-bold text-white">
                AuctionPro
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premium online auction platform connecting buyers and sellers worldwide.
              Discover unique items, place secure bids, and win amazing treasures.
            </p>
            <div className="flex gap-2 mt-6">
              {[
                { icon: Facebook, href: "#", name: "Facebook" },
                { icon: Twitter, href: "#", name: "Twitter" },
                { icon: Instagram, href: "#", name: "Instagram" },
                { icon: Youtube, href: "#", name: "Youtube" },
              ].map(({ icon: Icon, href, name }) => (
                <a key={name} href={href}
                  className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Platform</h5>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Support</h5>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Contact</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">123 Merchant St, London, UK</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <a href="mailto:info@auctionpro.com" className="text-slate-400 hover:text-white transition-colors">info@auctionpro.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <span className="text-slate-400">+44 20 7123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span className="text-slate-400">24/7 Live Support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AuctionPro. All rights reserved.
          </p> */}
          {/* <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div> */}

        </div>
      </div>
    </footer>
  );
}
