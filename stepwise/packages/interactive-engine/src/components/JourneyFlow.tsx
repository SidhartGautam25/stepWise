"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface JourneyStep {
  icon: string;
  action: string;
  result: string;
  color: string;
  border: string;
}

export interface JourneyFlowProps {
  steps: JourneyStep[];
  hint?: string;
  /** Icon rendered in the right margin as a "permanent store" indicator */
  storeIcon?: string;
  storeLabel?: string;
  startLabel?: string;
  nextLabel?: string;
  replayLabel?: string;
}

/**
 * JourneyFlow — a sequential step-through flow with animated progression.
 * Each step has an action + a result that appears when the step is reached.
 * An optional "store" icon is shown on the side (e.g. a hard drive for storage demos).
 *
 * Usage:
 * ```tsx
 * <JourneyFlow
 *   hint="Walk through what actually happens"
 *   steps={STORAGE_JOURNEY_STEPS}
 *   storeIcon="💾"
 *   storeLabel="Storage"
 * />
 * ```
 */
export function JourneyFlow({
  steps,
  hint,
  storeIcon,
  storeLabel,
  startLabel = "▶ Start",
  nextLabel = "→ Next",
  replayLabel = "↺ Replay",
}: JourneyFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const isDone = stepIndex >= steps.length;

  return (
    <IllustrationShell hint={hint} gap={10}>
      <div style={{ position: "relative" }}>
        {storeIcon && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 52,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 26 }}>{storeIcon}</div>
            {storeLabel && (
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.muted,
                  textAlign: "center",
                }}
              >
                {storeLabel}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            paddingRight: storeIcon ? 60 : 0,
            display: "flex",
            flexDirection: "column",
            gap: 7,
            marginBottom: 10,
          }}
        >
          {steps.map(({ icon, action, result, color, border }, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div
                key={action}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: done || current ? color : T.cardBg,
                  border: `${current ? 2 : 1}px solid ${done || current ? border : T.cardBorder}`,
                  transition: "all 0.3s",
                  opacity: i > stepIndex ? 0.4 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 22,
                      animation: current ? "ie-float 1.5s ease infinite" : "none",
                    }}
                  >
                    {icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                      {action}
                    </div>
                    {(done || current) && (
                      <div
                        style={{
                          fontSize: 11,
                          color: T.body,
                          marginTop: 2,
                          animation: "ie-slide-in 0.3s ease",
                        }}
                      >
                        {result}
                      </div>
                    )}
                  </div>
                  {done && <span style={{ fontSize: 16 }}>✅</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setStepIndex((s) => (isDone ? 0 : s + 1))}
        style={{
          padding: "9px 16px",
          borderRadius: 9,
          border: "none",
          background: isDone ? T.slateAlpha(0.12) : T.emeraldAlpha(0.14),
          color: isDone ? T.muted : T.emerald,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          transition: "all 0.2s",
        }}
      >
        {isDone ? replayLabel : stepIndex === 0 ? startLabel : nextLabel}
      </button>
    </IllustrationShell>
  );
}
