"use client";

/**
 * InteractiveLessonSequence
 *
 * Renders the animated, slide-based interactive lesson panel.
 *
 * ─── Data flow ───────────────────────────────────────────────────────────────
 *  Slide content (headings, body, bullets)
 *    → comes from the server via the API (parsed from challenge JSON on disk)
 *
 *  Illustration data (item labels, reveal text, simulation steps, etc.)
 *    → comes from @repo/lesson-content  ← single source of truth, edit there
 *
 *  Illustration components (interactive UI primitives)
 *    → come from @repo/interactive-engine  ← reusable across all quests
 *
 * To add a new quest's slides: add data to @repo/lesson-content, add a new
 * case in SceneIllustration below, wire up an engine component and you're done.
 */

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { InteractiveLesson } from "@/lib/api";

// ── Interactive UI primitives — @repo/interactive-engine ─────────────────────
import {
  ExpandableCardList,
  ClickRevealGrid,
  StepSimulator,
  ComparePanel,
  JourneyFlow,
  InteractiveBuckets,
  CollapsibleTree,
  FileNavigator,
  InfoCallout,
  T,
} from "@repo/interactive-engine";

// ── Illustration data — @repo/lesson-content (single source of truth) ────────
import {
  WELCOME_HELLO_ITEMS,
  WELCOME_EVERYDAY_ACTIVITIES,
  WELCOME_MANAGER_ACTORS,
  WELCOME_MANAGER_STEPS,
  STORAGE_JOURNEY_STEPS,
  STORAGE_FOLDER_TREE,
  HOME_FOLDER_TREE,
  type FolderTree,
} from "@repo/lesson-content";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface InteractiveLessonSequenceProps {
  lesson: InteractiveLesson;
  stepId: string;
  onCompleted?: (stepId: string) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InteractiveLessonSequence({
  lesson,
  stepId,
  onCompleted,
}: InteractiveLessonSequenceProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = lesson.slides;
  const activeSlide = slides[slideIndex];
  const isLastSlide = slideIndex === slides.length - 1;

  useEffect(() => { setSlideIndex(0); }, [stepId]);

  const progressLabel = useMemo(
    () => `${slideIndex + 1} / ${slides.length}`,
    [slideIndex, slides.length],
  );

  if (!activeSlide) return null;

  return (
    <div style={outerShell}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Interactive Lesson
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            Explore the idea, then try it.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {slides.map((s, i) => (
              <div key={s.id} style={{ width: 7, height: 7, borderRadius: "50%", transition: "background 0.3s", background: i === slideIndex ? T.emerald : i < slideIndex ? T.emeraldAlpha(0.4) : T.dot }} />
            ))}
          </div>
          <div style={{ padding: "4px 9px", borderRadius: 999, background: T.pillBg, color: T.pillText, fontSize: 11, fontWeight: 700, border: `1px solid ${T.pillBorder}` }}>
            {progressLabel}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 22px 16px" }}>
        {/* Re-mount illustration when slide changes so interactive state resets */}
        <div key={activeSlide.id} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 21, lineHeight: 1.25, fontWeight: 900, color: T.text, letterSpacing: "-0.02em", margin: 0, wordBreak: "break-word" }}>
            {activeSlide.heading}
          </h2>

          {/* Illustration driven by slide ID — data from @repo/lesson-content */}
          <SceneIllustration slideId={activeSlide.id} />

          {/* Body paragraphs — from server JSON */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, color: T.body, fontSize: 13.5, lineHeight: 1.8 }}>
            {activeSlide.body.split("\n\n").map((p, i) => (
              <p key={i} style={{ margin: 0, wordBreak: "break-word" }}>{p}</p>
            ))}
          </div>

          {/* Key bullets — from server JSON */}
          {activeSlide.bullets && activeSlide.bullets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeSlide.bullets.map((bullet) => (
                <div key={bullet} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 9, background: T.cardBg, border: `1px solid ${T.cardBorder}`, fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: T.text, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div style={footerStyle}>
        <button
          onClick={() => setSlideIndex(i => Math.max(0, i - 1))}
          disabled={slideIndex === 0}
          style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.cardBg, color: slideIndex === 0 ? T.muted : T.text, cursor: slideIndex === 0 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13 }}
        >
          ← Back
        </button>
        <button
          onClick={() => { if (isLastSlide) { onCompleted?.(stepId); return; } setSlideIndex(i => Math.min(slides.length - 1, i + 1)); }}
          style={{ padding: "9px 22px", borderRadius: 8, border: `1px solid ${T.emeraldAlpha(0.35)}`, background: isLastSlide ? T.emeraldAlpha(0.18) : T.emeraldAlpha(0.08), color: T.emerald, cursor: "pointer", fontWeight: 800, fontSize: 13, transition: "background 0.2s" }}
        >
          {isLastSlide ? "✓ Got it →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ─── Illustration router ──────────────────────────────────────────────────────
// Maps each slide ID to a specific interactive engine component + data.
// To add a new slide, add a case here and export data from @repo/lesson-content.

function SceneIllustration({ slideId }: { slideId: string }) {
  // ── linux-aethera / 00-welcome ────────────────────────────────────────────

  if (slideId === "welcome-hello") {
    return (
      <ExpandableCardList
        hint="Tap a card to learn more"
        items={WELCOME_HELLO_ITEMS}
      />
    );
  }

  if (slideId === "welcome-everyday") {
    return (
      <ClickRevealGrid
        hint="Tap something you do every day — see what the OS does for it"
        items={WELCOME_EVERYDAY_ACTIVITIES.map(a => ({ id: a.id, icon: a.icon, label: a.label, detail: a.os }))}
        columns={2}
        detailLabel="What the OS did →"
      />
    );
  }

  if (slideId === "welcome-manager") {
    return (
      <StepSimulator
        hint="Simulate a restaurant — click Send Order"
        actors={WELCOME_MANAGER_ACTORS}
        steps={WELCOME_MANAGER_STEPS}
        startLabel="▶ Send Order"
        nextLabel="→ Next step"
        doneMessage="✅ Order complete! The OS kept everything smooth."
      />
    );
  }

  if (slideId === "welcome-linux") {
    return (
      <ComparePanel
        hint="Click each box to explore"
        left={{
          icon: "🔒",
          title: "Windows / Mac",
          color: T.redAlpha(0.06),
          border: T.redAlpha(0.25),
          locked: true,
          lockedMessage: "🚫 Access denied. This is a closed box — no peeking allowed.",
          closedHint: "Click to look inside →",
        }}
        right={{
          icon: "📦",
          title: "Linux",
          color: T.emeraldAlpha(0.06),
          border: T.emeraldAlpha(0.3),
          closedHint: "Click to open →",
          revealContent: ["🔍 See how it works", "✏️ Change anything", "📚 Learn deeply", "🚀 Used everywhere"],
        }}
        successMessage="🎉 That's why we're using Linux — everything is visible and learnable!"
      />
    );
  }

  // ── linux-aethera / 00-why-os (storage) ───────────────────────────────────

  if (slideId === "storage-your-stuff") {
    return (
      <JourneyFlow
        hint="Walk through what actually happens — click to go step by step"
        steps={STORAGE_JOURNEY_STEPS}
        storeIcon="💾"
        storeLabel="Storage"
        startLabel="▶ Start the journey"
        nextLabel="→ Next"
      />
    );
  }

  if (slideId === "storage-vs-memory") {
    return (
      <InteractiveBuckets
        hint="Click books to move them between shelf and desk"
        items={["📖 Photo Album", "📝 School Notes", "🎵 Music Files", "📋 Documents"]}
        source={{
          label: "Bookshelf = Storage",
          sublabel: "Permanent. Always there.",
          icon: "📚",
          color: T.emeraldAlpha(0.1),
          border: T.emeraldAlpha(0.35),
        }}
        destination={{
          label: "Desk = Workspace",
          sublabel: "What you're using now.",
          icon: "🖥️",
          color: T.amberAlpha(0.1),
          border: T.amberAlpha(0.35),
        }}
        destinationTip="Books on the desk disappear if the power goes out. Books on the shelf stay forever."
      />
    );
  }

  if (slideId === "storage-folders") {
    // Convert @repo/lesson-content FolderTree → @repo/interactive-engine TreeNode
    const toTreeNode = (n: FolderTree): import("@repo/interactive-engine").TreeNode => ({
      name: n.name,
      type: n.type,
      children: n.children?.map(toTreeNode),
    });
    return (
      <CollapsibleTree
        hint="Click the folders to expand them"
        tree={toTreeNode(STORAGE_FOLDER_TREE)}
        tip="📁 = Folder (a group)  |  📄 = File (one piece of stuff)"
      />
    );
  }

  if (slideId === "storage-your-home") {
    return (
      <>
        <FileNavigator
          hint="Navigate your home folder — click folders to enter"
          tree={HOME_FOLDER_TREE as import("@repo/interactive-engine").FileSystemTree}
          rootLabel="🏠 home/student"
          tip="This is exactly how Linux works. You'll navigate real folders like this in the terminal!"
        />
        <InfoCallout
          variant="success"
          icon="🔑"
          text="This space is yours. Other users can't touch your files."
        />
      </>
    );
  }

  // ── Default fallback ───────────────────────────────────────────────────────

  return (
    <InfoCallout
      variant="info"
      icon="💡"
      text="Visual illustration coming soon for this slide."
    />
  );
}

// ─── Shared layout styles ─────────────────────────────────────────────────────

const outerShell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  background: "radial-gradient(circle at top left, var(--interactive-spot-1), transparent 32%), radial-gradient(circle at bottom right, var(--interactive-spot-2), transparent 36%), linear-gradient(180deg, var(--interactive-bg-top), var(--interactive-bg-bottom))",
  borderRadius: 12,
  border: "1px solid var(--interactive-border)",
  boxShadow: "0 18px 40px var(--interactive-shadow)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 18px",
  borderBottom: "1px solid var(--interactive-divider)",
  flexShrink: 0,
  gap: 12,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "12px 18px",
  borderTop: "1px solid var(--interactive-divider)",
  flexShrink: 0,
  background: T.footerBg,
};
