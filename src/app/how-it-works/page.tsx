import {
  UserPlus,
  Search,
  Zap,
  Shield,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock3,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/common/Reveal";

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Create Your Account",
      text: "Sign up for free in under a minute. Choose your role as a buyer or seller and set up your profile with your preferences.",
      icon: UserPlus,
      items: [
        {
          icon: CheckCircle,
          text: "Free account creation",
          color: "text-emerald-500",
        },
        {
          icon: CheckCircle,
          text: "Choose buyer or seller role",
          color: "text-emerald-500",
        },
        {
          icon: CheckCircle,
          text: "Personalized recommendations",
          color: "text-emerald-500",
        },
      ],
    },
    {
      step: "02",
      title: "Browse & Bid",
      text: "Explore hundreds of live auctions across categories like watches, jewelry, art, and more. Place your bids in real-time with our secure bidding system.",
      icon: Zap,
      items: [
        {
          icon: Search,
          text: "Search by category or keyword",
          color: "text-blue-500",
        },
        {
          icon: Zap,
          text: "Real-time bid updates",
          color: "text-blue-500",
        },
        {
          icon: Award,
          text: "Watchlist your favorite items",
          color: "text-blue-500",
        },
      ],
    },
    {
      step: "03",
      title: "Win & Collect",
      text: "Win the auction at your bid price. Complete secure checkout and receive your item with worldwide shipping and authenticity guaranteed.",
      icon: Shield,
      items: [
        {
          icon: CheckCircle,
          text: "Secure payment processing",
          color: "text-emerald-500",
        },
        {
          icon: Shield,
          text: "Authenticity guaranteed",
          color: "text-emerald-500",
        },
        {
          icon: Award,
          text: "Worldwide shipping",
          color: "text-emerald-500",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -left-32 top-64 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="absolute right-[30%] top-20 h-3 w-3 rounded-full bg-blue-400/40" />
          <div className="absolute right-[15%] top-1/3 h-2 w-2 rounded-full bg-indigo-400/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
            {/* LEFT CONTENT */}
            <div>
              <Reveal variant="scale" className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  <Sparkles size={14} />
                  The Smarter Way to Auction
                </span>
              </Reveal>

              <Reveal delay={120}>
                <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Start Bidding.
                  <br />
                  <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Win More.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Getting started with AuctionPro is simple. Discover
                  exclusive items, join live auctions, and experience secure
                  real-time bidding.
                </p>
              </Reveal>

              {/* CTA BUTTONS */}
              <Reveal delay={320}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Start Bidding
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    href="/auctions"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
                  >
                    Explore Auctions
                  </Link>
                </div>
              </Reveal>

              {/* TRUST FEATURES */}
              <Reveal delay={420}>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={17}
                      className="text-emerald-500"
                    />
                    Secure bidding
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield size={17} className="text-blue-500" />
                    Verified sellers
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap size={17} className="text-amber-500" />
                    Real-time bids
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT AUCTION PREVIEW */}
            <Reveal variant="right" delay={180}>
              <div className="relative mx-auto w-full max-w-xl">
                {/* Main card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-900/10">
                  {/* Product image */}
                  <div className="relative h-90 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=85"
                      alt="Luxury watch auction"
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Category */}
                    <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      Luxury Watches
                    </div>

                    {/* Bottom auction info */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-end justify-between gap-4 rounded-xl bg-slate-950/80 p-4 text-white backdrop-blur-md">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50">
                            Auction ends in
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <Clock3 size={16} />

                            <p className="font-mono text-lg font-bold">
                              02 : 14 : 36
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/auctions"
                          className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold transition hover:bg-blue-500"
                        >
                          Bid Now
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Product information */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-blue-600">
                          Premium Collection
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          Rolex Submariner Date
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <BadgeCheck
                            size={14}
                            className="text-blue-500"
                          />
                          Verified authentic
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Current Bid
                        </p>

                        <p className="mt-1 text-xl font-black text-slate-900">
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating active bids card */}
               

                {/* Floating verified card */}
               
              </div>
            </Reveal>
          </div>
        </div>

        {/* HERO STATS */}
        <div className="relative border-t border-slate-100 bg-slate-50/70">
          
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Reveal variant="scale">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <Zap size={14} />
                Simple & Secure
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                How AuctionPro Works
              </h2>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-4 text-lg leading-7 text-slate-500">
                From creating your account to winning your first auction,
                everything is designed to be simple and secure.
              </p>
            </Reveal>
          </div>

          {/* Steps */}
          <div className="space-y-20">
            {steps.map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className={`flex flex-col items-center gap-10 lg:gap-16 ${
                    i % 2 === 0
                      ? "lg:flex-row"
                      : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Text */}
                  <Reveal
                    variant={i % 2 === 0 ? "left" : "right"}
                    className="w-full flex-1"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Icon size={26} />
                    </div>

                    <div className="mb-2 text-6xl font-black text-slate-100">
                      {item.step}
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-md leading-relaxed text-slate-600">
                      {item.text}
                    </p>
                  </Reveal>

                  {/* Feature Card */}
                  <Reveal
                    variant={i % 2 === 0 ? "right" : "left"}
                    delay={150}
                    className="w-full flex-1"
                  >
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:p-10">
                      <div className="space-y-3">
                        {item.items.map((feature) => {
                          const FeatureIcon = feature.icon;

                          return (
                            <div
                              key={feature.text}
                              className="flex items-center gap-3 rounded-md border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <FeatureIcon
                                size={19}
                                className={feature.color}
                              />

                              <span className="text-sm font-medium text-slate-700">
                                {feature.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress */}
                      <div className="mt-7">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-medium text-slate-500">
                            Step progress
                          </span>

                          <span className="font-bold text-blue-600">
                            {i === 0
                              ? "33%"
                              : i === 1
                                ? "66%"
                                : "100%"}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full bg-blue-600 ${
                              i === 0
                                ? "w-1/3"
                                : i === 1
                                  ? "w-2/3"
                                  : "w-full"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 py-24 text-white">
        {/* Decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
              <GavelIcon />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to Start Bidding?
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-blue-100">
              Join thousands of users already discovering unique products and
              winning exciting auctions on AuctionPro.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Browse Auctions
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CTA ICON
========================================================= */

function GavelIcon() {
  return <Award size={26} />;
}