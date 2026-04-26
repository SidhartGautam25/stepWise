"use client";

import { useState, type ReactNode } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface CompareSide {
  icon: string;
  title: string;
  subtitle?: string;
  /** A list of bullet strings OR a ReactNode for complex content */
  revealContent?: string[] | ReactNode;
  closedHint?: string;
  /** CSS color string for the background tint */
  color: string;
  /** CSS color string for the border */
  border: string;
  /** If true, renders as "locked/closed" state that generates a denial message */
  locked?: boolean;
  lockedMessage?: string;
}

export interface ComparePanelProps {
  left: CompareSide;
  right: CompareSide;
  hint?: string;
  /** Message shown below the panel after right side is revealed */
  successMessage?: string;
}

/**
 * ComparePanel — two clickable side-by-side cards for "open vs closed" comparisons.
 * Each side reveals content on click. Locked sides show a denial message.
 *
 * Usage:
 * ```tsx
 * <ComparePanel
 *   hint="Click each box to explore"
 *   left={{ icon: "🔒", title: "Windows / Mac", locked: true, color: "...", border: "..." }}
 *   right={{ icon: "📦", title: "Linux", revealContent: [...], color: "...", border: "..." }}
 *   successMessage="🎉 That's why we're using Linux!"
 * />
 * ```
 */
export function ComparePanel({ left, right, hint, successMessage }: ComparePanelProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const renderSide = (side: CompareSide, isOpen: boolean, onOpen: () => void) => {
    const bulletArray: string[] | null = Array.isArray(side.revealContent)
      ? (side.revealContent as string[])
      : null;
    const node = !bulletArray && side.revealContent;

    return (
      <div
        onClick={onOpen}
        style={{
          cursor: "pointer",
          padding: 16,
          borderRadius: 12,
          border: isOpen ? `2px solid ${side.border}` : `1px solid ${side.border}`,
          background: isOpen ? side.color : side.color.replace(/[\d.]+\)$/, "0.04)"),
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transition: "all 0.3s",
          boxShadow: isOpen && !side.locked ? `0 0 14px ${side.border}` : "none",
        }}
      >
        <div
          style={{
            fontSize: 36,
            textAlign: "center",
            transition: "all 0.4s",
            transform: isOpen && !side.locked ? "rotate(12deg)" : "none",
          }}
        >
          {side.icon}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, textAlign: "center" }}>
          {side.title}
        </div>

        {!isOpen && (
          <div style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
            {side.closedHint ?? "Click to explore →"}
          </div>
        )}

        {isOpen && side.locked && (
          <div
            style={{
              fontSize: 12,
              color: T.redAlpha(0.85),
              textAlign: "center",
              animation: "ie-pop-in 0.3s ease",
              fontWeight: 600,
              padding: "8px",
              background: T.redAlpha(0.08),
              borderRadius: 8,
            }}
          >
            {side.lockedMessage ?? "🚫 Access denied."}
          </div>
        )}

        {isOpen && !side.locked && bulletArray && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, animation: "ie-slide-in 0.3s ease" }}>
            {bulletArray.map((item: string) => (
              <div
                key={item}
                style={{
                  fontSize: 11,
                  padding: "5px 8px",
                  borderRadius: 6,
                  background: `${side.color}`,
                  color: T.text,
                  fontWeight: 600,
                  border: `1px solid ${side.border}`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {isOpen && !side.locked && node && (
          <div style={{ animation: "ie-slide-in 0.3s ease" }}>{node}</div>
        )}
      </div>
    );
  };

  const showSuccess = successMessage && rightOpen && !right.locked;

  return (
    <IllustrationShell hint={hint} gap={12}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {renderSide(left, leftOpen, () => setLeftOpen(true))}
        {renderSide(right, rightOpen, () => setRightOpen(true))}
      </div>
      {showSuccess && (
        <div
          style={{
            padding: "9px 12px",
            borderRadius: 9,
            background: T.emeraldAlpha(0.1),
            border: `1px solid ${T.emeraldAlpha(0.3)}`,
            fontSize: 12,
            fontWeight: 600,
            color: T.emerald,
            textAlign: "center",
            animation: "ie-pop-in 0.3s ease",
          }}
        >
          {successMessage}
        </div>
      )}
    </IllustrationShell>
  );
}
