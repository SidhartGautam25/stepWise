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
  if (step?.interactiveLesson?.type === "sequence") {
    const slideIllustrations = Object.fromEntries(
      step.interactiveLesson.slides.flatMap((slide) =>
        slide.illustration
          ? [[slide.id, slide.illustration as IllustrationConfig]]
          : [],
      ),
    );

    return renderIllustration({
      type: "LessonSequence",
      stepId: step.id,
      slides: step.interactiveLesson.slides,
      slideIllustrations,
      title: "Interactive Lesson",
      subtitle: "Explore the idea first, then move into the hands-on step.",
      onCompleted,
    });
  }

  return renderIllustration({
    type: "VisualWorld",
    vfs: terminalState.vfs,
    cwd: terminalState.cwd,
    isGit,
    gitInited: terminalState.git?.initialized,
  });
}
