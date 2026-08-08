"use client";

import { useState } from "react";
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResetToken("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Something went wrong");
      }

      setSuccess(true);
      if (json.data?.resetToken) {
        setResetToken(json.data.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle size={16} />
            <div>
              <p>If an account exists with <strong>{email}</strong>, a reset link has been sent.</p>
              {resetToken && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1.5">Demo mode — copy this token to reset your password:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={resetToken}
                      className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(resetToken)}
                      className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Reset Password Now →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {!success && (
          <div className="auth-input-group">
            <label htmlFor="forgot-email">Email Address</label>
            <div className="auth-input-box">
              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="auth-input-icon">
                <Mail size={16} />
              </span>
            </div>
          </div>
        )}

        {!success && (
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Send Reset Link"}
          </button>
        )}
      </form>

      <p className="auth-footer-text">
        <Link href="/login" className="inline-flex items-center gap-1">
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
