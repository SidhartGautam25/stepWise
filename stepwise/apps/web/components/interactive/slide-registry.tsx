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
import { SimulatedTerminal } from "@repo/terminal-engine";
import { ALL_SLIDE_CONFIGS } from "@repo/lesson-content";

export function getSlideIllustration(slideId: string): ReactNode {
  const config = ALL_SLIDE_CONFIGS[slideId];
  if (!config) return null;
  if (config.type === "SimulatedTerminal") {
    return (
      <SimulatedTerminal
        language={config.language}
        hint={config.hint}
          initialVfs={config.initialVfs as any}
        preHistory={config.preHistory}
        height={config.height ?? 280}
      />
    );
  }
  return renderIllustration(config);
}
