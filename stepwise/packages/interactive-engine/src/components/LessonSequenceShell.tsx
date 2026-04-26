"use client";

/**
 * LessonSequenceShell
 *
 * The complete, self-contained slide-show engine.
 * Handles all state (current slide index), renders the header, scrollable body
 * (heading + illustration slot + body text + key bullets), and footer navigation.
 *
 * The ONLY thing the consumer provides is:
 *  - slides[]         — raw slide data from the server
 *  - stepId           — used to reset state when the step changes
 *  - renderIllustration(slideId) — a render prop for inserting the visual illustration
 *  - onCompleted      — called when the user finishes the last slide
 *
 * Usage:
 * ```tsx
 * <LessonSequenceShell
 *   slides={lesson.slides}
 *   stepId={stepId}
 *   onCompleted={onCompleted}
 *   renderIllustration={(id) => <MyIllustration slideId={id} />}
 * />
 * ```
 */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useEngineStyles } from "../useEngineStyles";
import { T } from "../tokens";

// ── Public types ──────────────────────────────────────────────────────────────

export interface LessonSlide {
  id: string;
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LessonSequenceShellProps {
  slides: LessonSlide[];
  stepId: string;
  onCompleted?: (stepId: string) => void;
  /** Render prop — given a slideId, return the interactive illustration element */
  renderIllustration: (slideId: string) => ReactNode;
  /** Title shown in the header, defaults to "Interactive Lesson" */
  title?: string;
  /** Subtitle shown in the header */
  subtitle?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LessonSequenceShell({
  slides,
  stepId,
  onCompleted,
  renderIllustration,
  title = "Interactive Lesson",
  subtitle = "Explore the idea, then try it.",
}: LessonSequenceShellProps) {
  useEngineStyles();

  const [slideIndex, setSlideIndex] = useState(0);
  const isLast = slideIndex === slides.length - 1;
  const active = slides[slideIndex];

  // Reset to first slide whenever the step changes
  useEffect(() => { setSlideIndex(0); }, [stepId]);

  const progressLabel = useMemo(
    () => `${slideIndex + 1} / ${slides.length}`,
    [slideIndex, slides.length],
  );

  if (!active) return null;

  const advance = () => {
    if (isLast) { onCompleted?.(stepId); return; }
    setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
  };
  const back = () => setSlideIndex((i) => Math.max(0, i - 1));

  return (
    <div style={outerStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {slides.map((s, i) => (
              <div
                key={s.id}
                style={{
                  width: 7, height: 7, borderRadius: "50%", transition: "background 0.3s",
                  background: i === slideIndex ? T.emerald : i < slideIndex ? T.emeraldAlpha(0.4) : T.dot,
                }}
              />
            ))}
          </div>
          {/* Progress label */}
          <div
            style={{
              padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: T.pillBg, color: T.pillText, border: `1px solid ${T.pillBorder}`,
            }}
          >
            {progressLabel}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 22px 16px" }}>
        {/* Key: slide ID so React re-mounts the illustration and resets its internal state */}
        <div key={active.id} style={slideContainerStyle}>

          {/* Heading */}
          <h2 style={headingStyle}>{active.heading}</h2>

          {/* Interactive illustration — injected by consumer */}
          {renderIllustration(active.id)}

          {/* Body paragraphs */}
          {active.body && (
            <div style={bodyStyle}>
              {active.body.split("\n\n").map((p, i) => (
                <p key={i} style={{ margin: 0, wordBreak: "break-word" }}>{p}</p>
              ))}
            </div>
          )}

          {/* Key bullets */}
          {active.bullets && active.bullets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {active.bullets.map((bullet) => (
                <div key={bullet} style={bulletStyle}>{bullet}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div style={footerStyle}>
        <button
          onClick={back}
          disabled={slideIndex === 0}
          style={{
            padding: "9px 16px", borderRadius: 8,
            border: `1px solid ${T.cardBorder}`, background: T.cardBg,
            color: slideIndex === 0 ? T.muted : T.text,
            cursor: slideIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: 13,
          }}
        >
          ← Back
        </button>
        <button
          onClick={advance}
          style={{
            padding: "9px 22px", borderRadius: 8,
            border: `1px solid ${T.emeraldAlpha(0.35)}`,
            background: isLast ? T.emeraldAlpha(0.18) : T.emeraldAlpha(0.08),
            color: T.emerald, cursor: "pointer", fontWeight: 800, fontSize: 13,
            transition: "background 0.2s",
          }}
        >
          {isLast ? "✓ Got it →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const outerStyle: CSSProperties = {
  display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
  background: [
    "radial-gradient(circle at top left, var(--interactive-spot-1), transparent 32%)",
    "radial-gradient(circle at bottom right, var(--interactive-spot-2), transparent 36%)",
    "linear-gradient(180deg, var(--interactive-bg-top), var(--interactive-bg-bottom))",
  ].join(", "),
  borderRadius: 12,
  border: "1px solid var(--interactive-border)",
  boxShadow: "0 18px 40px var(--interactive-shadow)",
};

const headerStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "12px 18px", borderBottom: "1px solid var(--interactive-divider)",
  flexShrink: 0, gap: 12,
};

const footerStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  gap: 12, padding: "12px 18px",
  borderTop: "1px solid var(--interactive-divider)",
  flexShrink: 0, background: "var(--interactive-footer-bg)",
};

const slideContainerStyle: CSSProperties = {
  display: "flex", flexDirection: "column", gap: 16,
  maxWidth: 860, margin: "0 auto",
  animation: "ie-slide-in 0.35s ease",
};

const headingStyle: CSSProperties = {
  fontSize: 21, lineHeight: 1.25, fontWeight: 900, color: T.text,
  letterSpacing: "-0.02em", margin: 0, wordBreak: "break-word",
};

const bodyStyle: CSSProperties = {
  display: "flex", flexDirection: "column", gap: 9,
  color: T.body, fontSize: 13.5, lineHeight: 1.8,
};

const bulletStyle: CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 8,
  padding: "9px 12px", borderRadius: 9,
  background: T.cardBg, border: `1px solid ${T.cardBorder}`,
  fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: T.text,
  wordBreak: "break-word", overflowWrap: "anywhere",
};
