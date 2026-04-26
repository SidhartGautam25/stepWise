/**
 * @repo/interactive-engine
 *
 * A library of reusable, interactive, zero-config slide illustration components.
 * Import any component and feed it data — no CSS needed.
 *
 * All components:
 *  - Use CSS variables from the web app's theme (dark/light mode aware)
 *  - Inject animations lazily (once per page) via useEngineStyles
 *  - Are fully typed with TypeScript
 *  - Work in any quest — just pass different data
 *
 * ── Components ──────────────────────────────────────────────────────────────
 *
 *  IllustrationShell    — outer card wrapper, shows optional hint, injects styles
 *  ExpandableCardList   — accordion: click to reveal more detail per item
 *  ClickRevealGrid      — grid of cards that reveal a detail on click
 *  StepSimulator        — N-actor, N-step animated message simulation
 *  ComparePanel         — two-side comparison (open vs closed, before vs after)
 *  JourneyFlow          — sequential step-through with animated progression
 *  InteractiveBuckets   — move items between two labelled buckets
 *  CollapsibleTree      — recursive folder/file tree with expand/collapse
 *  FileNavigator        — breadcrumb file-system navigator
 *  InfoCallout          — themed info/success/warning/error banner
 *
 * ── Internal utilities (re-exported for advanced use) ───────────────────────
 *  T                    — CSS variable token map
 *  useEngineStyles      — hook that injects keyframes
 */

export { IllustrationShell }    from "./components/IllustrationShell";
export { ExpandableCardList }   from "./components/ExpandableCardList";
export { ClickRevealGrid }      from "./components/ClickRevealGrid";
export { StepSimulator }        from "./components/StepSimulator";
export { ComparePanel }         from "./components/ComparePanel";
export { JourneyFlow }          from "./components/JourneyFlow";
export { InteractiveBuckets }   from "./components/InteractiveBuckets";
export { CollapsibleTree }      from "./components/CollapsibleTree";
export { FileNavigator }        from "./components/FileNavigator";
export { InfoCallout }          from "./components/InfoCallout";
export { LessonSequenceShell }  from "./components/LessonSequenceShell";

export { T }                    from "./tokens";
export { useEngineStyles }      from "./useEngineStyles";

// Re-export prop types for consumers
export type { IllustrationShellProps }   from "./components/IllustrationShell";
export type { ExpandableCardItem, ExpandableCardListProps }   from "./components/ExpandableCardList";
export type { ClickRevealItem, ClickRevealGridProps }         from "./components/ClickRevealGrid";
export type { SimActor, SimStep, StepSimulatorProps }         from "./components/StepSimulator";
export type { CompareSide, ComparePanelProps }                from "./components/ComparePanel";
export type { JourneyStep, JourneyFlowProps }                 from "./components/JourneyFlow";
export type { BucketConfig, InteractiveBucketsProps }         from "./components/InteractiveBuckets";
export type { TreeNode, CollapsibleTreeProps }                 from "./components/CollapsibleTree";
export type { FileSystemTree, FileNavigatorProps }            from "./components/FileNavigator";
export type { InfoCalloutVariant, InfoCalloutProps }          from "./components/InfoCallout";
export type { LessonSlide, LessonSequenceShellProps }         from "./components/LessonSequenceShell";
