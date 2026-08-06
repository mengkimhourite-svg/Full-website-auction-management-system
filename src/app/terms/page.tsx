import { Sparkles, Scale } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using AuctionPro, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any part of these terms, you must not use the platform.",
  },
  {
    title: "2. Accounts",
    body: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "3. Bidding Rules",
    body: "All bids are binding and final once placed. By placing a bid you commit to purchasing the item if you are the highest bidder when the auction ends. Shill bidding (bidding on your own listings) is strictly prohibited and may result in account suspension.",
  },
  {
    title: "4. Listings and Seller Obligations",
    body: "Sellers must provide accurate descriptions and images of items. Prohibited items include illegal goods, counterfeits, and items that violate intellectual property rights. Sellers are responsible for delivering items to winning bidders in the described condition.",
  },
  {
    title: "5. Payments and Fees",
    body: "Winning bidders must complete payment within the time specified after the auction ends. AuctionPro may charge listing or success fees, which will be communicated before you list an item. Late or non-payment may result in account restrictions.",
  },
  {
    title: "6. Prohibited Conduct",
    body: "You may not use the platform to harass others, manipulate bid outcomes, distribute malware, scrape data, or engage in any activity that disrupts the service. Violations may result in immediate suspension or permanent ban.",
  },
  {
    title: "7. Limitation of Liability",
    body: "AuctionPro acts as a platform connecting buyers and sellers and is not a party to any transaction between them. To the maximum extent permitted by law, AuctionPro is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
  },
  {
    title: "8. Termination",
    body: "We may suspend or terminate your account if you violate these terms. You may close your account at any time from your profile settings.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow eyebrow-dark mb-5">
            <Sparkles size={14} className="text-yellow-400" /> Legal
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
            The rules and guidelines governing your use of AuctionPro.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <Scale size={22} className="text-white" />
            </div>
            <p className="text-sm text-gray-500">Last updated: July 2026</p>
          </div>
          <div className="space-y-8">
            {sections.map(({ title, body }) => (
              <div key={title} className="card p-6 lg:p-7">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
