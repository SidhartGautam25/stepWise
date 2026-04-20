"use client";

import { useState } from "react";
import type { ChallengeDetail } from "@/lib/api";
import { MarkdownViewer } from "./MarkdownViewer";

interface ChallengeViewerProps {
  challenge: ChallengeDetail;
}

export function ChallengeViewer({ challenge }: ChallengeViewerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeStepId, setActiveStepId] = useState(challenge.steps[0]?.id || "");

  const activeStep = challenge.steps.find((s) => s.id === activeStepId) || challenge.steps[0];
  const activeStepIndex = challenge.steps.findIndex((s) => s.id === activeStepId);

  return (
    <div style={{ padding: "80px 24px" }}>
      {/* Container holding Sidebar + Main Content */}
      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", gap: 32 }}>

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
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#666680", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
            Curriculum Steps
          </h2>
          {challenge.steps.map((step, idx) => {
            const isActive = step.id === activeStepId;
            const isLast = idx === challenge.steps.length - 1;

            return (
              <div key={step.id} style={{ display: "flex", gap: 16 }}>
                {/* Timeline visual */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
                  <div className={`step-dot ${isActive ? "step-dot-current" : "step-dot-locked"}`} style={{ width: 24, height: 24, fontSize: 11 }}>
                    {idx + 1}
                  </div>
                  {!isLast && (
                    <div style={{ width: 1, flexGrow: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  )}
                </div>

                {/* Clickable Step button */}
                <button
                  onClick={() => setActiveStepId(step.id)}
                  style={{
                    background: "none", border: "none", outline: "none", cursor: "pointer",
                    textAlign: "left", flex: 1, paddingBottom: isLast ? 0 : 24, paddingLeft: 0, paddingTop: 2,
                  }}
                >
                  <h3 style={{
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#e8e8f0" : "#666680",
                    transition: "color 0.2s"
                  }}>
                    {step.title}
                  </h3>
                  {step.hasStarter && (
                    <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", fontSize: 10, marginTop: 6, display: "inline-block" }}>
                      Starter files
                    </span>
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
              <span className="badge" style={{ background: "rgba(255,255,255,0.04)", color: "#666680", border: "1px solid rgba(255,255,255,0.07)" }}>
                {challenge.runtime}
              </span>
            </div>
          </div>

          {/* Master Challenge Header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", color: "#e8e8f0", marginBottom: 12 }}>
              {challenge.title}
            </h1>
            {challenge.description && (
              <p style={{ fontSize: 16, color: "#666680", lineHeight: 1.7 }}>{challenge.description}</p>
            )}
          </div>

          {/* Terminal Quick Start (only visible on first step usually) */}
          {activeStepIndex === 0 && (
            <div className="glass" style={{ padding: 28, marginBottom: 48 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ⚡ Quick Start Checklist
              </h2>
              <div className="terminal">
                <div><span className="comment"># 1. Login to stepWise in terminal</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">npx stepwise login</span></div>
                <div><span className="comment"># 2. Pull down the workspace</span></div>
                <div style={{ marginBottom: 8 }}><span className="prompt">$ </span><span className="cmd">npx stepwise init {challenge.id}</span></div>
                <div><span className="comment"># 3. Code your solution and test!</span></div>
                <div><span className="prompt">$ </span><span className="cmd">npx stepwise test</span></div>
              </div>
            </div>
          )}

          {/* Active Step Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#6c63ff" }}>{activeStepIndex + 1}.</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#e8e8f0" }}>{activeStep?.title}</h2>
          </div>

          {/* Prompt Section */}
          {activeStep?.prompt && (
            <div style={{ marginBottom: 40, fontSize: 15, color: "#e8e8f0", lineHeight: 1.7 }}>
              <MarkdownViewer content={activeStep.prompt} />
            </div>
          )}

          {/* Explanation Section */}
          {activeStep?.explanation && (
            <div style={{
              marginBottom: 40,
              background: "rgba(139, 92, 246, 0.06)", 
              borderLeft: "3px solid #8b5cf6",
              borderRadius: "0 12px 12px 0",
              padding: "24px 32px"
            }}>
              <h4 style={{ color: "#a78bfa", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 16 }}>
                💡 Why this matters
              </h4>
              <div style={{ color: "#b4b4c0", fontSize: 14, lineHeight: 1.6 }}>
                <MarkdownViewer content={activeStep.explanation} />
              </div>
            </div>
          )}

          {/* Solution Section */}
          {activeStep?.solution && (
            <details 
              style={{
                marginBottom: 40,
                background: "rgba(16, 185, 129, 0.04)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: 12,
                overflow: "hidden"
              }}
            >
              <summary 
                style={{ 
                  padding: "16px 24px", 
                  cursor: "pointer", 
                  fontWeight: 600, 
                  color: "#34d399",
                  fontSize: 15,
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  outline: "none",
                  transition: "background 0.2s"
                }}
              >
                <span style={{ fontSize: 18 }}>👁️</span> Click to Reveal Solution Pattern
              </summary>
              <div style={{ 
                padding: "0 24px 24px", 
                borderTop: "1px solid rgba(16, 185, 129, 0.1)",
                marginTop: 4,
                paddingTop: 24
              }}>
                <div style={{
                  background: "#0a0a0f",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  padding: "16px",
                  color: "#e8e8f0",
                }}>
                  <MarkdownViewer content={`\`\`\`javascript\n${activeStep.solution}\n\`\`\``} />
                </div>
              </div>
            </details>
          )}

        </div>
      </div>
    </div>
  );
}
