"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, clearSession, type AuthSession } from "@/lib/auth";

export default function NavBar() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  function logout() {
    clearSession();
    setSession(null);
    window.location.href = "/";
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(8, 8, 15, 0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "60px",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, #6c63ff, #10b981)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900, color: "white",
        }}>S</div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#e8e8f0", letterSpacing: "-0.02em" }}>
          Step<span style={{ color: "#6c63ff" }}>Wise</span>
        </span>
      </Link>

      {/* Center links */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { href: "/challenges", label: "Challenges" },
          ...(session ? [{ href: "/dashboard", label: "Dashboard" }] : []),
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            color: "#888898", textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#e8e8f0"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#888898"; }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {session ? (
          <>
            <span style={{ fontSize: 13, color: "#666680" }}>{session.email}</span>
            <button onClick={logout} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ padding: "7px 18px", fontSize: 13 }}>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
