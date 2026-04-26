"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChallengeDetail } from "@/lib/api";
import { MarkdownViewer } from "./MarkdownViewer";
import { CodeSection } from "./CodeSection";
import { useSession } from "next-auth/react";
import { AetheraProvider } from "../contexts/AetheraContext";
import { VisualWorld } from "./Aethera/VisualWorld";
import { WebTerminal } from "./Aethera/WebTerminal";
import { AetheraEvaluator } from "./Aethera/AetheraEvaluator";
import { InteractiveLessonSequence } from "./interactive/InteractiveLessonSequence";
import { useAethera } from "../contexts/AetheraContext";

interface ChallengeViewerProps {
  challenge: ChallengeDetail;
}

export function ChallengeViewer({ challenge }: ChallengeViewerProps) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeStepId, setActiveStepId] = useState(challenge.steps[0]?.id || "");
  const [passedStepIds, setPassedStepIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  // Panels: "visualizer" | "content" — shown left of terminal in web mode
  const [leftPanel, setLeftPanel] = useState<"visualizer" | "content">("visualizer");

  // Ref passed down so WebTerminal can re-focus input after step advance
  const terminalFocusRef = useRef<() => void>(() => {});

  const isWebMode = (challenge as any).mode === "web" || challenge.id === "linux-aethera";

  // ── Load saved progress from server on mount ──────────────────────────────
  useEffect(() => {
    const token = (session as any)?.fastifyToken;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
    fetch(`${apiUrl}/dashboard`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: any) => {
        const prog = data?.progress?.find(
          (p: any) => p.challengeId === challenge.id,
        );
        if (prog) {
          const completed: string[] = prog.completedStepKeys ?? [];
          setPassedStepIds(completed);
          // Resume from current step, or first uncompleted
          const resumeStepKey =
            prog.currentStepKey ||
            challenge.steps.find((s) => !completed.includes(s.id))?.id ||
            challenge.steps[0]?.id;
          if (resumeStepKey) setActiveStepId(resumeStepKey);
        }
      })
      .catch(() => { /* no progress yet — stay at step 0 */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(session as any)?.fastifyToken, challenge.id]);

  const activeStep = challenge.steps.find((s) => s.id === activeStepId) || challenge.steps[0];
  const activeStepIndex = challenge.steps.findIndex((s) => s.id === activeStepId);
  // A step is unlocked if it is already passed OR it is the very next step after the last passed one
  const highestUnlockedIndex = Math.min(passedStepIds.length, challenge.steps.length - 1);

  const handleStepPassed = useCallback(() => {
    const completedTitle = activeStep?.title ?? "Step";
    if (activeStep?.id && !passedStepIds.includes(activeStep.id)) {
      setPassedStepIds((prev) => (prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]));
    }

    // Show success toast (doesn't change panel — user stays in current view)
    setSuccessMessage(`✓ ${completedTitle} complete — next step unlocked!`);
    window.setTimeout(() => setSuccessMessage(""), 3000);

    // Advance to next step
    if (activeStepIndex < challenge.steps.length - 1) {
      setActiveStepId(challenge.steps[activeStepIndex + 1]?.id || "");
      // DO NOT switch left panel — stay on visualizer so terminal stays visible
      // Re-focus terminal input after state update
      window.setTimeout(() => terminalFocusRef.current?.(), 80);
    }
  }, [activeStep, passedStepIds, activeStepIndex, challenge.steps]);

  /* ── Step Content (prompt + explanation + solution) ── */
  const stepContent = (
    <div style={{ padding: "24px 28px", paddingBottom: 64 }}>
      {/* Active Step Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "var(--color-indigo)" }}>{activeStepIndex + 1}.</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>{activeStep?.title}</h2>
      </div>

      {activeStep?.prompt && (
        <div style={{ marginBottom: 32, fontSize: 14, color: "var(--color-text)", lineHeight: 1.75 }}>
          <MarkdownViewer content={activeStep.prompt} />
        </div>
      )}

      {activeStep?.explanation && (
        <div style={{
          marginBottom: 32,
          background: "var(--color-indigo-muted)",
          borderLeft: "3px solid var(--color-indigo)",
          borderRadius: "0 10px 10px 0",
          padding: "20px 24px"
        }}>
          <h4 style={{ color: "var(--color-badge)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>
            💡 Why this matters
          </h4>
          <div style={{ color: "var(--color-muted)", fontSize: 13, lineHeight: 1.65 }}>
            <MarkdownViewer content={activeStep.explanation} />
          </div>
        </div>
      )}

      {((activeStep?.codeFiles && activeStep.codeFiles.length > 0) || activeStep?.solution) && (
        <details style={{
          marginBottom: 32,
          background: "var(--color-emerald-muted)",
          border: "1px solid var(--color-emerald-muted)",
          borderRadius: 10,
          overflow: "hidden"
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
            <span style={{ fontSize: 16 }}>👁️</span> Click to Reveal Solution
          </summary>
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--color-emerald-muted)", paddingTop: 20 }}>
            {activeStep?.codeFiles && activeStep.codeFiles.length > 0 && (
              <CodeSection files={activeStep.codeFiles} />
            )}
            {activeStep?.solution && (
              <div style={{
                background: "var(--color-terminal-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "14px",
                color: "var(--color-text)",
                marginTop: (activeStep?.codeFiles && activeStep.codeFiles.length > 0) ? 20 : 0
              }}>
                <MarkdownViewer content={`\`\`\`javascript\n${activeStep.solution}\n\`\`\``} />
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );

  /* ── Non-web / CLI challenge layout ── */
  const nonWebContent = (
    <div style={{ padding: "80px 24px 40px" }}>
      <div style={{ display: "flex", maxWidth: 1200, width: "100%", margin: "0 auto", gap: 32 }}>
        {/* Collapsible Sidebar */}
        <div style={{
          width: isSidebarOpen ? 260 : 0,
          flexShrink: 0,
          opacity: isSidebarOpen ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          marginTop: 64,
          borderRight: isSidebarOpen ? "1px solid var(--color-border)" : "none",
          paddingRight: isSidebarOpen ? 24 : 0,
        }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
            Curriculum Steps
          </h2>
          {challenge.steps.map((step, idx) => {
            const isActive = step.id === activeStepId;
            const isLast = idx === challenge.steps.length - 1;
            const isPassed = passedStepIds.includes(step.id);
            return (
              <div key={step.id} style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
                  <div className={`step-dot ${isPassed ? "step-dot-done" : isActive ? "step-dot-current" : "step-dot-locked"}`} style={{ width: 22, height: 22, fontSize: 10 }}>
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  {!isLast && <div style={{ width: 1, flexGrow: 1, background: "var(--color-border)", margin: "4px 0" }} />}
                </div>
                <button
                  onClick={() => setActiveStepId(step.id)}
                  style={{
                    background: "none", border: "none", outline: "none", cursor: "pointer",
                    textAlign: "left", flex: 1, paddingBottom: isLast ? 0 : 22, paddingLeft: 0, paddingTop: 2,
                  }}
                >
                  <h3 style={{
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--color-text)" : isPassed ? "var(--color-emerald)" : "var(--color-muted)",
                    transition: "color 0.2s"
                  }}>
                    {step.title}
                  </h3>
                </button>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <button className="btn btn-ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ padding: "7px 12px", fontSize: 13 }}>
              {isSidebarOpen ? "◧ Hide Steps" : "◨ Show Steps"}
            </button>
            <span className="badge badge-indigo">{challenge.language}</span>
            <span className="badge badge-ghost">{challenge.runtime}</span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: 10 }}>
              {challenge.title}
            </h1>
            {challenge.description && (
              <p style={{ fontSize: 15, color: "var(--color-muted)", lineHeight: 1.7 }}>{challenge.description}</p>
            )}
          </div>

          {challenge.systemRequirements && activeStepIndex === 0 && (
            <div className="glass" style={{ padding: 24, marginBottom: 40, background: "var(--color-emerald-muted)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--color-emerald)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                💻 System Requirements
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
                {Object.entries(challenge.systemRequirements).map(([key, value]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "uppercase", marginBottom: 5, fontWeight: 600, letterSpacing: "0.05em" }}>{key}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text)", fontWeight: 500 }}>{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStepIndex === 0 && (
            <div className="glass" style={{ padding: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--color-badge)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ⚡ Quick Start
              </h2>
              <div className="terminal">
                <div><span className="comment"># Install CLI (one-time)</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">npx stepwise@latest --help</span></div>
                <div><span className="comment"># Initialize this quest</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">stepwise init {challenge.id}</span></div>
                <div><span className="comment"># Run tests</span></div>
                <div><span className="prompt">$ </span><span className="cmd">stepwise test</span></div>
              </div>
            </div>
          )}

          {stepContent}
        </div>
      </div>
    </div>
  );

  /* ── Web / Aethera layout ── */
  const webContent = (
    <div className="challenge-fullscreen-wrapper">
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      paddingTop: 60, // NavBar height
    }}>

      {/* ── Success Toast ── */}
      {successMessage && (
        <>
          <style>{`
            @keyframes flyUp {
              0% { transform: translateY(100vh) scale(0.5); opacity: 1; }
              100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
            }
            @keyframes toastIn {
              from { opacity: 0; transform: translateY(-12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .cracker {
              position: fixed;
              font-size: 2.5rem;
              animation: flyUp 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              z-index: 9999;
              pointer-events: none;
            }
          `}</style>
          <div style={{
            position: "fixed",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "var(--color-emerald)",
            borderRadius: "var(--radius-md)",
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 14,
            backdropFilter: "blur(12px)",
            whiteSpace: "nowrap",
            animation: "toastIn 0.3s ease both",
            boxShadow: "0 8px 32px rgba(16,185,129,0.15)",
          }}>
            {successMessage}
          </div>
          <div className="cracker" style={{ left: "10%", animationDelay: "0.1s" }}>🎉</div>
          <div className="cracker" style={{ left: "30%", animationDelay: "0.3s" }}>🎊</div>
          <div className="cracker" style={{ left: "50%", animationDelay: "0s" }}>🚀</div>
          <div className="cracker" style={{ left: "70%", animationDelay: "0.2s" }}>✨</div>
          <div className="cracker" style={{ left: "90%", animationDelay: "0.4s" }}>🎉</div>
        </>
      )}

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-glass)",
        backdropFilter: "blur(16px)",
        flexShrink: 0,
      }}>
        {/* Sidebar toggle */}
        <button
          className="btn btn-ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          {isSidebarOpen ? "◧" : "◨"} Steps
        </button>

        {/* Challenge meta */}
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
          {challenge.title}
        </span>
        <span className="badge badge-indigo" style={{ fontSize: 11 }}>{challenge.language}</span>

        <div style={{ flex: 1 }} />

        {/* Left panel switcher */}
        <div style={{ display: "flex", gap: 4, background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)", padding: 3 }}>
          {(["visualizer", "content"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setLeftPanel(tab)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
                background: leftPanel === tab ? "var(--color-indigo)" : "transparent",
                color: leftPanel === tab ? "#fff" : "var(--color-muted)",
                transition: "all 0.18s ease",
              }}
            >
              {tab === "visualizer" ? "🗂 Visualizer" : "📖 Step Guide"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: Sidebar + Left Panel + Terminal ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Step Sidebar */}
        <div style={{
          width: isSidebarOpen ? 220 : 0,
          flexShrink: 0,
          overflow: "hidden",
          borderRight: isSidebarOpen ? "1px solid var(--color-border)" : "none",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Curriculum
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 16px" }}>
            {challenge.steps.map((step, idx) => {
              const isActive = step.id === activeStepId;
              const isPassed = passedStepIds.includes(step.id);
              // Completed steps are always accessible; only lock future unseen steps
              const isLocked = isWebMode && !isPassed && idx > highestUnlockedIndex;
              const isLast = idx === challenge.steps.length - 1;

              return (
                <div key={step.id} style={{ display: "flex", gap: 10, opacity: isLocked ? 0.4 : 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div
                      className={`step-dot ${isPassed ? "step-dot-done" : isActive ? "step-dot-current" : "step-dot-locked"}`}
                      style={{ width: 20, height: 20, fontSize: 9, flexShrink: 0 }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    {!isLast && <div style={{ width: 1, flexGrow: 1, background: "var(--color-border)", margin: "3px 0" }} />}
                  </div>
                  <button
                    onClick={() => { if (!isLocked) setActiveStepId(step.id); }}
                    disabled={isLocked}
                    style={{
                      background: "none", border: "none", outline: "none",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      textAlign: "left", flex: 1, paddingBottom: isLast ? 0 : 18,
                      paddingLeft: 0, paddingTop: 2,
                    }}
                  >
                    <div style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isPassed ? "var(--color-emerald)" : isActive ? "var(--color-text)" : "var(--color-muted)",
                      lineHeight: 1.4,
                    }}>
                      {step.title}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left panel: Visualizer or Step Guide */}
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid var(--color-border)" }}>
          {leftPanel === "visualizer" ? (
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <WebVisualizerPanel
                stepId={activeStep?.id || ""}
                interactiveLesson={activeStep?.interactiveLesson}
              />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", background: "var(--color-surface)" }}>
              {stepContent}
            </div>
          )}
        </div>

        {/* Right panel: Terminal — always visible */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 340 }}>
          <WebTerminal
            activeStepId={activeStep?.id || ""}
            activeStepTitle={activeStep?.title || ""}
            focusRef={terminalFocusRef}
          />
        </div>

      </div>

      <AetheraEvaluator
        challengeId={challenge.id}
        stepId={activeStep?.id || ""}
        userId={(session?.user as any)?.id || "local"}
        token={(session as any)?.fastifyToken || ""}
        onPassed={handleStepPassed}
      />
    </div>
    </div>
  );

  if (isWebMode) {
    return (
      <AetheraProvider>
        {webContent}
      </AetheraProvider>
    );
  }

  return nonWebContent;
}

function WebVisualizerPanel({
  stepId,
  interactiveLesson,
}: {
  stepId: string;
  interactiveLesson?: ChallengeDetail["steps"][number]["interactiveLesson"];
}) {
  const { markStepComplete } = useAethera();

  if (interactiveLesson?.type === "sequence") {
    return (
      <InteractiveLessonSequence
        lesson={interactiveLesson}
        stepId={stepId}
        onCompleted={markStepComplete}
      />
    );
  }

  return <VisualWorld />;
}
