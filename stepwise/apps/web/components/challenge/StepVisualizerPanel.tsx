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
    const legacyConfig = isRecord(step.renderConfig) ? step.renderConfig : undefined;
    const legacyType =
      legacyConfig?.type === "LessonTerminalVisualWorkspace" ||
      legacyConfig?.type === "LessonSequence"
        ? legacyConfig
        : undefined;

    return {
      ...legacyType,
      type: "LessonSequence",
      stepId: step.id,
      title:
        readString(legacyType?.title) ??
        readString(legacyType?.lessonTitle) ??
        "Interactive Lesson",
      subtitle:
        readString(legacyType?.subtitle) ??
        readString(legacyType?.lessonSubtitle) ??
        "Explore the idea, then try it.",
      slides: step.interactiveLesson.slides,
    } as IllustrationConfig;
  }

  if (isRecord(step.renderConfig) && step.renderConfig.type !== "VisualWorld") {
    return step.renderConfig as unknown as IllustrationConfig;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
