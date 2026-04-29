"use client";

import type { ChallengeDetail } from "@/lib/api";
import { renderIllustration, type IllustrationConfig } from "@repo/interactive-engine";

interface StepVisualizerPanelProps {
  step: ChallengeDetail["steps"][number] | undefined;
  terminalState: any;
  isGit: boolean;
  onCompleted: (stepId: string) => void;
}

export function StepVisualizerPanel({
  step,
  terminalState,
  isGit,
  onCompleted,
}: StepVisualizerPanelProps) {
  if (!step?.renderConfig) return null;

  return renderIllustration(step.renderConfig as IllustrationConfig, {
    terminalState,
    isGit,
    onCompleted,
  });
}
