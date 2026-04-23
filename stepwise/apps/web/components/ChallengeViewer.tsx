"use client";

import { useState } from "react";
import type { ChallengeDetail } from "@/lib/api";
import { MarkdownViewer } from "./MarkdownViewer";
import { CodeSection } from "./CodeSection";
import { useSession } from "next-auth/react";
import { AetheraProvider } from "../contexts/AetheraContext";
import { VisualWorld } from "./Aethera/VisualWorld";
import { WebTerminal } from "./Aethera/WebTerminal";
import { AetheraEvaluator } from "./Aethera/AetheraEvaluator";

interface ChallengeViewerProps {
  challenge: ChallengeDetail;
}

export function ChallengeViewer({ challenge }: ChallengeViewerProps) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeStepId, setActiveStepId] = useState(challenge.steps[0]?.id || "");
  const [passedStepIds, setPassedStepIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Note: We cast `challenge` as any for `.mode` safely since our local `api.ts` doesn't strictly have `mode: string` yet.
  const isWebMode = (challenge as any).mode === "web" || challenge.id === "linux-aethera";

  const activeStep = challenge.steps.find((s) => s.id === activeStepId) || challenge.steps[0];
  const activeStepIndex = challenge.steps.findIndex((s) => s.id === activeStepId);
  const highestUnlockedIndex = Math.min(passedStepIds.length, challenge.steps.length - 1);

  const handleStepPassed = () => {
    const completedTitle = activeStep?.title ?? "Step";
    if (activeStep?.id && !passedStepIds.includes(activeStep.id)) {
      setPassedStepIds((prev) => prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]);
    }

    setSuccessMessage(`Nice work. ${completedTitle} is complete.`);
    window.setTimeout(() => setSuccessMessage(""), 2500);

    // If successful, auto-advance to the next step dynamically!
    if (activeStepIndex < challenge.steps.length - 1) {
      setActiveStepId(challenge.steps[activeStepIndex + 1]?.id || "");
    }
  };

  const ContentArea = (
    <div style={{ padding: "80px 24px" }}>
      {/* Container holding Sidebar + Main Content */}
      <div style={{ display: "flex", maxWidth: isWebMode ? 1600 : 1200, margin: "0 auto", gap: 32 }}>

        {/* Collapsible Sidebar */}
        <div style={{
          width: isSidebarOpen ? 280 : 0,
          flexShrink: 0,
          opacity: isSidebarOpen ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          marginTop: 64, // push down a bit to align with content header
          borderRight: isSidebarOpen ? "1px solid var(--color-border)" : "none",
          paddingRight: isSidebarOpen ? 24 : 0,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
            Curriculum Steps
          </h2>
          {challenge.steps.map((step, idx) => {
            const isActive = step.id === activeStepId;
            const isLast = idx === challenge.steps.length - 1;
            const isPassed = passedStepIds.includes(step.id);
            const isLocked = isWebMode && idx > highestUnlockedIndex;

            return (
              <div key={step.id} style={{ display: "flex", gap: 16 }}>
                {/* Timeline visual */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
                  <div className={`step-dot ${isActive ? "step-dot-current" : "step-dot-locked"}`} style={{ width: 24, height: 24, fontSize: 11, opacity: isLocked ? 0.45 : 1 }}>
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  {!isLast && (
                    <div style={{ width: 1, flexGrow: 1, background: "var(--color-border)", margin: "4px 0" }} />
                  )}
                </div>

                {/* Clickable Step button */}
                <button
                  onClick={() => {
                    if (!isLocked) setActiveStepId(step.id);
                  }}
                  disabled={isLocked}
                  style={{
                    background: "none", border: "none", outline: "none", cursor: isLocked ? "not-allowed" : "pointer",
                    textAlign: "left", flex: 1, paddingBottom: isLast ? 0 : 24, paddingLeft: 0, paddingTop: 2,
                    opacity: isLocked ? 0.45 : 1,
                  }}
                >
                  <h3 style={{
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--color-text)" : "var(--color-muted)",
                    transition: "color 0.2s"
                  }}>
                    {step.title}
                  </h3>
                  {isLocked && (
                    <div style={{ color: "var(--color-muted)", fontSize: 12, marginTop: 4 }}>
                      Complete the current spell to unlock.
                    </div>
                  )}

                </button>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0, transition: "all 0.3s ease" }}>

          {/* Top Bar with Sidebar Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ padding: "8px 12px" }}
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? "◧ Hide Steps" : "◨ Show Steps"}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-indigo">{challenge.language}</span>
              <span className="badge" style={{ background: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border-strong)" }}>
                {challenge.runtime}
              </span>
            </div>
          </div>

          {/* Master Challenge Header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: 12 }}>
              {challenge.title}
            </h1>
            {challenge.description && (
              <p style={{ fontSize: 16, color: "var(--color-muted)", lineHeight: 1.7 }}>{challenge.description}</p>
            )}
          </div>

          {/* System Requirements */}
          {challenge.systemRequirements && activeStepIndex === 0 && (
            <div className="glass" style={{ padding: 28, marginBottom: 48, background: "var(--color-emerald-muted)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-emerald)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 8 }}>
                <span>💻</span> System Requirements
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                {Object.entries(challenge.systemRequirements).map(([key, value]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "uppercase", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>{key}</div>
                    <div style={{ fontSize: 14, color: "var(--color-text)", fontWeight: 500, lineHeight: 1.4 }}>{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Quick Start (only visible on first step usually if NOT in Web Mode) */}
          {!isWebMode && activeStepIndex === 0 && (
            <div className="glass" style={{ padding: 28, marginBottom: 48 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-badge)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ⚡ Quick Start Checklist
              </h2>
              <div className="terminal">
                <div><span className="comment"># 1. Install StepWise CLI (One-time only)</span></div>
                <div><span className="comment"># For Mac / Linux:</span></div>
                <div style={{ marginBottom: 4 }}><span className="prompt">$ </span><span className="cmd">curl -fsSL {process.env.NEXT_PUBLIC_APP_URL || "https://stepwise.run"}/api/cli/install/linux | bash</span></div>
                <div><span className="comment"># For Windows (Powershell):</span></div>
                <div style={{ marginBottom: 16 }}><span className="prompt">&gt; </span><span className="cmd">iwr {process.env.NEXT_PUBLIC_APP_URL || "https://stepwise.run"}/api/cli/install/windows -useb | iex</span></div>

                <div><span className="comment"># 2. Login to your terminal</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">stepwise login</span></div>

                <div><span className="comment"># 3. Pull down the workspace</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">stepwise init {challenge.id}</span></div>

                <div><span className="comment"># 4. Code your solution and test!</span></div>
                <div><span className="prompt">$ </span><span className="cmd">stepwise test</span></div>
              </div>
            </div>
          )}

          {/* Web Interactive Quest Modules */}
          {isWebMode && (
            <div style={{ marginBottom: 40 }}>
              {successMessage && (
                <div style={{
                  marginBottom: 20,
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "var(--color-emerald)",
                  borderRadius: 8,
                  padding: "14px 18px",
                  fontWeight: 700,
                }}>
                  {successMessage}
                </div>
              )}
              <VisualWorld />
              <WebTerminal activeStepId={activeStep?.id || ""} activeStepTitle={activeStep?.title || ""} />
              <AetheraEvaluator
                challengeId={challenge.id}
                stepId={activeStep?.id || ""}
                userId={(session?.user as any)?.id || "local"}
                token={(session as any)?.fastifyToken || ""}
                onPassed={handleStepPassed}
              />
            </div>
          )}

          {/* Active Step Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "var(--color-indigo)" }}>{activeStepIndex + 1}.</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)" }}>{activeStep?.title}</h2>
          </div>

          {/* Prompt Section */}
          {activeStep?.prompt && (
            <div style={{ marginBottom: 40, fontSize: 15, color: "var(--color-text)", lineHeight: 1.7 }}>
              <MarkdownViewer content={activeStep.prompt} />
            </div>
          )}

          {/* Explanation Section */}
          {activeStep?.explanation && (
            <div style={{
              marginBottom: 40,
              background: "var(--color-indigo-muted)",
              borderLeft: "3px solid var(--color-indigo)",
              borderRadius: "0 12px 12px 0",
              padding: "24px 32px"
            }}>
              <h4 style={{ color: "var(--color-badge)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 16 }}>
                💡 Why this matters
              </h4>
              <div style={{ color: "var(--color-muted)", fontSize: 14, lineHeight: 1.6 }}>
                <MarkdownViewer content={activeStep.explanation} />
              </div>
            </div>
          )}

          {/* Solution & Actionable Code Section */}
          {((activeStep?.codeFiles && activeStep.codeFiles.length > 0) || activeStep?.solution) && (
            <details
              style={{
                marginBottom: 40,
                background: "var(--color-emerald-muted)",
                border: "1px solid var(--color-emerald-muted)",
                borderRadius: 12,
                overflow: "hidden"
              }}
            >
              <summary
                style={{
                  padding: "16px 24px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "var(--color-emerald)",
                  fontSize: 15,
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  outline: "none",
                  transition: "background 0.2s"
                }}
              >
                <span style={{ fontSize: 18 }}>👁️</span> Click to Reveal Solution
              </summary>
              <div style={{
                padding: "0 24px 24px",
                borderTop: "1px solid var(--color-emerald-muted)",
                marginTop: 4,
                paddingTop: 24
              }}>
                {activeStep?.codeFiles && activeStep.codeFiles.length > 0 && (
                  <CodeSection files={activeStep.codeFiles} />
                )}

                {activeStep?.solution && (
                  <div style={{
                    background: "var(--color-terminal-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "16px",
                    color: "var(--color-text)",
                    marginTop: (activeStep?.codeFiles && activeStep.codeFiles.length > 0) ? 24 : 0
                  }}>
                    <MarkdownViewer content={`\`\`\`javascript\n${activeStep.solution}\n\`\`\``} />
                  </div>
                )}
              </div>
            </details>
          )}

        </div>
      </div>
    </div>
  );

  if (isWebMode) {
    return (
      <AetheraProvider>
        {ContentArea}
      </AetheraProvider>
    );
  }

  return ContentArea;
}
