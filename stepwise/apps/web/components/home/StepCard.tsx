/**
 * components/home/StepCard.tsx
 * "How It Works" step card — step number, icon, title, description, terminal snippet.
 */

import React from "react";

interface StepCardProps {
  step: string;
  icon: string;
  title: string;
  description: string;
  terminalLines: Array<{
    type: "prompt" | "cmd" | "output" | "success" | "comment";
    text: string;
  }>;
  isLast?: boolean;
}

export function StepCard({
  step,
  icon,
  title,
  description,
  terminalLines,
  isLast = false,
}: StepCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "relative",
      }}
    >
      {/* Connector line between steps */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "24px",
            left: "calc(50% + 24px)",
            right: "-50%",
            height: "1px",
            background:
              "linear-gradient(90deg, var(--color-border-glass), transparent)",
            display: "none", // shown via CSS on md+ breakpoints via parent grid
          }}
        />
      )}

      <div
        className="glass card-hover"
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          height: "100%",
        }}
      >
        {/* Step header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-indigo-muted)",
              border: "1px solid var(--color-border-glass)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-indigo)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Step {step}
            </div>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-text)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted)",
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>

        {/* Terminal */}
        <div className="terminal" style={{ marginTop: "auto" }}>
          <div className="terminal-header">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
          {terminalLines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "6px" }}>
              {line.type === "prompt" ? (
                <>
                  <span className="prompt">$</span>
                  <span className="cmd">{line.text}</span>
                </>
              ) : (
                <span className={line.type}>{line.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
