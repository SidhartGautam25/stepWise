"use client";

import type { ChallengeDetail } from "@/lib/api";
import { CodeSection } from "../CodeSection";
import { MarkdownViewer } from "../MarkdownViewer";

interface StepContentPanelProps {
  step: ChallengeDetail["steps"][number] | undefined;
  stepIndex: number;
  onOpenVisualizer: () => void;
  onOpenSplitTerminal: () => void;
}

export function StepContentPanel({
  step,
  stepIndex,
  onOpenVisualizer,
  onOpenSplitTerminal,
}: StepContentPanelProps) {
  const hasSolution = Boolean(
    (step?.codeFiles && step.codeFiles.length > 0) || step?.solution,
  );

  return (
    <div style={{ padding: "24px 28px", paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "var(--color-indigo)" }}>{stepIndex + 1}.</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>{step?.title}</h2>
      </div>

      {step?.prompt && (
        <div style={{ marginBottom: 32, fontSize: 14, color: "var(--color-text)", lineHeight: 1.75 }}>
          <MarkdownViewer content={step.prompt} />
        </div>
      )}

      {step?.explanation && (
        <div style={{
          marginBottom: 32,
          background: "var(--color-indigo-muted)",
          borderLeft: "3px solid var(--color-indigo)",
          borderRadius: "0 10px 10px 0",
          padding: "20px 24px",
        }}>
          <h4 style={{ color: "var(--color-badge)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
            Why this matters
          </h4>
          <div style={{ color: "var(--color-muted)", fontSize: 13, lineHeight: 1.65 }}>
            <MarkdownViewer content={step.explanation} />
          </div>
        </div>
      )}

      {hasSolution && (
        <details style={{
          marginBottom: 32,
          background: "var(--color-emerald-muted)",
          border: "1px solid var(--color-emerald-muted)",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          <summary style={{
            padding: "14px 20px",
            cursor: "pointer",
            fontWeight: 600,
            color: "var(--color-emerald)",
            fontSize: 14,
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            outline: "none",
          }}>
            Click to Reveal Solution
          </summary>
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--color-emerald-muted)", paddingTop: 20 }}>
            {step?.codeFiles && step.codeFiles.length > 0 && (
              <CodeSection files={step.codeFiles} />
            )}
            {step?.solution && (
              <div style={{
                background: "var(--color-terminal-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "14px",
                color: "var(--color-text)",
                marginTop: step?.codeFiles && step.codeFiles.length > 0 ? 20 : 0,
              }}>
                <MarkdownViewer content={`\`\`\`javascript\n${step.solution}\n\`\`\``} />
              </div>
            )}
          </div>
        </details>
      )}

      {(step?.requiresTerminal !== false || step?.interactiveLesson) && (
        <div style={{
          marginTop: 40,
          padding: "20px 22px",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,197,94,0.06))",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{step?.interactiveLesson ? "Map" : "CLI"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
                {step?.interactiveLesson ? "Ready to see the visual lesson?" : "Ready to enter the Visualizer?"}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5 }}>
                {step?.interactiveLesson
                  ? "Open the interactive slides to learn visually."
                  : "Open your workspace to see files and run commands."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
            <button
              onClick={onOpenVisualizer}
              style={{
                background: "var(--color-indigo)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              Open Visualizer
            </button>

            <button
              onClick={onOpenSplitTerminal}
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Split Panel + Terminal Bottom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
