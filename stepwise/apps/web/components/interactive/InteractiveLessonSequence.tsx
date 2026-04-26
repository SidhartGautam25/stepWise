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

  if (!activeSlide) {
    return null;
  }

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          borderBottom: "1px solid var(--interactive-divider)",
          flexShrink: 0,
        }}
      >
        <div>
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
          <div
            style={{
              fontSize: 11,
              color: "var(--interactive-muted)",
              marginTop: 2,
            }}
          >
            Explore the idea first, then move into the hands-on step.
          </div>
        </div>
        <div
          style={{
            padding: "5px 10px",
            borderRadius: 999,
            background: "var(--interactive-pill-bg)",
            color: "var(--interactive-pill-text)",
            fontSize: 11,
            fontWeight: 700,
            border: "1px solid var(--interactive-pill-border)",
          }}
        >
          {progressLabel}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 28px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--interactive-kicker)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 800,
            }}
          >
            Linux Foundations
          </div>

          <h2
            style={{
              fontSize: 32,
              lineHeight: 1.1,
              fontWeight: 900,
              color: "var(--color-text)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {activeSlide.heading}
          </h2>

          <SceneIllustration slideId={activeSlide.id} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              color: "var(--interactive-body)",
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            {activeSlide.body.split("\n\n").map((paragraph, index) => (
              <p key={`${activeSlide.id}-${index}`} style={{ margin: 0 }}>
                {paragraph}
              </p>
            ))}
          </div>

          {activeSlide.bullets && activeSlide.bullets.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 6,
              }}
            >
              {activeSlide.bullets.map((bullet) => (
                <div
                  key={bullet}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "var(--interactive-card-bg)",
                    border: "1px solid var(--interactive-card-border)",
                    color: "var(--color-text)",
                  }}
                >
                  <span
                    style={{ color: "var(--color-emerald)", fontWeight: 900 }}
                  >
                    •
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          borderTop: "1px solid var(--interactive-divider)",
          flexShrink: 0,
          background: "var(--interactive-footer-bg)",
        }}
      >
        <button
          onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
          disabled={slideIndex === 0}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--interactive-card-border)",
            background: "var(--interactive-card-bg)",
            color:
              slideIndex === 0
                ? "var(--interactive-muted)"
                : "var(--color-text)",
            cursor: slideIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          Back
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  index === slideIndex
                    ? "var(--color-emerald)"
                    : "var(--interactive-dot)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (isLastSlide) {
              onCompleted?.(stepId);
              return;
            }

            setSlideIndex((index) => Math.min(slides.length - 1, index + 1));
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(34,197,94,0.24)",
            background: "rgba(34,197,94,0.12)",
            color: "var(--color-emerald)",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          {isLastSlide ? "Continue" : "Next"}
        </button>
      </div>
    </div>
  );
}

function SceneIllustration({ slideId }: { slideId: string }) {
  if (slideId === "hardware-parts") {
    return (
      <div style={illustrationShell}>
        <div style={illustrationTitle}>System parts working together</div>
        <div style={hardwareGrid}>
          {[
            ["CPU", "Executes instructions"],
            ["Memory", "Holds active working data"],
            ["Storage", "Keeps information over time"],
            ["Input / Output", "Connects the machine outward"],
          ].map(([name, label]) => (
            <div key={name} style={illustrationCard}>
              <div style={illustrationMetric}>{name}</div>
              <div style={illustrationCaption}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slideId === "os-manages-resources") {
    return (
      <div style={illustrationShell}>
        <div style={illustrationTitle}>
          The operating system coordinates the machine
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={layerBoxPrimary}>Applications</div>
          <div style={layerBoxAccent}>Operating System</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            <div style={layerBoxMuted}>CPU</div>
            <div style={layerBoxMuted}>Memory</div>
            <div style={layerBoxMuted}>Storage</div>
          </div>
        </div>
      </div>
    );
  }

  if (slideId === "storage-bits") {
    return (
      <div style={illustrationShell}>
        <div style={illustrationTitle}>Storage from bits to blocks</div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["1", "0", "1", "1", "0", "0", "1", "0"].map((bit, index) => (
              <div key={`${bit}-${index}`} style={bitCell}>
                {bit}
              </div>
            ))}
          </div>
          <div
            style={{
              color: "var(--interactive-muted)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {"bits -> bytes -> blocks"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} style={blockCell}>
                block {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slideId === "files-and-directories") {
    return (
      <div style={illustrationShell}>
        <div style={illustrationTitle}>
          The filesystem gives storage names and paths
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={dirRow}>
            <span>📁 /</span>
          </div>
          <div style={{ paddingLeft: 18, display: "grid", gap: 8 }}>
            <div style={dirRow}>
              <span>📁 home</span>
            </div>
            <div style={{ paddingLeft: 18, display: "grid", gap: 8 }}>
              <div style={dirRow}>
                <span>📁 student</span>
              </div>
              <div style={{ paddingLeft: 18, display: "grid", gap: 8 }}>
                <div style={fileRow}>
                  <span>📄 notes.txt</span>
                </div>
                <div style={dirRow}>
                  <span>📁 projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={illustrationShell}>
      <div style={illustrationTitle}>From curiosity to systems thinking</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <div style={illustrationCard}>
          <div style={illustrationMetric}>See</div>
          <div style={illustrationCaption}>Look beneath the surface</div>
        </div>
        <div style={illustrationCard}>
          <div style={illustrationMetric}>Reason</div>
          <div style={illustrationCaption}>Understand structure</div>
        </div>
        <div style={illustrationCard}>
          <div style={illustrationMetric}>Build</div>
          <div style={illustrationCaption}>
            Use that understanding in practice
          </div>
        </div>
      </div>
    </div>
  );
}

const illustrationShell: CSSProperties = {
  padding: "18px 18px",
  borderRadius: 16,
  background: "var(--interactive-card-bg)",
  border: "1px solid var(--interactive-card-border)",
  display: "grid",
  gap: 14,
};

const illustrationTitle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--interactive-kicker)",
};

const hardwareGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const illustrationCard: CSSProperties = {
  padding: "14px 14px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.38)",
  border: "1px solid var(--interactive-card-border)",
  display: "grid",
  gap: 6,
};

const illustrationMetric: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "var(--color-text)",
  letterSpacing: "-0.02em",
};

const illustrationCaption: CSSProperties = {
  fontSize: 12,
  color: "var(--interactive-body)",
  lineHeight: 1.5,
};

const layerBoxPrimary: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.42)",
  border: "1px solid var(--interactive-card-border)",
  textAlign: "center",
  fontWeight: 800,
  color: "var(--color-text)",
};

const layerBoxAccent: CSSProperties = {
  ...layerBoxPrimary,
  background: "var(--interactive-pill-bg)",
  color: "var(--interactive-pill-text)",
};

const layerBoxMuted: CSSProperties = {
  ...layerBoxPrimary,
  fontSize: 13,
};

const bitCell: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "var(--interactive-pill-bg)",
  border: "1px solid var(--interactive-pill-border)",
  color: "var(--interactive-pill-text)",
  fontWeight: 800,
  fontFamily: "var(--font-mono)",
};

const blockCell: CSSProperties = {
  padding: "10px 8px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.42)",
  border: "1px solid var(--interactive-card-border)",
  fontSize: 11,
  textAlign: "center",
  color: "var(--interactive-body)",
  fontWeight: 700,
};

const dirRow: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "var(--color-cyan-muted)",
  border: "1px solid rgba(6,182,212,0.18)",
  color: "var(--color-text)",
  fontWeight: 700,
};

const fileRow: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "var(--color-amber-muted)",
  border: "1px solid rgba(245,158,11,0.18)",
  color: "var(--color-text)",
  fontWeight: 700,
};
