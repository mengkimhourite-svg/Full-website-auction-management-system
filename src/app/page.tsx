"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Hero from "@/components/common/Hero";
import WatchCard from "@/components/common/WatchCard";
import { ArrowRight, Shield, Zap, Trophy, CheckCircle, Star, Award, Gem, Palette, Car, Watch, Wine, Users, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import Reveal from "@/components/common/Reveal";
import type { Auction } from "@/types";

const testimonials = [
  { name: "Sarah Johnson", role: "Collector", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", text: "AuctionPro made it so easy to find rare collectibles. The bidding process is smooth and secure." },
  { name: "Michael Chen", role: "Seller", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", text: "I've sold over 50 items on AuctionPro. The platform's reach and reliability are unmatched." },
  { name: "Emily Rodriguez", role: "Bidder", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", text: "Won my first auction last week. The entire experience from bidding to delivery was flawless." },
];

const categories = [
  { name: "Watches", icon: Watch, count: "", color: "bg-blue-600" },
  { name: "Jewelry", icon: Gem, count: "", color: "bg-pink-600" },
  { name: "Art", icon: Palette, count: "", color: "bg-violet-600" },
  { name: "Cars", icon: Car, count: "", color: "bg-orange-600" },
  { name: "Wine", icon: Wine, count: "", color: "bg-emerald-600" },
  { name: "Collectibles", icon: Award, count: "", color: "bg-amber-600" },
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
              { icon: Shield, text: "", color: "text-indigo-600" },
              { icon: Award, text: "", color: "text-gray-700" },
              { icon: Zap, text: "", color: "text-indigo-600" },
              { icon: Trophy, text: "", color: "text-gray-700" },
            ].map((item, i) => (
              <Reveal key={i} variant="scale" delay={i * 80}>
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
                  <div className={`w-11 h-11 mx-auto rounded-2xl ${cat.color} flex items-center justify-center mb-3`}>
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
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <Reveal variant="left">
              <span className="inline-flex items-center gap-2 eyebrow mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                Featured Items
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-3">Live Auctions</h2>
              <p className="text-gray-500 mt-2 max-w-lg text-base">Place your bids on these exclusive items before time runs out</p>
            </Reveal>
            <Reveal variant="right" delay={100}>
              <Link href="/auctions" className="btn-outline shrink-0">
                View All <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>

          {/* Live Bid Ticker */}
          {(auctions.length > 0 || !loading) && (
            <Reveal variant="up" delay={80}>
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-28 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-28 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
                <div className="flex w-max animate-ticker py-3">
                  {[...(auctions.length ? auctions : staticAuctions), ...(auctions.length ? auctions : staticAuctions)].map((a, i) => {
                    const title = "product" in a ? a.product?.title || "Untitled" : a.title;
                    const bid = "currentPrice" in a ? a.currentPrice ?? 0 : a.currentBid;
                    return (
                      <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-gray-900 font-semibold">{title}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-indigo-600 font-bold">${bid.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
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

      {/* How It Works — Hero */}
      <section className="relative bg-gray-50 text-gray-900 overflow-hidden border-y border-gray-100">
        <div className="absolute -top-32 -right-32 w-120 h-120 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-100 h-100 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-3">
              <Reveal variant="scale" className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md">
                  <span className="w-1 h-1 rounded-full bg-indigo-500" /> How It Works
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                  Start Bidding in <br className="hidden sm:block" />
                  <span className="text-indigo-600">3 Simple Steps</span>
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-gray-500 mt-5 text-base lg:text-lg max-w-lg leading-relaxed">
                  Getting started with AuctionPro is quick and easy. Join thousands of active bidders.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Get Started <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/auctions"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-md font-semibold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    Browse Auctions
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={380}>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-gray-500">
                  <span className="flex items-center gap-2"><Trophy size={14} className="text-indigo-500" /> 50,000+ users</span>
                  <span className="flex items-center gap-2"><Shield size={14} className="text-indigo-500" /> Secure escrow</span>
                  <span className="flex items-center gap-2"><Zap size={14} className="text-indigo-500" /> Real-time bids</span>
                </div>
              </Reveal>
            </div>

            <Reveal variant="right" delay={200} className="lg:col-span-2">
              <div className="space-y-3">
                {[
                  { step: "01", title: "Create Account", text: "Sign up free and set up your profile.", icon: Users },
                  { step: "02", title: "Place Your Bid", text: "Browse live auctions and place your offer.", icon: Zap },
                  { step: "03", title: "Win & Collect", text: "Complete secure payment and receive your item.", icon: Trophy },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm shadow-indigo-100/50"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <span className="text-[11px] font-bold tracking-wider text-indigo-500/70">{item.step}</span>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
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

      {/* Contact Hero */}
      <section className="relative py-16 lg:py-24 bg-slate-900 text-white overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal variant="left">
              <span className="eyebrow eyebrow-dark mb-5">
                <MessageSquare size={14} className="text-amber-400" /> Contact Us
              </span>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                &apos;<span className="bg-linear-to-r from-amber-300 via-amber-400 to-amber-300 bg-clip-text text-transparent">We're Here to Help U</span>
              </h2>
              <p className="text-white/60 mt-4 text-base lg:text-lg max-w-lg leading-relaxed">
                Have questions about bidding, selling, or payments? Our team is ready to assist you every step of the way.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                >
                  <MessageSquare size={16} /> Contact Us <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 text-white border border-white/15 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Read FAQ
                </Link>
              </div>
            </Reveal>

            <Reveal variant="right" delay={120}>
              <div className="grid sm:grid-cols-1 gap-4">
                {[
                  { icon: Mail, title: "Email Us", text: "support@auctionpro.com", color: "from-sky-500 to-blue-500" },
                  { icon: Phone, title: "Call Us", text: "+ 885 099 5555 778", color: "from-emerald-500 to-teal-500" },
                  { icon: MapPin, title: "Visit Us", text: "Cambodia", color: "from-amber-500 to-orange-500" },
                ].map((item, i) => (
                  <Reveal key={item.title} variant="scale" delay={200 + i * 150}>
                    <Link
                      href="/contact"
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                    >
                      <div className={`w-12 h-12 shrink-0 rounded-xl bg-linear-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                        <item.icon size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/60 mt-0.5">{item.text}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Reveal>
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
            <Link href="/register" className="group inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3 rounded-x1 font-semibold text-sm hover:bg-indigo-700 transition-colors">
              Get Started Free <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/auctions" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-7 py-3 rounded-x1 font-semibold text-sm hover:bg-white/15 transition-colors">
              Browse Auctions <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}