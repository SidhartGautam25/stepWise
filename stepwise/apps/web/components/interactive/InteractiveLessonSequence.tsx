"use client";

/**
 * InteractiveLessonSequence — pure renderer.
 *
 * This component does nothing except:
 *  1. Accept the lesson data from the server
 *  2. Call LessonSequenceShell (engine) with that data
 *  3. Pass getSlideIllustration (registry) as the render prop
 *
 * To change what a slide looks like → edit slide-registry.tsx
 * To change slide content/text     → edit the JSON files in /challenges/
 * To add a UI primitive            → edit @repo/interactive-engine
 * To add slide data                → edit @repo/lesson-content
 */

import type { InteractiveLesson } from "@/lib/api";
import { LessonSequenceShell } from "@repo/interactive-engine";
import { getSlideIllustration } from "./slide-registry";

interface InteractiveLessonSequenceProps {
  lesson: InteractiveLesson;
  stepId: string;
  onCompleted?: (stepId: string) => void;
}

export function InteractiveLessonSequence({
  lesson,
  stepId,
  onCompleted,
}: InteractiveLessonSequenceProps) {
  return (
    <LessonSequenceShell
      slides={lesson.slides}
      stepId={stepId}
      onCompleted={onCompleted}
      renderIllustration={getSlideIllustration}
    />
  );
}
