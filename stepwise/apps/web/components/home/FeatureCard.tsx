/**
 * components/home/FeatureCard.tsx
 * Used in the "Our Approach" section — icon, title, body, optional accent color.
 */

import React from "react";

type AccentColor = "indigo" | "emerald" | "amber" | "rose" | "cyan";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  accent?: AccentColor;
  highlight?: string; // optional bottom highlight line
}

const accentStyles: Record<AccentColor, React.CSSProperties> = {
  indigo:  { background: "var(--color-indigo-muted)",  border: "1px solid var(--color-border-glass)", color: "var(--color-indigo)"  },
  emerald: { background: "var(--color-emerald-muted)", border: "1px solid var(--color-emerald-muted)", color: "var(--color-emerald)" },
  amber:   { background: "var(--color-amber-muted)",   border: "1px solid var(--color-amber-muted)",   color: "var(--color-amber)"   },
  rose:    { background: "var(--color-rose-muted)",    border: "1px solid var(--color-rose-muted)",    color: "var(--color-rose)"    },
  cyan:    { background: "var(--color-cyan-muted)",    border: "1px solid var(--color-cyan-muted)",    color: "var(--color-cyan)"    },
};

export function FeatureCard({
  icon,
  title,
  description,
  accent = "indigo",
  highlight,
}: FeatureCardProps) {
  return (
    <div
      className="glass card-hover"
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "var(--color-surface-glass)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-card)",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        className="feature-icon-wrap"
        style={accentStyles[accent]}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "8px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted)",
            lineHeight: 1.72,
          }}
        >
          {description}
        </p>
      </div>

      {/* Optional highlight line */}
      {highlight && (
        <div
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: `var(--color-${accent})`,
            paddingTop: "4px",
            borderTop: "1px solid var(--color-border)",
            marginTop: "auto",
          }}
        >
          {highlight}
        </div>
      )}
    </div>
  );
}
