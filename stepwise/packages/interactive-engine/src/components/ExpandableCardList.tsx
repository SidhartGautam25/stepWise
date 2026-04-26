"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface ExpandableCardItem {
  id: string;
  icon: string;
  label: string;
  reveal: string;
}

export interface ExpandableCardListProps {
  items: ExpandableCardItem[];
  hint?: string;
  /** Allow multiple cards open simultaneously, default false */
  multiOpen?: boolean;
}

/**
 * ExpandableCardList — accordion-style cards that expand on click to reveal detail.
 *
 * Usage:
 * ```tsx
 * <ExpandableCardList
 *   hint="Tap a card to learn more"
 *   items={WELCOME_HELLO_ITEMS}
 * />
 * ```
 */
export function ExpandableCardList({ items, hint, multiOpen = false }: ExpandableCardListProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiOpen) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <IllustrationShell hint={hint} gap={10}>
      {items.map(({ id, icon, label, reveal }) => {
        const isOpen = open.has(id);
        return (
          <div
            key={id}
            onClick={() => toggle(id)}
            style={{
              cursor: "pointer",
              padding: "14px 16px",
              borderRadius: 12,
              border: isOpen
                ? `2px solid ${T.emeraldAlpha(0.5)}`
                : `1px solid ${T.cardBorder}`,
              background: isOpen ? T.emeraldAlpha(0.08) : T.cardBg,
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 26,
                  animation: isOpen ? "ie-float 2s ease infinite" : "none",
                }}
              >
                {icon}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: T.muted }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div
                style={{
                  fontSize: 13,
                  color: T.body,
                  lineHeight: 1.65,
                  paddingLeft: 4,
                  animation: "ie-slide-in 0.2s ease",
                }}
              >
                {reveal}
              </div>
            )}
          </div>
        );
      })}
    </IllustrationShell>
  );
}
