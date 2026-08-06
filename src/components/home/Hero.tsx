"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, TrendingUp, Award, Gavel, ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1400&q=85",
    title: "Discover Rare\nTimepieces.",
    subtitle: "Bid on luxury watches from the world's finest brands.",
    accent: "from-purple-400 via-yellow-300 to-purple-300",
  },
  {
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=85",
    title: "Exquisite\nJewelry.",
    subtitle: "Diamond rings, necklaces, and precious gems await you.",
    accent: "from-pink-400 via-rose-300 to-yellow-300",
  },
  {
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&q=85",
    title: "Masterful\nArtwork.",
    subtitle: "Original paintings and sculptures from renowned artists.",
    accent: "from-blue-400 via-cyan-300 to-purple-300",
  },
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=85",
    title: "Classic &\nLuxury Cars.",
    subtitle: "Vintage automobiles and supercars at unbeatable prices.",
    accent: "from-orange-400 via-yellow-300 to-red-300",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 700);
    },
    [isAnimating]
  );

  const next = useCallback(() => goTo((current + 1) % heroSlides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + heroSlides.length) % heroSlides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0b0f24]">
      {heroSlides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f24]/90 via-[#0b0f24]/75 to-[#0b0f24]/90 z-[2]" />

      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <Gavel size={14} className="text-purple-400" />
              <span className="text-white/80 text-sm font-medium">Premium Online Auction Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white whitespace-pre-line">
              {slide.title.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 1 ? (
                    <>
                      <br />
                      <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                        {line}
                      </span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>

            <p className="mt-6 text-lg text-white/50 max-w-lg leading-relaxed transition-all duration-500">
              {slide.subtitle}
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

          <div className="relative">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-3 border border-purple-400/20 shadow-2xl overflow-hidden">
                <div className="relative h-96 sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden">
                  {heroSlides.map((s, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                      style={{ opacity: i === current ? 1 : 0 }}
                    >
                      <Image
                        src={s.image}
                        alt={s.title.replace("\n", " ")}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-400/25 pointer-events-none" />
            </div>

            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight size={20} />
            </button>


          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-16">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-10 bg-gradient-to-r from-purple-400 to-yellow-300"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
