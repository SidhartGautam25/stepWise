"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type { InteractiveLesson } from "@/lib/api";

interface InteractiveLessonSequenceProps {
  lesson: InteractiveLesson;
  stepId: string;
  onCompleted?: (stepId: string) => void;
}

export function InteractiveLessonSequence({
  lesson,
  stepId,
  onCompleted,
}: InteractiveLessonSequenceProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = lesson.slides;
  const activeSlide = slides[slideIndex];
  const isLastSlide = slideIndex === slides.length - 1;

  useEffect(() => {
    setSlideIndex(0);
  }, [stepId]);

  const progressLabel = useMemo(
    () => `${slideIndex + 1} / ${slides.length}`,
    [slideIndex, slides.length],
  );

  if (!activeSlide) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, var(--interactive-spot-1), transparent 32%), radial-gradient(circle at bottom right, var(--interactive-spot-2), transparent 36%), linear-gradient(180deg, var(--interactive-bg-top), var(--interactive-bg-bottom))",
        borderRadius: 12,
        border: "1px solid var(--interactive-border)",
        boxShadow: "0 18px 40px var(--interactive-shadow)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          borderBottom: "1px solid var(--interactive-divider)",
          flexShrink: 0,
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--color-text)",
              letterSpacing: "-0.01em",
            }}
          >
            Interactive Lesson
          </div>
          <div style={{ fontSize: 11, color: "var(--interactive-muted)", marginTop: 2 }}>
            Explore the idea first, then try it in the terminal.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    index === slideIndex
                      ? "var(--color-emerald)"
                      : index < slideIndex
                      ? "rgba(34,197,94,0.4)"
                      : "var(--interactive-dot)",
                  transition: "background 0.25s",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
          <div
            style={{
              padding: "4px 9px",
              borderRadius: 999,
              background: "var(--interactive-pill-bg)",
              color: "var(--interactive-pill-text)",
              fontSize: 11,
              fontWeight: 700,
              border: "1px solid var(--interactive-pill-border)",
              whiteSpace: "nowrap",
            }}
          >
            {progressLabel}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 24px 16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              lineHeight: 1.25,
              fontWeight: 900,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {activeSlide.heading}
          </h2>

          {/* Visual illustration — served per slide ID */}
          <SceneIllustration slideId={activeSlide.id} />

          {/* Body text — from server JSON */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              color: "var(--interactive-body)",
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            {activeSlide.body.split("\n\n").map((paragraph, index) => (
              <p
                key={`${activeSlide.id}-${index}`}
                style={{ margin: 0, wordBreak: "break-word" }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Bullets — from server JSON */}
          {activeSlide.bullets && activeSlide.bullets.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
                marginTop: 4,
              }}
            >
              {activeSlide.bullets.map((bullet) => (
                <div
                  key={bullet}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "var(--interactive-card-bg)",
                    border: "1px solid var(--interactive-card-border)",
                    color: "var(--color-text)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontWeight: 500,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    minWidth: 0,
                  }}
                >
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer nav ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderTop: "1px solid var(--interactive-divider)",
          flexShrink: 0,
          background: "var(--interactive-footer-bg)",
        }}
      >
        <button
          onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
          disabled={slideIndex === 0}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "1px solid var(--interactive-card-border)",
            background: "var(--interactive-card-bg)",
            color: slideIndex === 0 ? "var(--interactive-muted)" : "var(--color-text)",
            cursor: slideIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => {
            if (isLastSlide) {
              onCompleted?.(stepId);
              return;
            }
            setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
          }}
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            border: "1px solid rgba(34,197,94,0.35)",
            background: isLastSlide ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.08)",
            color: "var(--color-emerald)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 13,
            transition: "background 0.2s",
          }}
        >
          {isLastSlide ? "✓ Got it →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── Visual Illustrations ─────────────────────────────────────────────────────
// Each illustration matches a slide "id" from the server JSON.
// Content is beginner-friendly and purely visual — no code, no jargon.

function SceneIllustration({ slideId }: { slideId: string }) {

  // ── Step 1: Welcome slides ────────────────────────────────────────────────

  if (slideId === "welcome-hello") {
    return (
      <div style={shell}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "8px 0" }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>👋</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)", textAlign: "center" }}>
            You're in the right place
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {["🚫 No experience needed", "🐢 No rush", "✨ Just curiosity"].map((t) => (
              <div key={t} style={chip}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slideId === "welcome-everyday") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Things you already do every day</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { icon: "📱", label: "Open an app" },
            { icon: "🎵", label: "Play music" },
            { icon: "📸", label: "Take a photo" },
            { icon: "💾", label: "Save a file" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ ...card, textAlign: "center" as const, gap: 6 }}>
              <div style={{ fontSize: 26 }}>{icon}</div>
              <div style={{ fontSize: 12, color: "var(--interactive-body)", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--interactive-pill-bg)", color: "var(--interactive-pill-text)", fontSize: 13, fontWeight: 600, textAlign: "center" as const, border: "1px solid var(--interactive-pill-border)" }}>
          💡 Who's managing all of this?
        </div>
      </div>
    );
  }

  if (slideId === "welcome-manager") {
    return (
      <div style={shell}>
        <div style={shellTitle}>The OS is like a restaurant manager</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={{ ...card, textAlign: "center" as const }}>
            <div style={{ fontSize: 26 }}>👨‍🍳</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)" }}>Chef = App</div>
            <div style={{ fontSize: 11, color: "var(--interactive-body)" }}>Needs the oven & fridge</div>
          </div>
          <div style={{ ...card, textAlign: "center" as const }}>
            <div style={{ fontSize: 26 }}>👩‍💼</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)" }}>Manager = OS</div>
            <div style={{ fontSize: 11, color: "var(--interactive-body)" }}>Decides who gets what</div>
          </div>
          <div style={{ ...card, textAlign: "center" as const }}>
            <div style={{ fontSize: 26 }}>🍳</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)" }}>Oven = CPU</div>
            <div style={{ fontSize: 11, color: "var(--interactive-body)" }}>The shared resource</div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 13, color: "var(--interactive-body)", textAlign: "center" as const }}>
          ⚖️ Without the manager → chaos. With the manager → smooth kitchen!
        </div>
      </div>
    );
  }

  if (slideId === "welcome-linux") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Open vs. Closed — which would you rather learn from?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div style={{ fontSize: 28 }}>🔒</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>Windows / Mac</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>Closed box. You can use it — but you can't look inside or change how it works.</div>
          </div>
          <div style={{ padding: 16, borderRadius: 12, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)", display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div style={{ fontSize: 28 }}>🪟</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>Linux</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>Open box. You can see inside, change things, and learn exactly how it works — like a glass oven!</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Storage slides (no jargon, all analogy) ───────────────────────

  if (slideId === "storage-your-stuff") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Where does your stuff go when you close an app?</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {[
            { icon: "📸", text: "Take a photo", state: "Saved!", color: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" },
            { icon: "📱", text: "Close the app", state: "Still there!", color: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)" },
            { icon: "🔋", text: "Turn off the phone", state: "Still there!", color: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)" },
            { icon: "✅", text: "Open camera next day", state: "Photo is safe 🎉", color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)" },
          ].map(({ icon, text, state, color, border }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: color, border: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{text}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--interactive-muted)", fontWeight: 700 }}>{state}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--interactive-pill-bg)", border: "1px solid var(--interactive-pill-border)", fontSize: 13, color: "var(--interactive-pill-text)", textAlign: "center" as const, fontWeight: 600 }}>
          💾 Storage is the invisible place keeping your stuff safe
        </div>
      </div>
    );
  }

  if (slideId === "storage-vs-memory") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Bookshelf (storage) vs. Desk (workspace)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 12, border: "2px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)", display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div style={{ fontSize: 32 }}>📚</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>Bookshelf = Storage</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>
              Holds <strong>everything</strong>. Slow to grab from. But it <strong>never forgets</strong> — even when the lights go off.
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 12, border: "1px solid rgba(100,116,139,0.3)", background: "rgba(100,116,139,0.06)", display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div style={{ fontSize: 32 }}>🖥️</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>Desk = Workspace</div>
            <div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>
              Holds what you're <strong>using right now</strong>. Fast to grab. But cleared when you're done.
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 13, color: "var(--interactive-body)", textAlign: "center" as const }}>
          👉 We're focusing on the <strong>bookshelf</strong> — the permanent storage
        </div>
      </div>
    );
  }

  if (slideId === "storage-folders") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Folders inside folders — like a filing cabinet</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
          <div style={dirRow}>
            <span>📁</span> <span>All My Files</span>
          </div>
          <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 6 }}>
            <div style={dirRow}><span>📁</span> <span>Photos</span></div>
            <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 4 }}>
              <div style={fileRow}><span>📄</span> <span>holiday-2024.jpg</span></div>
              <div style={fileRow}><span>📄</span> <span>birthday.jpg</span></div>
            </div>
            <div style={dirRow}><span>📁</span> <span>Music</span></div>
            <div style={{ paddingLeft: 20 }}>
              <div style={fileRow}><span>🎵</span> <span>favorites.mp3</span></div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--interactive-pill-bg)", border: "1px solid var(--interactive-pill-border)", fontSize: 13, color: "var(--interactive-pill-text)", textAlign: "center" as const, fontWeight: 600 }}>
          📁 File folder = group &nbsp;|&nbsp; 📄 File = one piece of stuff
        </div>
      </div>
    );
  }

  if (slideId === "storage-your-home") {
    return (
      <div style={shell}>
        <div style={shellTitle}>Your home folder — your personal space on Linux</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
          <div style={{ ...dirRow, opacity: 0.5 }}><span>🖥️</span> <span>The whole computer</span></div>
          <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 6 }}>
            <div style={{ ...dirRow, opacity: 0.5 }}><span>📁</span> <span>home</span></div>
            <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 6 }}>
              <div style={{ ...dirRow, border: "2px solid rgba(34,197,94,0.5)", background: "rgba(34,197,94,0.10)" }}>
                <span>🏠</span> <span style={{ fontWeight: 800 }}>student ← You are here</span>
              </div>
              <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 4 }}>
                <div style={fileRow}><span>📄</span> <span>welcome.txt</span></div>
                <div style={dirRow}><span>📁</span> <span>projects</span></div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", fontSize: 13, color: "var(--interactive-body)", textAlign: "center" as const }}>
          🔑 This is <strong>your</strong> space. Ready to explore it?
        </div>
      </div>
    );
  }

  // ── Legacy illustrations (kept for backward compat with old slide IDs) ────

  if (slideId === "hardware-parts") {
    return (
      <div style={shell}>
        <div style={shellTitle}>System parts working together</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10 }}>
          {[["CPU","Executes instructions"],["Memory","Holds active data"],["Storage","Keeps data long-term"],["Input/Output","Connects to world"]].map(([n,l]) => (
            <div key={n} style={card}><div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-text)" }}>{n}</div><div style={{ fontSize: 12, color: "var(--interactive-body)" }}>{l}</div></div>
          ))}
        </div>
      </div>
    );
  }

  if (slideId === "files-and-directories") {
    return (
      <div style={shell}>
        <div style={shellTitle}>The filesystem gives storage names and paths</div>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={dirRow}><span>📁 /</span></div>
          <div style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
            <div style={dirRow}><span>📁 home</span></div>
            <div style={{ paddingLeft: 18, display: "grid", gap: 5 }}>
              <div style={dirRow}><span>📁 student</span></div>
              <div style={{ paddingLeft: 18, display: "grid", gap: 4 }}>
                <div style={fileRow}><span>📄 notes.txt</span></div>
                <div style={dirRow}><span>📁 projects</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default
  return (
    <div style={shell}>
      <div style={shellTitle}>From curiosity to understanding</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[["See","Look beneath the surface"],["Reason","Understand structure"],["Build","Use it in practice"]].map(([n,l]) => (
          <div key={n} style={card}><div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-text)" }}>{n}</div><div style={{ fontSize: 12, color: "var(--interactive-body)", lineHeight: 1.5 }}>{l}</div></div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const shell: CSSProperties = {
  padding: "16px",
  borderRadius: 14,
  background: "var(--interactive-card-bg)",
  border: "1px solid var(--interactive-card-border)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const shellTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--interactive-kicker)",
};

const card: CSSProperties = {
  padding: "12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.3)",
  border: "1px solid var(--interactive-card-border)",
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const chip: CSSProperties = {
  padding: "7px 12px",
  borderRadius: 999,
  background: "var(--interactive-pill-bg)",
  border: "1px solid var(--interactive-pill-border)",
  color: "var(--interactive-pill-text)",
  fontSize: 12,
  fontWeight: 700,
};

const dirRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 12px",
  borderRadius: 8,
  background: "var(--color-cyan-muted)",
  border: "1px solid rgba(6,182,212,0.18)",
  color: "var(--color-text)",
  fontWeight: 600,
  fontSize: 13,
};

const fileRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 12px",
  borderRadius: 8,
  background: "var(--color-amber-muted)",
  border: "1px solid rgba(245,158,11,0.18)",
  color: "var(--color-text)",
  fontWeight: 600,
  fontSize: 13,
};
