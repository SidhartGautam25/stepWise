"use client";

/**
 * Slide Registry
 *
 * Looks up the IllustrationConfig for a slide ID and renders it automatically.
 *
 * ── To add a new slide illustration ──────────────────────────────────────────
 *  Edit: packages/lesson-content/src/<quest>/slide-configs.ts
 *  Add a key for the new slideId and fill in the typed config object.
 *  No changes needed in this file or in InteractiveLessonSequence.tsx.
 *
 * ── To add a new component type ──────────────────────────────────────────────
 *  1. Build the component in @repo/interactive-engine/src/components/
 *  2. Add its variant to IllustrationConfig (IllustrationConfig.ts)
 *  3. Add a case in renderIllustration.tsx
 *  4. Use the new type in any slide-configs.ts
 */

import type { ReactNode } from "react";
import { renderIllustration } from "@repo/interactive-engine";
import { LINUX_SLIDE_CONFIGS, GIT_SLIDE_CONFIGS } from "@repo/lesson-content";

// ── All quest registries merged — add new quests here as you build them ───────
const ALL_SLIDE_CONFIGS = {
  ...LINUX_SLIDE_CONFIGS,
  ...GIT_SLIDE_CONFIGS,
  // ...NEXT_QUEST_CONFIGS,   ← just spread in the next package export
};

export function getSlideIllustration(slideId: string): ReactNode {
  const config = ALL_SLIDE_CONFIGS[slideId];
  return config ? renderIllustration(config) : null;
}
