/**
 * linux-aethera — Slide Illustration Configs
 *
 * Maps every slide ID to a plain IllustrationConfig data object.
 * No JSX. No React. Just typed data.
 *
 * The @repo/interactive-engine renderIllustration() function reads these
 * configs and automatically renders the right component.
 *
 * ── To add a new slide ────────────────────────────────────────────────────────
 * 1. Pick a component type from IllustrationConfig
 * 2. Add a new key below with the slide ID as the key
 * 3. Fill in the props — TypeScript will guide you via the discriminated union
 * That's it. No changes in any React file needed.
 */

import type {
  IllustrationConfig,
  TreeNode,
  FileSystemTree,
  ExpandableCardItem,
  SimActor,
  SimStep,
  JourneyStep,
} from "@repo/interactive-engine";

import {
  WELCOME_HELLO_ITEMS,
  WELCOME_EVERYDAY_ACTIVITIES,
  WELCOME_MANAGER_ACTORS,
  WELCOME_MANAGER_STEPS,
  STORAGE_JOURNEY_STEPS,
  STORAGE_FOLDER_TREE,
  HOME_FOLDER_TREE,
} from "./illustrations";

// Structurally identical casts — TypeScript treats these as compatible shapes
// but needs explicit guidance since they come from separate packages.
const helloItems    = WELCOME_HELLO_ITEMS    as unknown as ExpandableCardItem[];
const managerActors = WELCOME_MANAGER_ACTORS as unknown as SimActor[];
const managerSteps  = WELCOME_MANAGER_STEPS  as unknown as SimStep[];
const journeySteps  = STORAGE_JOURNEY_STEPS  as unknown as JourneyStep[];
const folderTree    = STORAGE_FOLDER_TREE    as unknown as TreeNode;
const homeTree      = HOME_FOLDER_TREE       as unknown as FileSystemTree;

// ─── Slide configs ────────────────────────────────────────────────────────────

export const LINUX_SLIDE_CONFIGS: Record<string, IllustrationConfig> = {

  // ── 00-welcome ──────────────────────────────────────────────────────────────

  "welcome-hello": {
    type: "ExpandableCardList",
    hint: "Tap a card to learn more",
    items: helloItems,
  },

  "welcome-everyday": {
    type: "ClickRevealGrid",
    hint: "Tap something you do every day — see what the OS does for it",
    columns: 2,
    detailLabel: "What the OS did →",
    items: WELCOME_EVERYDAY_ACTIVITIES.map((a) => ({
      id: a.id,
      icon: a.icon,
      label: a.label,
      detail: a.os,
    })),
  },

  "welcome-manager": {
    type: "StepSimulator",
    hint: "Simulate a restaurant — click Send Order",
    actors: managerActors,
    steps: managerSteps,
    startLabel: "▶ Send Order",
    nextLabel: "→ Next step",
    doneMessage: "✅ Order complete! The OS kept everything smooth.",
  },

  "welcome-linux": {
    type: "ComparePanel",
    hint: "Click each box to explore",
    left: {
      icon: "🔒",
      title: "Windows / Mac",
      color: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.25)",
      locked: true,
      lockedMessage: "🚫 Access denied. This is a closed box — no peeking allowed.",
      closedHint: "Click to look inside →",
    },
    right: {
      icon: "📦",
      title: "Linux",
      color: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.3)",
      closedHint: "Click to open →",
      revealContent: [
        "🔍 See how it works",
        "✏️ Change anything",
        "📚 Learn deeply",
        "🚀 Used everywhere",
      ],
    },
    successMessage: "🎉 That's why we're using Linux — everything is visible and learnable!",
  },

  // ── 00-why-os (storage) ─────────────────────────────────────────────────────

  "storage-your-stuff": {
    type: "JourneyFlow",
    hint: "Walk through what actually happens — click to go step by step",
    steps: journeySteps,
    storeIcon: "💾",
    storeLabel: "Storage",
    startLabel: "▶ Start the journey",
    nextLabel: "→ Next",
  },

  "storage-vs-memory": {
    type: "InteractiveBuckets",
    hint: "Click books to move them between shelf and desk",
    items: ["📖 Photo Album", "📝 School Notes", "🎵 Music Files", "📋 Documents"],
    source: {
      label: "Bookshelf = Storage",
      sublabel: "Permanent. Always there.",
      icon: "📚",
      color: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.35)",
    },
    destination: {
      label: "Desk = Workspace",
      sublabel: "What you're using now.",
      icon: "🖥️",
      color: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.35)",
    },
    destinationTip:
      "Books on the desk disappear if the power goes out. Books on the shelf stay forever.",
  },

  "storage-folders": {
    type: "CollapsibleTree",
    hint: "Click the folders to expand them",
    tree: folderTree,
    tip: "📁 = Folder (a group)  |  📄 = File (one piece of stuff)",
  },

  "storage-your-home": {
    type: "Multi",
    gap: 12,
    illustrations: [
      {
        type: "FileNavigator",
        hint: "Navigate your home folder — click folders to enter",
        tree: homeTree,
        rootLabel: "🏠 home/student",
        tip: "This is exactly how Linux works. You'll navigate real folders like this in the terminal!",
      },
      {
        type: "InfoCallout",
        variant: "success",
        icon: "🔑",
        text: "This space is yours. Other users on this computer can't touch your files.",
      },
    ],
  },
};
