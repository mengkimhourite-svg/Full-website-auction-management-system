import { Sparkles, HelpCircle, UserPlus, Gavel, CreditCard, Truck, ShieldCheck, ChevronRight } from "lucide-react";

const faqs = [
  {
    icon: UserPlus,
    question: "How do I create an account?",
    answer: "Click the \"Register\" button in the top navigation, fill in your name, email, and password, then choose your role (bidder or seller). You can start bidding or listing items immediately after confirming your email.",
  },
  {
    icon: Gavel,
    question: "How does bidding work?",
    answer: "Browse live auctions and place a bid higher than the current bid. Your bid is registered instantly. When the auction timer ends, the highest bidder wins and can proceed to checkout.",
  },
  {
    icon: CreditCard,
    question: "How do I pay for a winning item?",
    answer: "After winning an auction, you'll be directed to checkout where you can pay securely. Payment options are displayed on the checkout page.",
  },
  {
    icon: Truck,
    question: "How are items shipped?",
    answer: "Shipping details are agreed between the buyer and seller after payment. Estimated delivery times and costs are shown on the item listing where available. See our Shipping Info page for full details.",
  },
  {
    icon: ShieldCheck,
    question: "Is bidding on AuctionPro secure?",
    answer: "Yes. All accounts are password-protected, bids are recorded securely, and payments are processed through trusted payment methods. We recommend enabling two-factor awareness and never sharing your credentials.",
  },
  {
    icon: HelpCircle,
    question: "What if I have a problem with an order?",
    answer: "Contact our support team through the Contact page and we will respond within 24 hours. Include your auction ID and item details to help us resolve your issue quickly.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow eyebrow-dark mb-5">
            <Sparkles size={14} className="text-yellow-400" /> FAQ
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
            Everything you need to know about bidding, selling, and winning on AuctionPro.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map(({ icon: Icon, question, answer }) => (
              <div key={question} className="card p-6 lg:p-7 flex items-start gap-5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-gray-900">{question}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-extrabold text-gray-900">Still have questions?</h3>
            <p className="text-gray-500 mt-2 text-sm">Our support team is available 24/7 to help you.</p>
            <a href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Contact Support <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
