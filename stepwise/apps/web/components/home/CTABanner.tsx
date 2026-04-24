/**
 * components/home/CTABanner.tsx
 * End-of-page call-to-action banner with gradient background.
 */

import React from "react";
import Link from "next/link";

interface CTABannerProps {
  isLoggedIn: boolean;
}

export function CTABanner({ isLoggedIn }: CTABannerProps) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--radius-xl)",
        padding: "64px 40px",
        textAlign: "center",
        overflow: "hidden",
        border: "1px solid var(--color-border-glass)",
      }}
    >
      {/* Gradient background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-cta)",
          borderRadius: "inherit",
        }}
      />

      {/* Glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "20%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "var(--color-indigo-muted)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          right: "0%",
          transform: "translate(-10%, -50%)",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "var(--color-emerald-muted)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="section-eyebrow" style={{ margin: "0 auto 20px", width: "fit-content" }}>
          ✦ Zero setup · Start in 60 seconds
        </div>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            color: "var(--color-text)",
            marginBottom: 16,
          }}
        >
          Your path starts{" "}
          <span className="gradient-text">right here.</span>
        </h2>

        <p
          style={{
            fontSize: "var(--text-md)",
            color: "var(--color-muted)",
            maxWidth: 500,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          Install the CLI, pick a quest, and discover what hands-on guided exploration really feels like.
        </p>

        {/* Terminal hint */}
        <div
          className="terminal"
          style={{
            display: "inline-block",
            textAlign: "left",
            marginBottom: 32,
            minWidth: 300,
            maxWidth: 480,
          }}
        >
          <div className="terminal-header">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span className="prompt">$</span>
            <span className="cmd">npx stepwise@latest init</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span className="success">✓ Workspace ready. Pick a quest below:</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span className="output">  → javascript-fundamentals (12 steps)</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span className="output">  → typescript-mastery (10 steps)</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/challenges"
            className="btn btn-primary"
            style={{ fontSize: "var(--text-base)", padding: "13px 32px" }}
          >
            {isLoggedIn ? "Continue Exploring →" : "Browse All Quests →"}
          </Link>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="btn btn-ghost"
              style={{ fontSize: "var(--text-base)", padding: "13px 28px" }}
            >
              Create Free Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
