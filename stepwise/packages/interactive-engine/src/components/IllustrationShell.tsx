"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEngineStyles } from "../useEngineStyles";
import { T } from "../tokens";

export interface IllustrationShellProps {
  hint?: string;
  children: ReactNode;
  /** Extra gap between children, defaults to 10 */
  gap?: number;
  style?: CSSProperties;
}

/**
 * IllustrationShell — the outer card wrapper for every slide illustration.
 * - Injects animation keyframes once on mount
 * - Shows an optional HINT label above children
 * - All engine components should be nested inside this
 */
export function IllustrationShell({ hint, children, gap = 10, style }: IllustrationShellProps) {
  useEngineStyles();
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        gap,
        ...style,
      }}
    >
      {hint && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: T.kicker,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}
