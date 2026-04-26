"use client";

/**
 * Slide Registry
 *
 * This is the ONLY file you need to touch when adding a new interactive slide illustration.
 *
 * Data:          @repo/lesson-content  (strings, arrays, config objects)
 * UI primitives: @repo/interactive-engine (ExpandableCardList, JourneyFlow, etc.)
 * This file:     wires data → component and exports a registry lookup function
 *
 * InteractiveLessonSequence is a pure renderer — it calls getSlideIllustration(slideId)
 * and renders whatever this registry returns.
 *
 * ── Adding a new slide ────────────────────────────────────────────────────────
 * 1. Add data to packages/lesson-content/src/<quest>/illustrations.ts
 * 2. Import it here
 * 3. Add a new case in getSlideIllustration() below
 * That's it. No changes needed in InteractiveLessonSequence.tsx.
 */

import type { ReactNode } from "react";

// ── Engine primitives ─────────────────────────────────────────────────────────
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
import type { FileSystemTree, TreeNode } from "@repo/interactive-engine";

// ── Illustration data — single source of truth ────────────────────────────────
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

// ─── Registry lookup ──────────────────────────────────────────────────────────

/**
 * Returns the interactive illustration element for a given slide ID.
 * Returns null if no illustration is registered for this slide ID
 * (the shell will still render heading, body, and bullets from server data).
 */
export function getSlideIllustration(slideId: string): ReactNode {
  // ── linux-aethera / 00-welcome ─────────────────────────────────────────────

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
        items={WELCOME_EVERYDAY_ACTIVITIES.map((a) => ({
          id: a.id,
          icon: a.icon,
          label: a.label,
          detail: a.os,
        }))}
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
          revealContent: [
            "🔍 See how it works",
            "✏️ Change anything",
            "📚 Learn deeply",
            "🚀 Used everywhere",
          ],
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
    const toTreeNode = (n: FolderTree): TreeNode => ({
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
          tree={HOME_FOLDER_TREE as unknown as FileSystemTree}
          rootLabel="🏠 home/student"
          tip="This is exactly how Linux works. You'll navigate real folders like this in the terminal!"
        />
        <InfoCallout
          variant="success"
          icon="🔑"
          text="This space is yours. Other users on this computer can't touch your files."
        />
      </>
    );
  }

  // ── Default — no illustration registered for this slide ID ────────────────
  return null;
}
