import {
  Shield,
  Award,
  Users,
  Globe,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/common/Reveal";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      label: "Secure",
      description: "Your data and transactions are protected.",
    },
    {
      icon: Award,
      label: "Trusted",
      description: "Verified sellers and authentic products.",
    },
    {
      icon: Users,
      label: "Community",
      description: "A growing network of buyers and sellers.",
    },
    {
      icon: Globe,
      label: "Global",
      description: "Connect with auction enthusiasts worldwide.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-125 w-125 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="absolute -left-40 top-64 h-100 w-100 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="absolute right-[25%] top-32 h-3 w-3 rounded-full bg-blue-400/40" />

          <div className="absolute right-[12%] top-[45%] h-2 w-2 rounded-full bg-indigo-400/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">

            {/* LEFT */}
            <div>
              <Reveal variant="scale" className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  <Sparkles size={14} />
                  About AuctionPro
                </span>
              </Reveal>

              <Reveal delay={120}>
                  <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Building the
                  <br />
                  <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Future of Auctions.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  We are building the most trusted online auction platform
                  where buyers and sellers connect, discover, and trade with
                  confidence.
                </p>
              </Reveal>

              {/* CTA */}
              <Reveal delay={320}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Join AuctionPro
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

              {/* Trust points */}
              <Reveal delay={420}>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={17}
                      className="text-emerald-500"
                    />
                    Secure platform
                  </div>

                  <div className="flex items-center gap-2">
                    <BadgeCheck
                      size={17}
                      className="text-blue-500"
                    />
                    Verified sellers
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp
                      size={17}
                      className="text-indigo-500"
                    />
                    Real-time bidding
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT VISUAL */}
            <Reveal variant="right" delay={180}>
              <div className="relative mx-auto w-full max-w-xl">

                {/* Main card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-900/10">

                  {/* Image */}
                  <div className="relative h-97.5 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=85"
                      alt="Luxury jewelry auction"
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-transparent to-transparent" />

                    {/* Verified */}
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg backdrop-blur">
                      <BadgeCheck
                        size={14}
                        className="text-blue-600"
                      />
                      VERIFIED COLLECTION
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-xl bg-slate-950/80 p-5 text-white backdrop-blur-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                          Premium Marketplace
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          Discover Something Extraordinary
                        </h3>

                        <p className="mt-2 text-sm text-white/60">
                          Thousands of unique products from trusted sellers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats */}
                  
                </div>

                {/* Floating verified card */}
                <div className="absolute -right-5 top-12 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                      <Shield
                        size={17}
                        className="text-emerald-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Trusted Platform
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Secure & verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating community card */}
                <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Users size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Growing Community
                      </p>

                      
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO WE ARE
      ===================================================== */}

      <section className="border-y border-slate-100 bg-slate-50/70 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Content */}
            <Reveal variant="left">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Sparkles size={13} />
                Who We Are
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
                A Better Way to Discover and Auction
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                AuctionPro is a premier online auction marketplace founded
                in 2025. We connect buyers and sellers worldwide through a
                secure, transparent, and modern auction experience.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                From luxury watches and fine jewelry to classic cars and
                rare collectibles, our platform gives users access to
                exciting auctions with real-time bidding and trusted
                transactions.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                  <Shield size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Built Around Trust
                  </p>

                  <p className="text-xs text-slate-500">
                    Security and transparency come first.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((item, i) => {
                const Icon = item.icon;

                return (
                  <Reveal
                    key={item.label}
                    variant="scale"
                    delay={i * 100}
                  >
                    <div className="group h-full rounded-md border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon size={22} />
                      </div>

                      <p className="mt-5 text-sm font-bold text-slate-900">
                        {item.label}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">

          <Reveal variant="scale">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Heart size={27} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Our Mission
            </h2>
          </Reveal>

          <Reveal delay={220}>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
              We believe auctions should be exciting, transparent, and
              accessible to everyone. Our mission is to create a trusted
              marketplace where every bid brings buyers and sellers closer
              together.
            </p>
          </Reveal>

          {/* Mission points */}
          <Reveal delay={300}>
            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle
                  size={20}
                  className="text-emerald-500"
                />

                <p className="mt-3 text-sm font-bold text-slate-900">
                  Transparency
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Every bid is visible and every auction is fair.
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <Shield
                  size={20}
                  className="text-blue-600"
                />

                <p className="mt-3 text-sm font-bold text-slate-900">
                  Security
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your account and transactions are protected.
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <Users
                  size={20}
                  className="text-indigo-600"
                />

                <p className="mt-3 text-sm font-bold text-slate-900">
                  Community
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Connecting passionate buyers and sellers worldwide.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 py-24 text-white">

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">

          <Reveal variant="scale">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
              <Heart size={26} />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Join Our Community
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-blue-100">
              Become part of a growing community of collectors, sellers,
              and auction enthusiasts.
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