"use client";

import type { CSSProperties, ReactNode } from "react";
import { T } from "../tokens";

export type InfoCalloutVariant = "info" | "success" | "warning" | "error" | "neutral";

const VARIANT_STYLES: Record<InfoCalloutVariant, { bg: string; border: string; color: string }> = {
  info:    { bg: T.indigoAlpha(0.08),  border: T.indigoAlpha(0.25),  color: T.indigo },
  success: { bg: T.emeraldAlpha(0.08), border: T.emeraldAlpha(0.25), color: T.emerald },
  warning: { bg: T.amberAlpha(0.1),    border: T.amberAlpha(0.28),   color: "rgba(202,138,4,0.9)" },
  error:   { bg: T.redAlpha(0.08),     border: T.redAlpha(0.25),    color: T.redAlpha(0.85) },
  neutral: { bg: T.slateAlpha(0.08),   border: T.slateAlpha(0.2),    color: T.muted },
};

export interface InfoCalloutProps {
  text: string | ReactNode;
  icon?: string;
  variant?: InfoCalloutVariant;
  style?: CSSProperties;
}

/**
 * InfoCallout — a themed highlighted information banner.
 * Use inside or outside IllustrationShell for tips, warnings, and conclusions.
 *
 * Usage:
 * ```tsx
 * <InfoCallout variant="success" icon="🎉" text="That's exactly how Linux works!" />
 * <InfoCallout variant="warning" text="Don't run this as root!" />
 * ```
 */
export function InfoCallout({ text, icon, variant = "info", style }: InfoCalloutProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: 12,
        fontWeight: 600,
        color: T.body,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        lineHeight: 1.55,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>}
      <span>{text}</span>
    </div>
  );
}
