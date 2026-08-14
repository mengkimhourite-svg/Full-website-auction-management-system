"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Store,
  Tag,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type SelectedRole = "SELLER" | "BIDDER" | "";

const ROLE_OPTIONS = [
  {
    value: "SELLER",
    label: "Seller",
    description: "Create auctions and sell your products.",
    Icon: Store,
  },
  {
    value: "BIDDER",
    label: "Bidder",
    description: "Browse auctions and place bids.",
    Icon: Tag,
  },
] as const;

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SelectedRole>("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return "Full name is required";
    if (!email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!role) return "Please select an account role";
    if (!terms) return "Please accept the Terms & Conditions";
    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      if (data.data) {
        setUser(data.data);
        const registeredRole = (data.data.role || "").toUpperCase();
        if (registeredRole === "SELLER") {
          router.push("/seller/auctions");
        } else {
          router.push("/bidder");
        }
      } else {
        router.push("/login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleRegister} noValidate>
        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="auth-input-group">
          <label htmlFor="reg-name">Full Name</label>
          <div className="auth-input-box">
            <input
              id="reg-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <span className="auth-input-icon">
              <User size={16} />
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label htmlFor="reg-email">Email Address</label>
          <div className="auth-input-box">
            <input
              id="reg-email"
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
          <label htmlFor="reg-password">Password</label>
          <div className="auth-input-box">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password (min. 6 characters)"
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
              onKeyDown={(e) => e.key === "Enter" && setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <div className="auth-input-box">
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <span
              className="auth-input-icon"
              onClick={() => setShowConfirm(!showConfirm)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
          </div>
        </div>

        <div className="auth-input-group">
          <label>Account Role</label>
          <div className="auth-role-grid">
            {ROLE_OPTIONS.map(({ value, label, description, Icon }) => {
              const selected = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={selected}
                  className={`auth-role-card${selected ? " auth-role-card-active" : ""}`}
                >
                  <span className="auth-role-icon">
                    <Icon size={20} />
                  </span>
                  <span className="auth-role-label">{label}</span>
                  <span className="auth-role-desc">{description}</span>
                  <span className="auth-role-select">
                    {selected ? (
                      <>
                        <Check size={14} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="auth-options">
          <label className="auth-terms">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms">Terms &amp; Conditions</Link>
            </span>
          </label>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Create Account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}