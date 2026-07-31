"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import WatchCard from "@/components/home/WatchCard";
import { ArrowRight, Shield, Zap, Trophy, Gavel, TrendingUp, Users, DollarSign, CheckCircle, Star, Sparkles, Award, Gem, Palette, Car, Watch, Wine } from "lucide-react";
const testimonials = [
  { name: "Sarah Johnson", role: "Collector", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", text: "AuctionPro made it so easy to find rare collectibles. The bidding process is smooth and secure." },
  { name: "Michael Chen", role: "Seller", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", text: "I've sold over 50 items on AuctionPro. The platform's reach and reliability are unmatched." },
  { name: "Emily Rodriguez", role: "Bidder", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", text: "Won my first auction last week. The entire experience from bidding to delivery was flawless." },
];

const categories = [
  { name: "Watches", icon: Watch, count: "2,400+ lots", color: "from-blue-500 to-cyan-500" },
  { name: "Jewelry", icon: Gem, count: "3,100+ lots", color: "from-pink-500 to-rose-500" },
  { name: "Art", icon: Palette, count: "1,800+ lots", color: "from-purple-500 to-violet-500" },
  { name: "Cars", icon: Car, count: "900+ lots", color: "from-orange-500 to-red-500" },
  { name: "Wine", icon: Wine, count: "1,200+ lots", color: "from-emerald-500 to-green-500" },
  { name: "Collectibles", icon: Award, count: "4,500+ lots", color: "from-amber-500 to-yellow-500" },
];

const staticAuctions = [
  { title: "Luxury Watch", currentBid: 500, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80", endingIn: "2h 15m", bids: 12 },
  { title: "Classic Car", currentBid: 25000, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80", endingIn: "1d 6h", bids: 8 },
  { title: "Rare Painting", currentBid: 8000, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80", endingIn: "3d 2h", bids: 24 },
  { title: "Diamond Ring", currentBid: 15000, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80", endingIn: "5h 30m", bids: 17 },
  { title: "Vintage Wine", currentBid: 3200, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80", endingIn: "4d 12h", bids: 5 },
  { title: "Antique Vase", currentBid: 4200, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80", endingIn: "2d 8h", bids: 9 },
];

function getEndingIn(auction: any): string {
  const endTime = new Date(auction.endTime);
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
}

export default function Home() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auctions")
      .then((r) => r.json())
      .then((data) => {
        const items = (Array.isArray(data) ? data : data?.data || []).slice(0, 6);
        setAuctions(
          items.map((a: any) => ({
            ...a,
            endingIn: getEndingIn(a),
          }))
        );
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      <Hero />

      {/* Trust Bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Shield size={16} className="text-indigo-600" /> Secure Escrow Payments</div>
            <div className="flex items-center gap-2"><Award size={16} className="text-yellow-500" /> Authenticity Guaranteed</div>
            <div className="flex items-center gap-2"><Zap size={16} className="text-indigo-600" /> Real-time Bidding</div>
            <div className="flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> 50,000+ Trusted Users</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 lg:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="eyebrow mb-5">
              <Sparkles size={14} /> Browse Categories
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Explore Our Collections</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">Find exactly what you&apos;re looking for across our curated categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/auctions?category=${encodeURIComponent(cat.name)}`}
                className="group card p-6 text-center hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                  <cat.icon size={24} className="text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <span className="eyebrow mb-5">
                <Gem size={14} /> Featured Items
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Live Auctions</h2>
              <p className="text-gray-500 mt-3 max-w-xl text-lg">Place your bids on these exclusive items before time runs out</p>
            </div>
            <Link href="/auctions" className="btn-outline shrink-0">
              View All Auctions <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-56 bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" /><div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" /><div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" /></div>
                </div>
              ))}
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {auctions.map((auction: any) => (
                <WatchCard key={auction.id}
                  title={auction.product?.title || "Untitled"}
                  currentBid={auction.currentPrice || 0}
                  image={auction.product?.image || ""}
                  endingIn={auction.endingIn}
                  bids={auction._count?.bids || auction.bids?.length || 0}
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {staticAuctions.map((auction, i) => <WatchCard key={i} {...auction} />)}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { icon: Gavel, value: "10,000+", label: "Active Auctions", color: "from-indigo-400 to-purple-400" },
              { icon: Users, value: "50,000+", label: "Registered Users", color: "from-cyan-400 to-blue-400" },
              { icon: DollarSign, value: "$2M+", label: "Total Sales", color: "from-green-400 to-emerald-400" },
              { icon: Trophy, value: "98%", label: "Satisfaction", color: "from-yellow-400 to-orange-400" },
            ].map((stat) => (
              <div key={stat.label} className="animate-fade-up">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-linear-to-br ${stat.color} bg-opacity-20 flex items-center justify-center mb-5 shadow-lg`}>
                  <stat.icon size={28} className="text-white" />
                </div>
                <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow mb-5">
            <Sparkles size={14} /> Simple Process
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">How Auction Works</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">Get started in three simple steps</p>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mt-14">
            {[
              { step: "01", title: "Create Account", text: "Sign up for free and set up your profile. Join thousands of active bidders.", icon: Users, color: "from-indigo-500 to-purple-500" },
              { step: "02", title: "Place Your Bid", text: "Browse live auctions and place your best offer in real-time with confidence.", icon: Zap, color: "from-cyan-500 to-blue-500" },
              { step: "03", title: "Win & Collect", text: "Win the auction, complete secure payment, and receive your item worldwide.", icon: Trophy, color: "from-yellow-500 to-orange-500" },
            ].map((item) => (
              <div key={item.title} className="card p-8 lg:p-10 text-center hover:-translate-y-1 transition-all duration-300">
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center mb-6 shadow-xl`}>
                  <item.icon size={36} className="text-white" />
                </div>
                <div className="text-5xl font-black text-gray-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-500 mt-3 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="eyebrow mb-5">
              <Star size={14} /> Testimonials
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">What Our Users Say</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">Join thousands of satisfied buyers and sellers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-8 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-linear-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle size={20} className="text-green-300" />
            <span className="text-green-200 font-semibold text-sm">Trusted by 50,000+ users worldwide</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Ready to Start Bidding?</h2>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto text-lg">Join thousands of buyers and sellers on the most trusted auction platform.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="group inline-flex items-center gap-2.5 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold text-base hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-xl">
              Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auctions" className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/20 transition-all">
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
