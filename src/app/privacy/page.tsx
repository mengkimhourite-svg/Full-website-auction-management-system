import { Sparkles, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    body: "When you create an account on AuctionPro, we collect your name, email address, and password (stored securely in encrypted form). When you place bids, list items, or make payments, we record the relevant transaction details such as item descriptions, bid amounts, and payment status.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to operate the platform: authenticate your account, process bids and payments, send notifications about auctions you follow or win, and provide customer support. We may also use aggregated, anonymized data to improve our services.",
  },
  {
    title: "3. Data Security",
    body: "We take reasonable technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Passwords are hashed and never stored in plain text.",
  },
  {
    title: "4. Sharing of Information",
    body: "We do not sell your personal information. We share only the data required to complete transactions — for example, your delivery details with a seller when you win an auction — or where required by law.",
  },
  {
    title: "5. Cookies",
    body: "AuctionPro uses cookies to keep you signed in and to remember your preferences. You can disable cookies in your browser, but some features of the platform may not work correctly without them.",
  },
  {
    title: "6. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting our support team. You may also delete your account from your profile settings.",
  },
  {
    title: "7. Contact",
    body: "If you have any questions about this Privacy Policy, please contact us through the Contact page or email info@auctionpro.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow eyebrow-dark mb-5">
            <Sparkles size={14} className="text-yellow-400" /> Legal
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
            How AuctionPro collects, uses, and protects your personal information.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <ShieldCheck size={22} className="text-white" />
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
