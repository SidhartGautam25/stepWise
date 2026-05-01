"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { ChallengeDetail, InteractiveLessonSlide } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useTerminal, SimulatedTerminal, type TerminalLog } from "@repo/terminal-engine";
import { QuestEvaluator } from "./evaluator/QuestEvaluator";
import { useQuestEvaluator } from "../hooks/useQuestEvaluator";
import { StepContentPanel } from "./challenge/StepContentPanel";
import { StepVisualizerPanel } from "./challenge/StepVisualizerPanel";
import {
  SegmentedControl,
  StepRail,
  SuccessToast,
  type TerminalMode,
  type ViewMode,
} from "./challenge/challenge-ui";

interface ChallengeViewerProps {
  challenge: ChallengeDetail;
}

export function ChallengeViewer({ challenge }: ChallengeViewerProps) {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeStepId, setActiveStepId] = useState(challenge.steps[0]?.id || "");
  const [passedStepIds, setPassedStepIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("content");
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("right");
  const [activeSlideId, setActiveSlideId] = useState<string | undefined>(
    challenge.steps[0]?.interactiveLesson?.slides[0]?.id,
  );

  const terminalFocusRef = useRef<() => void>(null);

  // Engine Integration
  const isGit = challenge.id === "git-aethera";
  const terminal = useTerminal({ language: isGit ? "git" : "linux" });
  /** `${successfulCommandCount}:${trimmedLatest}` — LessonSequence slide `advanceOnCommand` */
  const terminalAdvanceSignature = useMemo(
    () => buildTerminalAdvanceSignature(terminal.history),
    [terminal.history],
  );

  const { checkStepCompletion } = useQuestEvaluator(terminal.state, terminal.history);
  // Stable callback — only changes when passedStepIds or the evaluator itself changes.
  // IMPORTANT: Returns false for already-passed steps to prevent re-submission cascades
  // when saved progress is loaded from the server on mount.
  const evalStep = useCallback(
    (stepId: string) => {
      if (passedStepIds.includes(stepId)) return false; // already submitted — never re-trigger
      return checkStepCompletion(stepId, passedStepIds);
    },
    [checkStepCompletion, passedStepIds]
  );

  const WEB_QUESTS = ["linux-aethera", "git-aethera"];
  const isWebMode = (challenge as any).mode === "web" || WEB_QUESTS.includes(challenge.id);

  // ── Load saved progress from server on mount ──────────────────────────────
  useEffect(() => {
    const token = (session as any)?.fastifyToken;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
    fetch(`${apiUrl}/dashboard`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: any) => {
        const prog = data?.progress?.find(
          (p: any) => p.challengeId === challenge.id,
        );
        if (prog) {
          const completed: string[] = prog.completedStepKeys ?? [];
          setPassedStepIds(completed);
          // Resume from current step, or first uncompleted
          const resumeStepKey =
            prog.currentStepKey ||
            challenge.steps.find((s) => !completed.includes(s.id))?.id ||
            challenge.steps[0]?.id;
          if (resumeStepKey) setActiveStepId(resumeStepKey);
        }
      })
      .catch(() => { /* no progress yet — stay at step 0 */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(session as any)?.fastifyToken, challenge.id]);

  const activeStep = challenge.steps.find((s) => s.id === activeStepId) || challenge.steps[0];
  const activeStepIndex = challenge.steps.findIndex((s) => s.id === activeStepId);
  const activeSlide =
    activeStep?.interactiveLesson?.slides.find((slide) => slide.id === activeSlideId) ??
    activeStep?.interactiveLesson?.slides[0];
  const activeSlideRequiresTerminal = slideRequiresTerminal(activeStep, activeSlide);

  const viewingVisualizerWorkspace =
    viewMode === "visualizer" || viewMode === "split-v" || viewMode === "split-h";

  const showEmbeddedLessonTerminal = false;

  const showStandaloneTerminalDock =
    activeSlideRequiresTerminal && terminalMode !== "hidden" && !showEmbeddedLessonTerminal;

  /** When the real terminal lives inside the lesson composite, expand the panel to full workspace width (`right` mode would otherwise keep ~55% and waste the rest). */
  const workspaceTerminalLayout =
    showStandaloneTerminalDock ? terminalMode : ("hidden" as const);

  const embeddedLessonTerminalSlot = useMemo(
    () =>
      showEmbeddedLessonTerminal ? (
        <SimulatedTerminal
          state={terminal.state}
          history={terminal.history}
          execute={terminal.execute}
          language={isGit ? "git" : "linux"}
          hint={activeStep?.title || ""}
          height="100%"
        />
      ) : undefined,
    [
      showEmbeddedLessonTerminal,
      terminal.state,
      terminal.history,
      terminal.execute,
      isGit,
      activeStep?.title,
    ],
  );
  // A step is unlocked if it is already passed OR it is the very next step after the last passed one
  const highestUnlockedIndex = Math.min(passedStepIds.length, challenge.steps.length - 1);

  // Sync terminal visibility and default panel when step changes
  useEffect(() => {
    const firstSlide = activeStep?.interactiveLesson?.slides[0];
    setActiveSlideId(firstSlide?.id);
    const needsTerminal = slideRequiresTerminal(activeStep, firstSlide);
    setTerminalMode(needsTerminal ? "right" : "hidden");
    setViewMode("content");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepId]);

  useEffect(() => {
    if (!activeSlideRequiresTerminal && viewingVisualizerWorkspace) {
      setViewMode("content");
    }

    setTerminalMode((current) => {
      if (!activeSlideRequiresTerminal) return "hidden";
      return current === "hidden" ? "right" : current;
    });
  }, [activeSlideRequiresTerminal, viewingVisualizerWorkspace]);

  const refreshProgressFromServer = useCallback(async () => {
    const token = (session as any)?.fastifyToken;
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
    try {
      const r = await fetch(`${apiUrl}/dashboard`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const data = (await r.json()) as {
        progress?: Array<{ challengeId: string; completedStepKeys?: string[] }>;
      };
      const prog = data.progress?.find((p) => p.challengeId === challenge.id);
      if (prog?.completedStepKeys) {
        setPassedStepIds(prog.completedStepKeys);
      }
    } catch {
      /* ignore sync errors — local optimistic state remains */
    }
  }, [(session as any)?.fastifyToken, challenge.id]);

  const handleStepPassed = useCallback(() => {
    const completedTitle = activeStep?.title ?? "Step";
    if (activeStep?.id && !passedStepIds.includes(activeStep.id)) {
      setPassedStepIds((prev) => (prev.includes(activeStep.id) ? prev : [...prev, activeStep.id]));
    }

    void refreshProgressFromServer();

    // Show success toast (doesn't change panel — user stays in current view)
    setSuccessMessage(`✓ ${completedTitle} complete — next step unlocked!`);
    window.setTimeout(() => setSuccessMessage(""), 3000);

    // Advance to next step
    if (activeStepIndex < challenge.steps.length - 1) {
      setActiveStepId(challenge.steps[activeStepIndex + 1]?.id || "");
      // DO NOT switch left panel — stay on visualizer so terminal stays visible
      // Re-focus terminal input after state update
      window.setTimeout(() => terminalFocusRef.current?.(), 80);
    }
  }, [activeStep, passedStepIds, activeStepIndex, challenge.steps, refreshProgressFromServer]);

  const stepContent = (
    <StepContentPanel
      step={activeStep}
      stepIndex={activeStepIndex}
      onOpenVisualizer={() => setViewMode("visualizer")}
      onOpenSplitTerminal={() => {
        setViewMode("split-h");
        setTerminalMode("bottom");
      }}
    />
  );

  const nonWebContent = (
    <div className="challenge-page-shell">
      <div className="challenge-page-inner">
        {isSidebarOpen && (
          <StepRail
            variant="page"
            steps={challenge.steps}
            activeStepId={activeStepId}
            passedStepIds={passedStepIds}
            onSelectStep={setActiveStepId}
          />
        )}

        <main className="challenge-page-main">
          <div className="challenge-page-actions">
            <button className="btn btn-ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? "Hide Steps" : "Show Steps"}
            </button>
            <span className="badge badge-indigo">{challenge.language}</span>
            <span className="badge badge-ghost">{challenge.runtime}</span>
          </div>

          <ChallengeTitle challenge={challenge} />
          {challenge.systemRequirements && activeStepIndex === 0 && (
            <SystemRequirements requirements={challenge.systemRequirements} />
          )}
          {activeStepIndex === 0 && <QuickStart challengeId={challenge.id} />}
          {stepContent}
        </main>
      </div>
    </div>
  );

  const webContent = (
    <div className="challenge-fullscreen-wrapper">
      <div className="challenge-fullscreen">
        <SuccessToast message={successMessage} />
        <ChallengeTopBar
          challenge={challenge}
          isSidebarOpen={isSidebarOpen}
          viewMode={viewMode}
          terminalMode={terminalMode}
          canShowVisualWorld={activeSlideRequiresTerminal}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onViewModeChange={setViewMode}
          onTerminalModeChange={setTerminalMode}
        />

        <div className="challenge-web-body">
          <aside className="challenge-sidebar" data-open={isSidebarOpen}>
            <StepRail
              steps={challenge.steps}
              activeStepId={activeStepId}
              passedStepIds={passedStepIds}
              highestUnlockedIndex={highestUnlockedIndex}
              lockFutureSteps={isWebMode}
              onSelectStep={setActiveStepId}
            />
          </aside>

          <div className="challenge-workspace" data-terminal={workspaceTerminalLayout}>
            <div className="challenge-panel-area" data-terminal={workspaceTerminalLayout}>
            {viewMode === "visualizer" ? (
              <div className="challenge-scroll-panel challenge-visualizer-root" data-padded>
                <StepVisualizerPanel
                  step={activeStep}
                  terminalState={terminal.state}
                  isGit={isGit}
                  onCompleted={handleStepPassed}
                  mode="visual-world"
                  terminalAdvanceSignature={terminalAdvanceSignature}
                  embeddedTerminalSlot={embeddedLessonTerminalSlot}
                  onActiveSlideChange={(slide) => setActiveSlideId(slide.id)}
                />
              </div>
            ) : viewMode === "content" ? (
              <div className="challenge-scroll-panel challenge-visualizer-root" data-padded>
                <StepVisualizerPanel
                  step={activeStep}
                  terminalState={terminal.state}
                  isGit={isGit}
                  onCompleted={handleStepPassed}
                  mode="guide"
                  terminalAdvanceSignature={terminalAdvanceSignature}
                  embeddedTerminalSlot={embeddedLessonTerminalSlot}
                  onActiveSlideChange={(slide) => setActiveSlideId(slide.id)}
                />
              </div>
            ) : (
              <div className="challenge-split-panel" data-mode={viewMode}>
                <div className="challenge-split-pane" data-divider={viewMode === "split-v" ? "bottom" : "right"}>
                  <StepVisualizerPanel
                    step={activeStep}
                    terminalState={terminal.state}
                    isGit={isGit}
                    onCompleted={handleStepPassed}
                    mode="guide"
                    terminalAdvanceSignature={terminalAdvanceSignature}
                    embeddedTerminalSlot={embeddedLessonTerminalSlot}
                    onActiveSlideChange={(slide) => setActiveSlideId(slide.id)}
                  />
                </div>
                <div className="challenge-split-pane challenge-visualizer-split" data-visualizer>
                  <StepVisualizerPanel
                    step={activeStep}
                    terminalState={terminal.state}
                    isGit={isGit}
                    onCompleted={handleStepPassed}
                    mode="visual-world"
                    terminalAdvanceSignature={terminalAdvanceSignature}
                    embeddedTerminalSlot={embeddedLessonTerminalSlot}
                    onActiveSlideChange={(slide) => setActiveSlideId(slide.id)}
                  />
                </div>
              </div>
            )}
            </div>

            {showStandaloneTerminalDock && (
              <div className="challenge-terminal-area">
                <SimulatedTerminal
                  state={terminal.state}
                  history={terminal.history}
                  execute={terminal.execute}
                  language={isGit ? "git" : "linux"}
                  hint={activeStep?.title || ""}
                  height="100%"
                />
              </div>
            )}
          </div>
        </div>

      <QuestEvaluator
        challengeId={challenge.id}
        stepId={activeStep?.id || ""}
        userId={(session?.user as any)?.id || "local"}
        token={(session as any)?.fastifyToken || ""}
        historyLength={terminal.history.length}
        checkStepCompletion={evalStep}
        onPassed={handleStepPassed}
      />
      </div>
    </div>
  );

  if (isWebMode) {
    return <>{webContent}</>;
  }

  return nonWebContent;
}

function buildTerminalAdvanceSignature(history: TerminalLog[]): string | undefined {
  const ok = history.filter((h) => !h.error && typeof h.command === "string");
  const last = ok[ok.length - 1];
  const cmd = last?.command?.trim();
  if (!cmd) return undefined;
  return `${ok.length}:${cmd}`;
}

function slideRequiresTerminal(
  step: ChallengeDetail["steps"][number] | undefined,
  slide: InteractiveLessonSlide | undefined,
): boolean {
  if (typeof slide?.requiresTerminal === "boolean") return slide.requiresTerminal;
  return step?.requiresTerminal !== false;
}

function ChallengeTitle({ challenge }: { challenge: ChallengeDetail }) {
  return (
    <div className="challenge-title-block">
      <h1>{challenge.title}</h1>
      {challenge.description && <p>{challenge.description}</p>}
    </div>
  );
}

function SystemRequirements({
  requirements,
}: {
  requirements: NonNullable<ChallengeDetail["systemRequirements"]>;
}) {
  return (
    <section className="glass challenge-info-card" data-tone="system">
      <h2 className="challenge-info-title">System Requirements</h2>
      <div className="challenge-requirements-grid">
        {Object.entries(requirements).map(([key, value]) => (
          <div key={key}>
            <div className="challenge-requirement-key">{key}</div>
            <div className="challenge-requirement-value">{String(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickStart({ challengeId }: { challengeId: string }) {
  return (
    <section className="glass challenge-info-card">
      <h2 className="challenge-info-title">Quick Start</h2>
      <div className="terminal">
        <div><span className="comment"># Install CLI (one-time)</span></div>
        <div><span className="prompt">$ </span><span className="cmd">npx stepwise@latest --help</span></div>
        <div><span className="comment"># Initialize this quest</span></div>
        <div><span className="prompt">$ </span><span className="cmd">stepwise init {challengeId}</span></div>
        <div><span className="comment"># Run tests</span></div>
        <div><span className="prompt">$ </span><span className="cmd">stepwise test</span></div>
      </div>
    </section>
  );
}

function ChallengeTopBar({
  challenge,
  isSidebarOpen,
  viewMode,
  terminalMode,
  canShowVisualWorld,
  onToggleSidebar,
  onViewModeChange,
  onTerminalModeChange,
}: {
  challenge: ChallengeDetail;
  isSidebarOpen: boolean;
  viewMode: ViewMode;
  terminalMode: TerminalMode;
  canShowVisualWorld: boolean;
  onToggleSidebar: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onTerminalModeChange: (mode: TerminalMode) => void;
}) {
  const viewOptions: Array<{ id: ViewMode; label: string }> = [
    { id: "content", label: "Guide" },
  ];

  if (canShowVisualWorld) {
    viewOptions.push(
      { id: "visualizer", label: "Vis" },
      { id: "split-v", label: "Top/Bot" },
      { id: "split-h", label: "Side" },
    );
  }

  return (
    <header className="challenge-topbar">
      <button className="btn btn-ghost" onClick={onToggleSidebar}>
        {isSidebarOpen ? "Hide" : "Show"} Steps
      </button>
      <span className="challenge-topbar-title">{challenge.title}</span>
      <span className="badge badge-indigo">{challenge.language}</span>
      <div className="challenge-topbar-spacer" />
      <SegmentedControl
        value={viewMode}
        onChange={onViewModeChange}
        options={viewOptions}
      />
      {canShowVisualWorld && (
        <SegmentedControl
          value={terminalMode}
          tone="emerald"
          onChange={onTerminalModeChange}
          options={[
            { id: "right", label: "Right" },
            { id: "bottom", label: "Bottom" },
            { id: "hidden", label: "Hide" },
          ]}
        />
      )}
    </header>
  );
}
