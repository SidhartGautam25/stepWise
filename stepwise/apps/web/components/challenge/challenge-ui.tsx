"use client";

import type { ChallengeDetail } from "@/lib/api";

export type ViewMode = "visualizer" | "content" | "split-v" | "split-h";
export type TerminalMode = "right" | "bottom" | "hidden";

type StepInfo = ChallengeDetail["steps"][number];

interface StepRailProps {
  steps: StepInfo[];
  activeStepId: string;
  passedStepIds: string[];
  highestUnlockedIndex?: number;
  lockFutureSteps?: boolean;
  variant?: "web" | "page";
  onSelectStep: (stepId: string) => void;
}

export function StepRail({
  steps,
  activeStepId,
  passedStepIds,
  highestUnlockedIndex = steps.length - 1,
  lockFutureSteps = false,
  variant = "web",
  onSelectStep,
}: StepRailProps) {
  return (
    <div className={variant === "web" ? "challenge-step-rail" : "challenge-step-rail challenge-step-rail-page"}>
      <div className="challenge-step-rail-heading">
        {variant === "web" ? "Curriculum" : "Curriculum Steps"}
      </div>
      <div className="challenge-step-list">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isPassed = passedStepIds.includes(step.id);
          const isLocked = lockFutureSteps && !isPassed && index > highestUnlockedIndex;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="challenge-step-row"
              data-locked={isLocked || undefined}
            >
              <div className="challenge-step-marker">
                <div
                  className={`step-dot ${isPassed ? "step-dot-done" : isActive ? "step-dot-current" : "step-dot-locked"}`}
                >
                  {isPassed ? "✓" : index + 1}
                </div>
                {!isLast && <div className="challenge-step-line" />}
              </div>
              <button
                className="challenge-step-button"
                onClick={() => {
                  if (!isLocked) onSelectStep(step.id);
                }}
                disabled={isLocked}
              >
                <span
                  className="challenge-step-title"
                  data-active={isActive || undefined}
                  data-passed={isPassed || undefined}
                >
                  {step.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<{ id: T; label: string }>;
  tone?: "indigo" | "emerald";
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  tone = "indigo",
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="challenge-segmented-control" data-tone={tone}>
      {options.map((option) => (
        <button
          key={option.id}
          className="challenge-segmented-button"
          data-active={value === option.id || undefined}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SuccessToastProps {
  message: string;
}

export function SuccessToast({ message }: SuccessToastProps) {
  if (!message) return null;

  return (
    <>
      <div className="challenge-success-toast">{message}</div>
      {["10%", "30%", "50%", "70%", "90%"].map((left, index) => (
        <div
          key={left}
          className="challenge-success-burst"
          style={{ left, animationDelay: `${[0.1, 0.3, 0, 0.2, 0.4][index]}s` }}
        >
          {["*", "+", "^", "+", "*"][index]}
        </div>
      ))}
    </>
  );
}
