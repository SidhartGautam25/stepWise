"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface BucketConfig {
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  border: string;
}

export interface InteractiveBucketsProps {
  items: string[];
  source: BucketConfig;
  destination: BucketConfig;
  hint?: string;
  /** Tip shown when items are in the destination bucket */
  destinationTip?: string;
}

/**
 * InteractiveBuckets — move labelled items between two buckets by clicking.
 * Click an item in the source to send it to the destination.
 * Click it in the destination to return it.
 *
 * Usage:
 * ```tsx
 * <InteractiveBuckets
 *   hint="Click books to move them between shelf and desk"
 *   items={["📖 Photo Album", "📝 School Notes"]}
 *   source={{ label: "Bookshelf = Storage", icon: "📚", color: "...", border: "..." }}
 *   destination={{ label: "Desk = Workspace", icon: "🖥️", color: "...", border: "..." }}
 *   destinationTip="Books on the desk would disappear if the power went out."
 * />
 * ```
 */
export function InteractiveBuckets({
  items,
  source,
  destination,
  hint,
  destinationTip,
}: InteractiveBucketsProps) {
  const [inDest, setInDest] = useState<string[]>([]);

  const moveTo = (item: string) =>
    setInDest((d) => (d.includes(item) ? d : [...d, item]));
  const moveFrom = (item: string) =>
    setInDest((d) => d.filter((b) => b !== item));

  const inSource = items.filter((b) => !inDest.includes(b));

  return (
    <IllustrationShell hint={hint} gap={10}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Source bucket */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: `2px solid ${source.border}`,
            background: source.color,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: source.border,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {source.icon} {source.label}
          </div>
          {source.sublabel && (
            <div style={{ fontSize: 10, color: T.muted }}>{source.sublabel}</div>
          )}
          {inSource.map((item) => (
            <div
              key={item}
              onClick={() => moveTo(item)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: source.color,
                border: `1px solid ${source.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{item}</span>
              <span style={{ fontSize: 10, color: T.muted }}>use →</span>
            </div>
          ))}
          {inSource.length === 0 && (
            <div
              style={{
                fontSize: 11,
                color: T.muted,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Empty…
            </div>
          )}
        </div>

        {/* Destination bucket */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: `${inDest.length ? 2 : 1}px solid ${inDest.length ? destination.border : T.slateAlpha(0.25)}`,
            background: inDest.length ? destination.color : T.slateAlpha(0.04),
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "all 0.3s",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: inDest.length ? destination.border : T.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {destination.icon} {destination.label}
          </div>
          {destination.sublabel && (
            <div style={{ fontSize: 10, color: T.muted }}>{destination.sublabel}</div>
          )}
          {inDest.map((item) => (
            <div
              key={item}
              onClick={() => moveFrom(item)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: destination.color,
                border: `1px solid ${destination.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                cursor: "pointer",
                transition: "all 0.2s",
                animation: "ie-pop-in 0.25s ease",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{item}</span>
              <span style={{ fontSize: 10, color: T.muted }}>← back</span>
            </div>
          ))}
          {inDest.length === 0 && (
            <div
              style={{
                fontSize: 11,
                color: T.muted,
                textAlign: "center",
                padding: "10px 0",
                fontStyle: "italic",
              }}
            >
              Empty — grab an item!
            </div>
          )}
        </div>
      </div>

      {destinationTip && inDest.length > 0 && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            background: T.amberAlpha(0.08),
            border: `1px solid ${T.amberAlpha(0.25)}`,
            fontSize: 11,
            color: T.body,
            textAlign: "center",
          }}
        >
          💡 {destinationTip}
        </div>
      )}
    </IllustrationShell>
  );
}
