"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface ClickRevealItem {
  id: string;
  icon: string;
  label: string;
  /** The detail text revealed when clicked */
  detail: string;
  /** Optional override for the "revealed" header label */
  detailLabel?: string;
}

export interface ClickRevealGridProps {
  items: ClickRevealItem[];
  hint?: string;
  /** Grid columns, defaults to 2 */
  columns?: number;
  /** Global label shown above the detail, defaults to "Detail →" */
  detailLabel?: string;
  accentColor?: string;
  accentBorder?: string;
}

/**
 * ClickRevealGrid — a grid of cards. Clicking a card reveals a detail panel inside it.
 * Great for "tap something you know — see what happens underneath" interactions.
 *
 * Usage:
 * ```tsx
 * <ClickRevealGrid
 *   hint="Tap something you do every day"
 *   items={WELCOME_EVERYDAY_ACTIVITIES}
 *   detailLabel="What the OS did →"
 *   columns={2}
 * />
 * ```
 */
export function ClickRevealGrid({
  items,
  hint,
  columns = 2,
  detailLabel = "Detail →",
  accentColor,
  accentBorder,
}: ClickRevealGridProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const ac = accentColor ?? T.emeraldAlpha(0.07);
  const ab = accentBorder ?? T.emeraldAlpha(0.5);

  return (
    <IllustrationShell hint={hint} gap={9}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 9,
        }}
      >
        {items.map(({ id, icon, label, detail, detailLabel: itemLabel }) => {
          const isActive = selected === id;
          return (
            <div
              key={id}
              onClick={() => setSelected(isActive ? null : id)}
              style={{
                cursor: "pointer",
                padding: 12,
                borderRadius: 11,
                border: isActive ? `2px solid ${ab}` : `1px solid ${T.cardBorder}`,
                background: isActive ? ac : T.cardBg,
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 26, textAlign: "center" }}>{icon}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.text,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {label}
              </div>
              {isActive && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: T.emeraldAlpha(0.1),
                    border: `1px solid ${T.emeraldAlpha(0.2)}`,
                    fontSize: 11,
                    color: T.text,
                    lineHeight: 1.5,
                    animation: "ie-slide-in 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: T.emerald,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {itemLabel ?? detailLabel}
                  </div>
                  {detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </IllustrationShell>
  );
}
