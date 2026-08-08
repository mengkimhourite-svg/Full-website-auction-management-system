"use client";

import { useState } from "react";
import { Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") router.push("/admin");
      else if (role === "SELLER") router.push("/seller/auctions");
      else router.push("/");
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError?.response?.data?.error || "Invalid email or password");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {(error || authError) && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error || authError}
          </div>
        )}

        <div className="auth-input-group">
          <label htmlFor="login-email">Email Address</label>
          <div className="auth-input-box">
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="auth-input-icon">
              <Mail size={16} />
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-box">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <div className="auth-options">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Sign In"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <Link href="/register">Create one</Link>
      </p>
    </>
  );
}
