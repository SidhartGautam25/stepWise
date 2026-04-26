"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface SimActor {
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  border: string;
  /** If true, this actor glows while the simulation is running */
  isManager?: boolean;
}

export interface SimStep {
  from: string;
  to: string;
  action: string;
}

export interface StepSimulatorProps {
  actors: SimActor[];
  steps: SimStep[];
  hint?: string;
  startLabel?: string;
  nextLabel?: string;
  doneMessage?: string;
  replayLabel?: string;
}

/**
 * StepSimulator — an N-actor, N-step animated simulation.
 * The user clicks through steps, watching messages flow between actors.
 * Great for illustrating request/response flows (OS, restaurant, etc.)
 *
 * Usage:
 * ```tsx
 * <StepSimulator
 *   hint="Simulate a restaurant — click Send Order"
 *   actors={WELCOME_MANAGER_ACTORS}
 *   steps={WELCOME_MANAGER_STEPS}
 *   startLabel="▶ Send Order"
 *   doneMessage="✅ Order complete! The OS kept everything smooth."
 * />
 * ```
 */
export function StepSimulator({
  actors,
  steps,
  hint,
  startLabel = "▶ Start",
  nextLabel = "→ Next",
  doneMessage = "✅ Complete!",
  replayLabel = "↺ Try again",
}: StepSimulatorProps) {
  const [step, setStep] = useState(0);
  const isRunning = step > 0 && step <= steps.length;
  const isDone = step > steps.length;

  return (
    <IllustrationShell hint={hint} gap={10}>
      {/* Actors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${actors.length}, 1fr)`,
          gap: 8,
          marginBottom: 4,
        }}
      >
        {actors.map(({ icon, label, sublabel, color, border, isManager }) => {
          const glowing = isManager && isRunning;
          return (
            <div
              key={label}
              style={{
                padding: 12,
                borderRadius: 10,
                background: color,
                border: `${glowing ? 2 : 1}px solid ${border}`,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                transition: "all 0.3s",
                boxShadow: glowing ? `0 0 14px ${border}` : "none",
              }}
            >
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{label}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Message log */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
        {steps.slice(0, step > steps.length ? steps.length : step).map((s, i) => (
          <div
            key={i}
            style={{
              padding: "8px 12px",
              borderRadius: 9,
              background: T.emeraldAlpha(0.07),
              border: `1px solid ${T.emeraldAlpha(0.2)}`,
              fontSize: 12,
              color: T.text,
              animation: "ie-flow-right 0.35s ease",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700 }}>{s.from}</span>
            <span style={{ color: T.muted }}>→</span>
            <span style={{ fontWeight: 700 }}>{s.to}</span>
            <span style={{ color: T.muted, fontSize: 11 }}>{s.action}</span>
          </div>
        ))}
        {isDone && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 9,
              background: T.emeraldAlpha(0.15),
              border: `2px solid ${T.emeraldAlpha(0.4)}`,
              fontSize: 12,
              fontWeight: 700,
              color: T.emerald,
              textAlign: "center",
              animation: "ie-bounce-in 0.4s ease",
            }}
          >
            {doneMessage}
          </div>
        )}
      </div>

      {/* Control button */}
      <button
        onClick={() => setStep((s) => (s > steps.length ? 0 : s + 1))}
        style={{
          padding: "9px 16px",
          borderRadius: 9,
          border: "none",
          background: isDone
            ? T.slateAlpha(0.12)
            : T.emeraldAlpha(0.14),
          color: isDone ? T.muted : T.emerald,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          transition: "all 0.2s",
        }}
      >
        {isDone ? replayLabel : step === 0 ? startLabel : nextLabel}
      </button>
    </IllustrationShell>
  );
}
