"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp } from "@/lib/api";
import { saveSession } from "@/lib/auth";

type Stage = "email" | "otp" | "done";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await requestOtp(email);
      if (res.devCode) setDevCode(res.devCode);
      setStage("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Please enter your 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyOtp(email, code);
      saveSession(res.token, res.userId, res.email, res.username);
      setStage("done");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
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
        background: "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)",
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
            background: "linear-gradient(135deg, #6c63ff, #10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "white",
            margin: "0 auto 16px",
          }}>S</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "#e8e8f0" }}>
            {stage === "done" ? "Welcome back! 🎉" : "Sign in to StepWise"}
          </h1>
          {stage === "email" && (
            <p style={{ fontSize: 14, color: "#666680", marginTop: 8 }}>
              We&apos;ll send you a 6-digit code
            </p>
          )}
        </div>

        {stage === "done" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <p style={{ color: "#10b981", fontSize: 16 }}>Signed in as {email}</p>
            <p style={{ color: "#666680", fontSize: 14, marginTop: 8 }}>Redirecting to dashboard…</p>
          </div>
        ) : stage === "email" ? (
          <form onSubmit={handleEmailSubmit}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888898", marginBottom: 8 }}>
              Email address
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />

            {error && (
              <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 20, padding: "13px", fontSize: 15 }}
              disabled={loading}
            >
              {loading ? "Sending code…" : "Continue →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <p style={{ fontSize: 14, color: "#666680", marginBottom: 24 }}>
              Code sent to <span style={{ color: "#e8e8f0" }}>{email}</span>
              {devCode && (
                <span style={{ display: "block", marginTop: 8, color: "#f59e0b", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  [DEV] Your code: <strong>{devCode}</strong>
                </span>
              )}
            </p>

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888898", marginBottom: 8 }}>
              6-digit code
            </label>
            <input
              className="input"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              style={{ letterSpacing: "0.3em", fontSize: 20, textAlign: "center", fontFamily: "var(--font-mono)" }}
            />

            {error && (
              <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 20, padding: "13px", fontSize: 15 }}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setStage("email"); setError(null); setCode(""); }}
              style={{ background: "none", border: "none", color: "#666680", cursor: "pointer", fontSize: 13, marginTop: 16, display: "block", width: "100%", textAlign: "center" }}
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
