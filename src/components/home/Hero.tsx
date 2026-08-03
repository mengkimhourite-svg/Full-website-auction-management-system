import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, TrendingUp, Award, Gavel } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-[#0b0f24] via-[#141a38] to-[#1c2549]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-24 h-24 border border-indigo-400/20 rounded-2xl rotate-12 animate-float-slow" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 border border-purple-400/25 rounded-xl -rotate-6 animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border border-purple-400/20 rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-purple-400/60 rounded-full animate-float-slow" style={{ animationDelay: '0.6s' }} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-left">
            <div className="eyebrow eyebrow-dark mb-8">
              <Gavel size={14} className="text-purple-400" />
              <span className="text-white/90">Premium Online Auction Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white">
              Discover Unique Items.
              <br />
              <span className="bg-linear-to-r from-purple-400 via-yellow-300 to-purple-300 bg-clip-text text-transparent">
                Bid With Confidence.
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
              Join the modern auction platform where buyers and sellers connect.
              Discover rare treasures, place secure bids, and win amazing items.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auctions"
                className="group inline-flex items-center gap-2.5 px-8 py-4 gold-shimmer text-white rounded-2xl font-bold text-base shadow-xl shadow-purple-950/40 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Start Bidding <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold text-base hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <TrendingUp size={18} /> Create Auction
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
              <div className="flex items-center gap-2.5 text-white/50">
                <Shield size={16} className="text-indigo-400" />
                <span>Secure Bidding</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50">
                <Award size={16} className="text-yellow-400" />
                <span>Authenticated Items</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50">
                <Zap size={16} className="text-purple-400" />
                <span>Real-time Bids</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-3 border border-purple-400/20 shadow-2xl">
                <div className="relative h-96 sm:h-[480px] lg:h-[540px] overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=85"
                    alt="Premium auction items"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-400/25 pointer-events-none" />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-[#0f1530]/90 backdrop-blur-xl rounded-2xl px-6 py-4 border border-purple-400/25 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
              <p className="text-3xl font-extrabold text-white">10,000+</p>
              <p className="text-white/60 text-sm mt-0.5">Active Auctions</p>
            </div>

            <div className="absolute -top-4 -right-4 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-2xl px-5 py-3.5 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
              <p className="text-2xl font-extrabold">98%</p>
              <p className="text-purple-100 text-sm">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
