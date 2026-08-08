"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <div className="auth-error">
          <AlertCircle size={16} />
          No reset token provided. Please request a new reset link.
        </div>
        <p className="auth-footer-text">
          <Link href="/forgot-password" className="inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            Back to Forgot Password
          </Link>
        </p>
      </>
    );
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
              <p>Password reset successful!</p>
              <Link
                href="/login"
                className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Go to Sign In →
              </Link>
            </div>
          </div>
        )}

        {!success && (
          <>
            <div className="auth-input-group">
              <label htmlFor="new-password">New Password</label>
              <div className="auth-input-box">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span
                  className="auth-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="auth-input-box">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span className="auth-input-icon">
                  <Eye size={16} />
                </span>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Reset Password"}
            </button>
          </>
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
