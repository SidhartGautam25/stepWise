/**
 * components/home/CourseCard.tsx
 * Course/track card — language icon, title, description, quest count, difficulty badge.
 * Driven by Course type from lib/courses.ts.
 */

import React from "react";
import Link from "next/link";
import type { Course } from "@/lib/courses";
import { StatBadge } from "./StatBadge";

interface CourseCardProps {
  course: Course;
}

const difficultyVariant = {
  Beginner:     "emerald",
  Intermediate: "amber",
  Advanced:     "rose",
} as const;

export function CourseCard({ course }: CourseCardProps) {
  const isComingSoon = course.status === "coming-soon";

  const cardInner = (
    <div
      className={`glass card-hover`}
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity: isComingSoon ? 0.72 : 1,
        cursor: isComingSoon ? "default" : "pointer",
        background: `var(--color-surface-glass)`,
      }}
    >
      {/* Decorative gradient bloom */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `var(--color-${course.accentColor}-muted)`,
          filter: "blur(40px)",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            background: `var(--color-${course.accentColor}-muted)`,
            border: `1px solid var(--color-border)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {course.icon}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {isComingSoon && (
            <StatBadge variant="ghost">Soon</StatBadge>
          )}
          <StatBadge variant={difficultyVariant[course.difficulty]}>
            {course.difficulty}
          </StatBadge>
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: `var(--color-${course.accentColor})`,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {course.language}
        </div>
        <h3
          style={{
            fontSize: "var(--text-md)",
            fontWeight: 800,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </h3>
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-muted)",
            marginBottom: 10,
            fontStyle: "italic",
          }}
        >
          {course.tagline}
        </p>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-muted)",
            lineHeight: 1.68,
          }}
        >
          {course.description}
        </p>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {course.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="badge badge-ghost"
            style={{ fontSize: "var(--text-xs)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 14,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", fontWeight: 500 }}>
          {course.questCount} guided quests
        </span>
        {!isComingSoon && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              color: `var(--color-${course.accentColor})`,
            }}
          >
            Explore →
          </span>
        )}
      </div>
    </div>
  );

  if (isComingSoon) return <div style={{ height: "100%" }}>{cardInner}</div>;

  return (
    <Link
      href={`/challenges?language=${encodeURIComponent(course.language)}`}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      {cardInner}
    </Link>
  );
}
