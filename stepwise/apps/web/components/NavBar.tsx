"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function logout() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "var(--color-surface-glass)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--color-border)",
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
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
          Step<span style={{ color: "var(--color-indigo)" }}>Wise</span>
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
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-ghost"
            style={{ padding: "6px 10px", fontSize: 14 }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        {session ? (
          <>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{session.user?.email}</span>
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
