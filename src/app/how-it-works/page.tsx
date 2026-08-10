import { UserPlus, Search, Zap, Shield, Award, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/common/Reveal";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <section className="bg-linear-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="scale" className="mb-5">
            <span className="eyebrow eyebrow-dark">
              <Sparkles size={14} className="text-yellow-400" /> How It Works
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Start Bidding in 3 Simple Steps</h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Getting started with AuctionPro is quick and easy. Join thousands of active bidders.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {[
              { step: "01", title: "Create Your Account", text: "Sign up for free in under a minute. Choose your role as a buyer or seller and set up your profile with your preferences.", icon: UserPlus, color: "from-indigo-500 to-purple-500" },
              { step: "02", title: "Browse & Bid", text: "Explore hundreds of live auctions across categories like watches, jewelry, art, and more. Place your bids in real-time with our secure bidding system.", icon: Zap, color: "from-cyan-500 to-blue-500" },
              { step: "03", title: "Win & Collect", text: "Win the auction at your bid price. Complete secure checkout and receive your item with worldwide shipping and authenticity guaranteed.", icon: Shield, color: "from-emerald-500 to-green-500" },
            ].map((item, i) => (
              <div key={item.step} className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10 lg:gap-16`}>
                <Reveal variant={i % 2 === 0 ? "left" : "right"} className="flex-1 w-full">
                  <div className={`w-16 h-16 rounded-2xl bg-linear-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-xl`}>
                    <item.icon size={30} className="text-white" />
                  </div>
                  <div className="text-6xl font-black text-gray-100 mb-2">{item.step}</div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mt-3 leading-relaxed max-w-md">{item.text}</p>
                </Reveal>
                <Reveal variant={i % 2 === 0 ? "right" : "left"} delay={150} className="flex-1 w-full">
                  <div className="bg-gray-50 rounded-3xl p-8 lg:p-12 card-premium">
                    {i === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><CheckCircle size={18} className="text-green-500" /><span className="text-sm text-gray-700">Free account creation</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><CheckCircle size={18} className="text-green-500" /><span className="text-sm text-gray-700">Choose buyer or seller role</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><CheckCircle size={18} className="text-green-500" /><span className="text-sm text-gray-700">Personalized recommendations</span></div>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><Search size={18} className="text-indigo-500" /><span className="text-sm text-gray-700">Search by category or keyword</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><Zap size={18} className="text-indigo-500" /><span className="text-sm text-gray-700">Real-time bid updates</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><Award size={18} className="text-indigo-500" /><span className="text-sm text-gray-700">Watchlist your favorite items</span></div>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><CheckCircle size={18} className="text-green-500" /><span className="text-sm text-gray-700">Secure payment processing</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><Shield size={18} className="text-green-500" /><span className="text-sm text-gray-700">Authenticity guaranteed</span></div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl"><Award size={18} className="text-green-500" /><span className="text-sm text-gray-700">Worldwide shipping</span></div>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Ready to Start?</h2>
            <p className="text-white/70 mt-3 text-lg">Join thousands of users already bidding on AuctionPro.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-xl">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link href="/auctions" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all">
                Browse Auctions
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
