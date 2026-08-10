"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, TrendingUp, Award, Gavel, ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1400&q=85",
    title: "Discover Rare\nTimepieces",
    subtitle: "Bid on luxury watches from the world's finest brands.",
  },
  {
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=85",
    title: "Exquisite\nJewelry",
    subtitle: "Diamond rings, necklaces, and precious gems await you.",
  },
  {
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&q=85",
    title: "Masterful\nArtwork",
    subtitle: "Original paintings and sculptures from renowned artists.",
  },
  {
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=85",
    title: "Classic &\nLuxury Cars",
    subtitle: "Vintage automobiles and supercars at unbeatable prices.",
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
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating]
  );

  const next = useCallback(() => goTo((current + 1) % heroSlides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + heroSlides.length) % heroSlides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center overflow-hidden bg-slate-900">
      {heroSlides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
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

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/85 z-[2]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
            <Gavel size={13} className="text-indigo-400" />
            <span className="text-white/70 text-xs font-medium">Premium Online Auction Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-white whitespace-pre-line">
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>
                {i === 1 ? (
                  <>
                    <br />
                    <span className="text-indigo-400">{line}</span>
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="mt-5 text-base lg:text-lg text-white/50 max-w-lg leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auctions"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Start Bidding <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold text-sm hover:bg-white/15 transition-colors"
            >
              <TrendingUp size={16} /> Create Auction
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-white/40">
              <Shield size={14} className="text-indigo-400" />
              <span>Secure Bidding</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Award size={14} className="text-indigo-400" />
              <span>Authenticated Items</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Zap size={14} className="text-indigo-400" />
              <span>Real-time Bids</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="relative w-72 xl:w-80 h-72 xl:h-80 rounded-xl overflow-hidden border border-white/10">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.title.replace("\n", " ")}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-indigo-500"
                : "w-1.5 bg-white/25 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
