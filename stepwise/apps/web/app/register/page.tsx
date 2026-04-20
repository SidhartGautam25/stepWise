"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !username) {
      setError("Please fill out all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Register with Fastify
      await registerUser(email, password, username);

      // 2. Automatically log in after registration
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 24px",
    }}>
      {/* Glow */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="glass" style={{
        width: "100%", maxWidth: 420, padding: "48px 40px",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #10b981, #6c63ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "white",
            margin: "0 auto 16px",
          }}>S</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#e8e8f0" }}>
            Create an account
          </h1>
          <p style={{ fontSize: 14, color: "#666680", marginTop: 8 }}>
            Join StepWise and start building today.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888898", marginBottom: 8 }}>
            Username
          </label>
          <input
            className="input"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 20 }}
            autoFocus
            required
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888898", marginBottom: 8 }}>
            Email address
          </label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 20 }}
            required
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888898", marginBottom: 8 }}>
            Password
          </label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 24, padding: "13px", fontSize: 15 }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up →"}
          </button>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#888898" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#34d399", textDecoration: "none", fontWeight: 600 }}>
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
