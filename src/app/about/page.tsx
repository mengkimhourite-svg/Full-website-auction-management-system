import { Shield, Award, Users, Globe, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/animations/Reveal";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="scale" className="mb-5">
            <span className="eyebrow eyebrow-dark">
              <Sparkles size={14} className="text-yellow-400" /> About Us
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Our Mission</h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              We are building the most trusted online auction platform where buyers and sellers connect with confidence.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal variant="left">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Who We Are</h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                AuctionPro is a premier online auction marketplace founded in 2025. We connect thousands of buyers and sellers
                worldwide, offering a secure and transparent platform for discovering unique items.
              </p>
              <p className="text-gray-600 mt-4 leading-relaxed">
                From luxury watches and fine jewelry to classic cars and rare collectibles, our platform provides
                real-time bidding with complete transparency and security.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Secure", color: "from-indigo-500 to-purple-500" },
                { icon: Award, label: "Trusted", color: "from-amber-500 to-yellow-500" },
                { icon: Users, label: "Community", color: "from-cyan-500 to-blue-500" },
                { icon: Globe, label: "Global", color: "from-emerald-500 to-green-500" },
              ].map((item, i) => (
                <Reveal key={item.label} variant="scale" delay={i * 120}>
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon size={22} className="text-white" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <Heart size={32} className="mx-auto text-indigo-600 mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900">Join Our Community</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Become part of a growing community of collectors, sellers, and enthusiasts.
            </p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all">
              Get Started Free
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
