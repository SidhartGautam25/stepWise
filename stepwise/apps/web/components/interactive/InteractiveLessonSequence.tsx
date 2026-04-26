"use client";

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
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 30%), linear-gradient(180deg, rgba(8,8,24,0.98), rgba(10,10,22,0.95))",
        borderRadius: 12,
        border: "1px solid var(--color-border-glass)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
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
              color: "var(--color-muted)",
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
            background: "rgba(99,102,241,0.16)",
            color: "var(--color-indigo-light)",
            fontSize: 11,
            fontWeight: 700,
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          {progressLabel}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "28px 24px 20px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 0.8fr)",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--color-cyan)",
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              color: "var(--color-muted)",
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
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "var(--color-text)",
                  }}
                >
                  <span style={{ color: "var(--color-emerald)", fontWeight: 900 }}>
                    •
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6 }}>{bullet}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            alignContent: "start",
            gap: 12,
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === slideIndex;

            return (
              <button
                key={slide.id}
                onClick={() => setSlideIndex(index)}
                style={{
                  textAlign: "left",
                  padding: "14px 14px",
                  borderRadius: 12,
                  border: isActive
                    ? "1px solid rgba(34,197,94,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isActive
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: isActive ? "var(--color-emerald)" : "var(--color-muted)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  Scene {index + 1}
                </div>
                <div
                  style={{
                    color: "var(--color-text)",
                    fontSize: 14,
                    fontWeight: isActive ? 800 : 600,
                    lineHeight: 1.4,
                  }}
                >
                  {slide.heading}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
          background: "rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
          disabled={slideIndex === 0}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: slideIndex === 0 ? "var(--color-muted)" : "var(--color-text)",
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
                    : "rgba(255,255,255,0.16)",
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
            border: "1px solid rgba(34,197,94,0.28)",
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
