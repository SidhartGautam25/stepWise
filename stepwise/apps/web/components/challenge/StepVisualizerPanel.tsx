"use client";

import type { ReactNode } from "react";
import type { ChallengeDetail, InteractiveLessonSlide } from "@/lib/api";
import {
  renderIllustration,
  type IllustrationConfig,
  type RenderIllustrationRuntime,
} from "@repo/interactive-engine";
import type { LessonSlide } from "@repo/interactive-engine";

interface StepVisualizerPanelProps {
  step: ChallengeDetail["steps"][number] | undefined;
  terminalState: unknown;
  isGit: boolean;
  onCompleted: (stepId: string) => void;
  mode: "guide" | "visual-world";
  /** Latest successful-terminal snapshot for slide command-advance (`count:trimmed`). */
  terminalAdvanceSignature?: string;
  embeddedTerminalSlot?: ReactNode;
  onActiveSlideChange?: (slide: InteractiveLessonSlide) => void;
}

export function StepVisualizerPanel({
  step,
  terminalState,
  isGit,
  onCompleted,
  mode,
  terminalAdvanceSignature,
  embeddedTerminalSlot,
  onActiveSlideChange,
}: StepVisualizerPanelProps) {
  if (!step) return null;

  if (mode === "visual-world") {
    return renderIllustration({ type: "VisualWorld" } as IllustrationConfig, {
      terminalState: terminalState as RenderIllustrationRuntime["terminalState"],
      isGit,
    });
  }

  const guideConfig = buildGuideConfig(step);
  if (!guideConfig) return null;

  return renderIllustration(guideConfig, {
    terminalState: terminalState as RenderIllustrationRuntime["terminalState"],
    isGit,
    onCompleted,
    terminalAdvanceSignature,
    terminalSlot: embeddedTerminalSlot,
    onActiveSlideChange: onActiveSlideChange as ((slide: LessonSlide) => void) | undefined,
  });
}

function buildGuideConfig(
  step: ChallengeDetail["steps"][number],
): IllustrationConfig | undefined {
  if (step.interactiveLesson?.slides?.length) {
    return {
      type: "LessonSequence",
      stepId: step.id,
      title: "Interactive Lesson",
      subtitle: "Explore the idea, then try it.",
      slides: step.interactiveLesson.slides,
    } as IllustrationConfig;
  }

  return undefined;
}
