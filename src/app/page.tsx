"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/common/Hero";
import WatchCard from "@/components/common/WatchCard";
import { ArrowRight, Shield, Zap, Trophy, CheckCircle, Star, Award, Gem, Palette, Car, Watch, Wine, Users } from "lucide-react";
import Reveal from "@/components/common/Reveal";
import type { Auction } from "@/types";

const testimonials = [
  { name: "Sarah Johnson", role: "Collector", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", text: "AuctionPro made it so easy to find rare collectibles. The bidding process is smooth and secure." },
  { name: "Michael Chen", role: "Seller", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", text: "I've sold over 50 items on AuctionPro. The platform's reach and reliability are unmatched." },
  { name: "Emily Rodriguez", role: "Bidder", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", text: "Won my first auction last week. The entire experience from bidding to delivery was flawless." },
];

const categories = [
  { name: "Watches", icon: Watch, count: "2,400+ lots", color: "bg-blue-600" },
  { name: "Jewelry", icon: Gem, count: "3,100+ lots", color: "bg-pink-600" },
  { name: "Art", icon: Palette, count: "1,800+ lots", color: "bg-violet-600" },
  { name: "Cars", icon: Car, count: "900+ lots", color: "bg-orange-600" },
  { name: "Wine", icon: Wine, count: "1,200+ lots", color: "bg-emerald-600" },
  { name: "Collectibles", icon: Award, count: "4,500+ lots", color: "bg-amber-600" },
];

const staticAuctions = [
  { title: "Luxury Watch", currentBid: 500, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80", endingIn: "2h 15m", bids: 12 },
  { title: "Classic Car", currentBid: 25000, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80", endingIn: "1d 6h", bids: 8 },
  { title: "Rare Painting", currentBid: 8000, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80", endingIn: "3d 2h", bids: 24 },
  { title: "Diamond Ring", currentBid: 15000, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80", endingIn: "5h 30m", bids: 17 },
  { title: "Vintage Wine", currentBid: 3200, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80", endingIn: "4d 12h", bids: 5 },
  { title: "Antique Vase", currentBid: 4200, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&q=80", endingIn: "2d 8h", bids: 9 },
];

function getEndingIn(auction: Auction): string {
  const endTime = new Date(auction.endTime);
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
}

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auctions", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const items: Auction[] = (Array.isArray(data) ? data : data?.data || []).slice(0, 6);
        setAuctions(
          items.map((a) => ({
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
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-sm text-gray-500">
            {[
              { icon: Shield, text: "Secure Escrow Payments", color: "text-indigo-600" },
              { icon: Award, text: "Authenticity Guaranteed", color: "text-gray-700" },
              { icon: Zap, text: "Real-time Bidding", color: "text-indigo-600" },
              { icon: Trophy, text: "50,000+ Trusted Users", color: "text-gray-700" },
            ].map((item, i) => (
              <Reveal key={item.text} variant="scale" delay={i * 80}>
                <div className="flex items-center gap-2"><item.icon size={15} className={item.color} /> {item.text}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <span className="eyebrow mb-4">Browse Categories</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-3">Explore Our Collections</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">Find exactly what you&apos;re looking for across our curated categories</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <Reveal key={cat.name} variant="scale" delay={i * 60}>
                <Link href={`/auctions?category=${encodeURIComponent(cat.name)}`}
                  className="group card p-5 text-center hover:shadow-md transition-all"
                >
                  <div className={`w-11 h-11 mx-auto rounded-xl ${cat.color} flex items-center justify-center mb-3`}>
                    <cat.icon size={20} className="text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{cat.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <Reveal variant="left">
              <span className="eyebrow mb-4">Featured Items</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-3">Live Auctions</h2>
              <p className="text-gray-500 mt-2 max-w-lg text-base">Place your bids on these exclusive items before time runs out</p>
            </Reveal>
            <Reveal variant="right" delay={100}>
              <Link href="/auctions" className="btn-outline shrink-0">
                View All <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-3"><div className="h-3.5 bg-gray-100 rounded w-3/4 animate-pulse" /><div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" /><div className="h-7 bg-gray-100 rounded w-1/3 animate-pulse" /></div>
                </div>
              ))}
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {auctions.map((auction, i) => (
                <Reveal key={auction.id} variant="scale" delay={(i % 3) * 100}>
                  <WatchCard
                    title={auction.product?.title || "Untitled"}
                    currentBid={auction.currentPrice || 0}
                    image={auction.product?.image || ""}
                    endingIn={auction.endingIn}
                    bids={auction._count?.bids || auction.bids?.length || 0}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {staticAuctions.map((auction, i) => (
                <Reveal key={i} variant="scale" delay={(i % 3) * 100}>
                  <WatchCard {...auction} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal className="text-center mb-10">
            <span className="eyebrow mb-4">Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-3">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">Get started in three simple steps</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 mt-10">
            {[
              { step: "01", title: "Create Account", text: "Sign up for free and set up your profile. Join thousands of active bidders.", icon: Users, color: "bg-indigo-600" },
              { step: "02", title: "Place Your Bid", text: "Browse live auctions and place your best offer in real-time with confidence.", icon: Zap, color: "bg-indigo-600" },
              { step: "03", title: "Win & Collect", text: "Win the auction, complete secure payment, and receive your item worldwide.", icon: Trophy, color: "bg-indigo-600" },
            ].map((item, i) => (
              <Reveal key={item.title} variant="scale" delay={i * 100}>
                <div className="card p-7 text-center h-full">
                  <div className={`w-14 h-14 mx-auto rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon size={26} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-200 mb-3">{item.step}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <span className="eyebrow mb-4">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-3">What Our Users Say</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">Join thousands of satisfied buyers and sellers</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={i} variant="scale" delay={i * 100}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={13} className="" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {/* <Image src={t.avatar} alt={t.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" /> */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-slate-900 text-white">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle size={18} className="text-indigo-400" />
            <span className="text-white/60 font-medium text-sm">Trusted by users worldwide</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Ready to Start Bidding?</h2>
          <p className="text-white/50 mt-3 max-w-xl mx-auto text-base">Join thousands of buyers and sellers on the most trusted auction platform.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
              Get Started Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/auctions" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-7 py-3 rounded-lg font-semibold text-sm hover:bg-white/15 transition-colors">
              Browse Auctions
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}