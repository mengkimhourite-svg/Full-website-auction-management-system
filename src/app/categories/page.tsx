import Link from "next/link";
import { Watch, Gem, Palette, Car, Wine, Lamp, Award, Laptop, Sparkles, ArrowRight } from "lucide-react";

const categories = [
  { name: "Watches", icon: Watch, count: "2,400+ lots", desc: "Luxury timepieces from iconic brands", color: "from-blue-500 to-cyan-500" },
  { name: "Jewelry", icon: Gem, count: "3,100+ lots", desc: "Fine diamonds, gold and gemstones", color: "from-pink-500 to-rose-500" },
  { name: "Art", icon: Palette, count: "1,800+ lots", desc: "Paintings, sculptures and prints", color: "from-purple-500 to-violet-500" },
  { name: "Cars", icon: Car, count: "900+ lots", desc: "Classic and collector automobiles", color: "from-orange-500 to-red-500" },
  { name: "Wine", icon: Wine, count: "1,200+ lots", desc: "Rare vintages and fine spirits", color: "from-emerald-500 to-green-500" },
  { name: "Antiques", icon: Lamp, count: "1,500+ lots", desc: "Historic furniture and artifacts", color: "from-amber-600 to-yellow-500" },
  { name: "Collectibles", icon: Award, count: "4,500+ lots", desc: "Coins, stamps, toys and more", color: "from-amber-500 to-yellow-400" },
  { name: "Electronics", icon: Laptop, count: "2,000+ lots", desc: "Premium gadgets and tech gear", color: "from-slate-500 to-slate-700" },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="eyebrow eyebrow-dark mb-5">
              <Sparkles size={14} className="text-yellow-400" /> Categories
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Explore Categories</h1>
            <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto">Browse auctions by category and find exactly what you&apos;re looking for</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/auctions?category=${encodeURIComponent(cat.name)}`}
                className="group card p-5 lg:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center shadow-md transition-transform group-hover:scale-110 duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 mt-4">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{cat.desc}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-3">{cat.count}</p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-indigo-600 transition-colors">
                  Browse Auctions <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
