/**
 * git-aethera — Illustration Data v2
 *
 * Pure data objects for all interactive git lesson slides.
 * No React. No JSX. Just typed arrays and objects.
 *
 * Narrative: Welcome → Kavya's problems → Snapshot idea → Meet Git → Terminal practice → Branching
 */

import type { CommitNode } from "@repo/interactive-engine";

// ── Staging files demo (used in 00-git-the-answer / git-why-staging) ──────────

export const STAGING_FILES_DEMO = [
  { name: "README.md",  status: "untracked" as const, icon: "📝" },
  { name: "login.js",   status: "modified"  as const, icon: "🔐" },
  { name: "style.css",  status: "staged"    as const, icon: "🎨" },
  { name: "app.js",     status: "committed" as const, icon: "📦" },
];

// ── Kavya's clean commit history (used in snapshot-timeline slide) ────────────
export const KAVYA_COMMITS: CommitNode[] = [
  {
    id: "a1b2c3d",
    message: "Start todo app — basic structure",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "The very first snapshot. Everything from this moment is saved forever.",
  },
  {
    id: "f4e5d6c",
    message: "Add: checkbox to mark tasks done",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "Second snapshot. Clear label — you know exactly what this adds.",
  },
  {
    id: "9g8h7i6",
    message: "Fix: checkboxes disappearing on mobile",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "Third snapshot. A bug fix. If this bug ever comes back, this is the snapshot to look at.",
  },
  {
    id: "j1k2l3m",
    message: "Add: delete button for each task",
    branch: "main",
    isHead: true,
    color: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.6)",
    detail: "Most recent snapshot. HEAD points here — this is where you are now.",
  },
];

// ── Branch commits (Kavya: main + dark mode experiment) ──────────────────────
export const BRANCH_COMMITS: CommitNode[] = [
  {
    id: "a1b2c3d",
    message: "Working todo app",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "Starting point for both branches — main stayed stable while dark mode was being explored.",
  },
  {
    id: "f4e5d6c",
    message: "Add delete feature",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "Kavya continued working on main — adding features while the experiment ran separately.",
  },
  {
    id: "dm1k2l3",
    message: "Start dark mode experiment",
    branch: "feature/darkmode",
    color: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.5)",
    detail: "Kavya created this branch from main — her experiment lives here, not in main.",
  },
  {
    id: "dm2o5p6",
    message: "Tweak dark mode contrast",
    branch: "feature/darkmode",
    color: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.5)",
    detail: "More iterations — completely safe. Main is untouched throughout.",
  },
  {
    id: "dm3r7s8",
    message: "Dark mode working!",
    branch: "feature/darkmode",
    isHead: true,
    color: "rgba(99,102,241,0.15)",
    border: "rgba(99,102,241,0.6)",
    detail: "HEAD on the feature branch. When Kavya is happy here — she merges into main. If not — delete the branch!",
  },
  {
    id: "9g8h7i6",
    message: "Fix spacing on mobile",
    branch: "main",
    color: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.5)",
    detail: "Main continued evolving independently. Two timelines, zero interference.",
  },
];
