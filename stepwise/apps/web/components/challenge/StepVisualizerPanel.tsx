"use client";

import type { ReactNode } from "react";
import type { ChallengeDetail } from "@/lib/api";
import {
  renderIllustration,
  type IllustrationConfig,
  type RenderIllustrationRuntime,
} from "@repo/interactive-engine";

interface StepVisualizerPanelProps {
  step: ChallengeDetail["steps"][number] | undefined;
  terminalState: unknown;
  isGit: boolean;
  onCompleted: (stepId: string) => void;
  /** Latest successful-terminal snapshot for slide command-advance (`count:trimmed`). */
  terminalAdvanceSignature?: string;
  embeddedTerminalSlot?: ReactNode;
}

export function StepVisualizerPanel({
  step,
  terminalState,
  isGit,
  onCompleted,
  terminalAdvanceSignature,
  embeddedTerminalSlot,
}: StepVisualizerPanelProps) {
  if (!step?.renderConfig) return null;

  return renderIllustration(step.renderConfig as IllustrationConfig, {
    terminalState: terminalState as RenderIllustrationRuntime["terminalState"],
    isGit,
    onCompleted,
    terminalAdvanceSignature,
    terminalSlot: embeddedTerminalSlot,
  });
}
