import { Sparkles, Truck, Package, Clock, MapPin } from "lucide-react";

const sections = [
  {
    icon: Truck,
    title: "Shipping Methods",
    body: "After an auction ends and payment is completed, the seller ships the item using the delivery method agreed at checkout. Standard shipping typically takes 3–7 business days, while express shipping takes 1–3 business days.",
  },
  {
    icon: Package,
    title: "Packaging & Tracking",
    body: "Sellers are required to package items securely to prevent damage during transit. Once shipped, a tracking number is provided on your order so you can follow your package in real time.",
  },
  {
    icon: Clock,
    title: "Delivery Times",
    body: "Delivery times depend on the seller's location, the shipping method selected, and the destination. Estimated delivery windows are shown at checkout. International shipments may require additional customs processing time.",
  },
  {
    icon: MapPin,
    title: "Shipping Costs",
    body: "Shipping costs are calculated at checkout based on the item's size, weight, and destination. Some sellers may offer free shipping on qualifying items — this is displayed on the item listing.",
  },
  {
    icon: Package,
    title: "Returns & Damages",
    body: "If your item arrives damaged or does not match the listing description, contact the seller within 7 days of delivery. You may be eligible for a return or refund depending on the seller's policy.",
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow eyebrow-dark mb-5">
            <Sparkles size={14} className="text-yellow-400" /> Shipping
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Shipping Info</h1>
          <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
            Everything you need to know about how your winning items are delivered.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6 lg:p-7">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md mb-4">
                  <Icon size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-extrabold text-gray-900">Need help with a delivery?</h3>
            <p className="text-gray-500 mt-2 text-sm">Contact the seller directly through your order, or reach our support team any time.</p>
            <a href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
