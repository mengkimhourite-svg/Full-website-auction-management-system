"use client";

import { useState } from "react";
import { User, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleRegister}>
        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="auth-input-group">
          <label>Full Name</label>
          <div className="auth-input-box">
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <span className="auth-input-icon">
              <User size={18} />
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label>Email Address</label>
          <div className="auth-input-box">
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="auth-input-icon">
              <Mail size={18} />
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label>Password</label>
          <div className="auth-input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="auth-input-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Create Account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link href="/login">Login</Link>
      </p>
    </>
  );
}
