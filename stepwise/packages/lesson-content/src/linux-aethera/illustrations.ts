/**
 * linux-aethera — Illustration Data
 *
 * All content/strings used by the interactive slide illustrations
 * for the "Intro to Linux" (linux-aethera) quest.
 *
 * Types for items come from @repo/interactive-engine so slide-configs.ts
 * can reference them without any type mismatches.
 *
 * To update slide content, edit the arrays below.
 */

// ── Shared types (re-used here without React dependency) ─────────────────────

/** Matches ExpandableCardItem in @repo/interactive-engine */
export interface ClickItem {
  id: string;
  icon: string;
  label: string;
  /** Maps to the `reveal` field on ExpandableCardItem */
  reveal: string;
}

/** Matches ActivityItem used in ClickRevealGrid items */
export interface ActivityItem {
  id: string;
  icon: string;
  label: string;
  /** The OS explanation — maps to `detail` field in ClickRevealItem */
  os: string;
}

/** Structurally matches TreeNode in @repo/interactive-engine */
export interface FolderTree {
  name: string;
  type: "folder" | "file";
  children?: FolderTree[];
}

// ── Slide: welcome-hello ──────────────────────────────────────────────────────

export const WELCOME_HELLO_ITEMS: ClickItem[] = [
  {
    id: "doing",
    icon: "🧠",
    label: "Learn by doing",
    reveal:
      "Every concept you see here, you'll try yourself in a real terminal. Understanding comes from doing, not just reading.",
  },
  {
    id: "pace",
    icon: "🐢",
    label: "Your own pace",
    reveal:
      "There's no timer. No score. No pressure. Just you learning at whatever speed feels right.",
  },
  {
    id: "curio",
    icon: "✨",
    label: "Curiosity first",
    reveal:
      "You don't need to know anything yet. Just wonder \"how does this work?\" — that single question is enough to start.",
  },
];

// ── Slide: welcome-everyday ───────────────────────────────────────────────────

export const WELCOME_EVERYDAY_ACTIVITIES: ActivityItem[] = [
  {
    id: "music",
    icon: "🎵",
    label: "You pressed play on a song",
    os: "The OS found the music app in storage, loaded it into the workspace, gave it CPU time, and sent audio to your speakers — all in a split second.",
  },
  {
    id: "photo",
    icon: "📸",
    label: "You took a photo",
    os: "The OS grabbed the image from the camera sensor, handed it to the camera app, and wrote the finished file permanently to your storage.",
  },
  {
    id: "app",
    icon: "📱",
    label: "You opened an app",
    os: "The OS located the app in storage, loaded it into the active workspace, gave it screen space, and started sharing CPU time with it.",
  },
  {
    id: "save",
    icon: "💾",
    label: "You saved a document",
    os: "The OS took everything you typed from the temporary workspace and wrote it permanently to storage so it survives a reboot.",
  },
];

// ── Slide: welcome-manager (restaurant simulation) ────────────────────────────
// Types are structurally compatible with SimActor / SimStep in @repo/interactive-engine

export interface SimActorData {
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  border: string;
  isManager?: boolean;
}

export interface SimStepData {
  from: string;
  to: string;
  action: string;
}

export const WELCOME_MANAGER_ACTORS: SimActorData[] = [
  {
    icon: "👨‍🍳",
    label: "Music App",
    sublabel: "wants CPU",
    color: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.3)",
  },
  {
    icon: "👩‍💼",
    label: "OS Manager",
    sublabel: "decides who",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
    isManager: true,
  },
  {
    icon: "🍳",
    label: "CPU",
    sublabel: "the resource",
    color: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
  },
];

export const WELCOME_MANAGER_STEPS: SimStepData[] = [
  { from: "👨‍🍳 Music App", to: "👩‍💼 Manager", action: "\"I need the CPU!\"" },
  { from: "👩‍💼 Manager", to: "🍳 CPU",        action: "\"Music App gets it for 2ms\"" },
  { from: "🍳 CPU",        to: "👨‍🍳 Music App", action: "\"Done! CPU is free again.\"" },
];

// ── Slide: storage-your-stuff ─────────────────────────────────────────────────

export interface JourneyStepData {
  icon: string;
  action: string;
  result: string;
  color: string;
  border: string;
}

export const STORAGE_JOURNEY_STEPS: JourneyStepData[] = [
  {
    icon: "📸",
    action: "Take a photo",
    result: "Photo captured and written to storage!",
    color: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.35)",
  },
  {
    icon: "📱",
    action: "Close the camera app",
    result: "App closed — but photo is still in storage!",
    color: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.35)",
  },
  {
    icon: "🔋",
    action: "Turn off the phone",
    result: "Everything off — photo is STILL safely in storage!",
    color: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.35)",
  },
  {
    icon: "☀️",
    action: "Turn it on next day",
    result: "Photo is safe! 🎉 That's storage doing its job.",
    color: "rgba(34,197,94,0.14)",
    border: "rgba(34,197,94,0.5)",
  },
];

// ── Slide: storage-folders ────────────────────────────────────────────────────

export const STORAGE_FOLDER_TREE: FolderTree = {
  name: "All My Files",
  type: "folder",
  children: [
    {
      name: "Photos",
      type: "folder",
      children: [
        { name: "📄 holiday-2024.jpg", type: "file" },
        { name: "📄 birthday.jpg",     type: "file" },
        { name: "📄 selfie.png",       type: "file" },
      ],
    },
    {
      name: "Music",
      type: "folder",
      children: [
        { name: "🎵 favorites.mp3", type: "file" },
        { name: "🎵 workout.mp3",   type: "file" },
      ],
    },
    { name: "Documents", type: "folder", children: [] },
  ],
};

// ── Slide: storage-your-home (file navigator) ─────────────────────────────────

export const HOME_FOLDER_TREE: Record<string, Record<string, null> | null> = {
  projects: {
    "todo.txt":  null,
    "ideas.md":  null,
  },
  "notes.txt":   null,
  "welcome.txt": null,
};
