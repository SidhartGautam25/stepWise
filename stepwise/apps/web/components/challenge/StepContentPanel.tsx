"use client";

import type { ChallengeDetail } from "@/lib/api";
import { CodeSection } from "../CodeSection";
import { MarkdownViewer } from "../MarkdownViewer";

interface StepContentPanelProps {
  step: ChallengeDetail["steps"][number] | undefined;
  stepIndex: number;
  onOpenVisualizer: () => void;
  onOpenSplitTerminal: () => void;
}

export function StepContentPanel({
  step,
  stepIndex,
  onOpenVisualizer,
  onOpenSplitTerminal,
}: StepContentPanelProps) {
  return (
    <div className="step-content">
      <StepHeader step={step} stepIndex={stepIndex} />
      {step?.prompt && <MarkdownBlock content={step.prompt} />}
      {step?.explanation && <ExplanationBlock content={step.explanation} />}
      <SolutionBlock step={step} />
      <VisualizerCallout
        step={step}
        onOpenVisualizer={onOpenVisualizer}
        onOpenSplitTerminal={onOpenSplitTerminal}
      />
    </div>
  );
}

function StepHeader({
  step,
  stepIndex,
}: Pick<StepContentPanelProps, "step" | "stepIndex">) {
  return (
    <div className="step-content-header">
      <span className="step-content-number">{stepIndex + 1}.</span>
      <h2 className="step-content-title">{step?.title}</h2>
    </div>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="step-markdown">
      <MarkdownViewer content={content} />
    </div>
  );
}

function ExplanationBlock({ content }: { content: string }) {
  return (
    <section className="step-explanation">
      <h4 className="step-section-label">Why this matters</h4>
      <div className="step-explanation-body">
        <MarkdownViewer content={content} />
      </div>
    </section>
  );
}

function SolutionBlock({ step }: Pick<StepContentPanelProps, "step">) {
  const hasCodeFiles = Boolean(step?.codeFiles?.length);
  const hasSolution = Boolean(hasCodeFiles || step?.solution);
  if (!hasSolution) return null;

  return (
    <details className="step-solution">
      <summary className="step-solution-summary">Click to Reveal Solution</summary>
      <div className="step-solution-body">
        {step?.codeFiles && step.codeFiles.length > 0 && (
          <CodeSection files={step.codeFiles} />
        )}
        {step?.solution && (
          <div className="step-solution-code">
            <MarkdownViewer content={`\`\`\`javascript\n${step.solution}\n\`\`\``} />
          </div>
        )}
      </div>
    </details>
  );
}

function VisualizerCallout({
  step,
  onOpenVisualizer,
  onOpenSplitTerminal,
}: Pick<StepContentPanelProps, "step" | "onOpenVisualizer" | "onOpenSplitTerminal">) {
  if (!step?.interactiveLesson) return null;

  const isLesson = Boolean(step?.interactiveLesson);

  return (
    <section className="step-visualizer-callout">
      <div className="step-visualizer-copy">
        <span className="step-visualizer-kind">{isLesson ? "Map" : "CLI"}</span>
        <div>
          <div className="step-visualizer-title">
            {isLesson ? "Ready to see the visual lesson?" : "Ready to enter the Visualizer?"}
          </div>
          <div className="step-visualizer-description">
            {isLesson
              ? "Open the interactive slides to learn visually."
              : "Open your workspace to see files and run commands."}
          </div>
        </div>
      </div>

      <div className="step-visualizer-actions">
        <button className="step-action-primary" onClick={onOpenVisualizer}>
          Open Visualizer
        </button>
        <button className="step-action-secondary" onClick={onOpenSplitTerminal}>
          Split Panel + Terminal Bottom
        </button>
      </div>
    </section>
  );
}
