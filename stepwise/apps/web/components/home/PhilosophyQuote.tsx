/**
 * components/home/PhilosophyQuote.tsx
 * Full-width pull-quote block with large decorative quotation mark.
 */

import React from "react";

interface PhilosophyQuoteProps {
  quote: string;
  attribution: string;
}

export function PhilosophyQuote({ quote, attribution }: PhilosophyQuoteProps) {
  return (
    <div
      style={{
        position: "relative",
        padding: "56px 48px",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border-glass)",
        background: "var(--color-surface-glass)",
        backdropFilter: "blur(24px)",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Gradient bloom behind */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-cta)",
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />

      {/* Decorative grid lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, var(--color-border-glass) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Large quote mark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -10,
          left: 32,
          fontSize: 160,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
          color: "var(--color-indigo-muted)",
          userSelect: "none",
          opacity: 0.6,
        }}
      >
        "
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <blockquote
          style={{
            fontSize: "clamp(20px, 3vw, 30px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.35,
            color: "var(--color-text)",
            maxWidth: 760,
            margin: "0 auto 24px",
          }}
        >
          {quote}
        </blockquote>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 2,
              background: "var(--gradient-indigo)",
              borderRadius: "var(--radius-full)",
            }}
          />
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-muted)",
              fontWeight: 500,
            }}
          >
            {attribution}
          </span>
          <div
            style={{
              width: 32,
              height: 2,
              background: "var(--gradient-indigo)",
              borderRadius: "var(--radius-full)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
