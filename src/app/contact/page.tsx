"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Reveal from "@/components/common/Reveal";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send message");
      setStatus({ type: "success", text: "Message sent successfully! We will get back to you soon." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus({ type: "error", text: err instanceof Error ? err.message : "Failed to send message" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <section className="bg-linear-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal variant="scale" className="mb-5">
            <span className="eyebrow eyebrow-dark">
              <MessageSquare size={14} className="text-yellow-400" /> Get in Touch
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Contact Us</h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-white/60 mt-4 text-lg max-w-2xl mx-auto">
              Have questions? We would love to hear from you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Mail, title: "Email", text: "support@auctionpro.com", color: "from-indigo-500 to-purple-500" },
              { icon: Phone, title: "Phone", text: "+ 885 099 5555 778", color: "from-cyan-500 to-blue-500" },
              { icon: MapPin, title: "Location", text: "Cambodia", color: "from-amber-500 to-yellow-500" },
            ].map((item, i) => (
              <Reveal key={item.title} variant="scale" delay={i * 150}>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center card-premium">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-linear-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 card-premium">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
            {status && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-5 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {status.text}
              </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                  placeholder="Your message..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-linear-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Send Message
              </button>
            </form>
          </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
