/**
 * IllustrationConfig — data-driven discriminated union
 *
 * Every interactive illustration is described as a plain data object.
 * No JSX, no React — pure JSON-serializable config.
 *
 * The renderIllustration() function reads the `type` field and
 * automatically renders the correct engine component with the right props.
 *
 * To add a new component type:
 *  1. Add a new variant here
 *  2. Add a case in renderIllustration.tsx
 *  3. Add entries in lesson-content/src/<quest>/slide-configs.ts
 */

import type { ExpandableCardItem }  from "./components/ExpandableCardList";
import type { ClickRevealItem }      from "./components/ClickRevealGrid";
import type { SimActor, SimStep }    from "./components/StepSimulator";
import type { CompareSide }          from "./components/ComparePanel";
import type { JourneyStep }          from "./components/JourneyFlow";
import type { BucketConfig }         from "./components/InteractiveBuckets";
import type { TreeNode }             from "./components/CollapsibleTree";
import type { FileSystemTree }       from "./components/FileNavigator";
import type { InfoCalloutVariant }   from "./components/InfoCallout";

// Each variant is `{ type: "<ComponentName>" } & relevant props`

export interface ExpandableCardListConfig {
  type: "ExpandableCardList";
  hint?: string;
  items: ExpandableCardItem[];
  multiOpen?: boolean;
}

export interface ClickRevealGridConfig {
  type: "ClickRevealGrid";
  hint?: string;
  items: ClickRevealItem[];
  columns?: number;
  detailLabel?: string;
}

export interface StepSimulatorConfig {
  type: "StepSimulator";
  hint?: string;
  actors: SimActor[];
  steps: SimStep[];
  startLabel?: string;
  nextLabel?: string;
  doneMessage?: string;
  replayLabel?: string;
}

export interface ComparePanelConfig {
  type: "ComparePanel";
  hint?: string;
  left: CompareSide;
  right: CompareSide;
  successMessage?: string;
}

export interface JourneyFlowConfig {
  type: "JourneyFlow";
  hint?: string;
  steps: JourneyStep[];
  storeIcon?: string;
  storeLabel?: string;
  startLabel?: string;
  nextLabel?: string;
  replayLabel?: string;
}

export interface InteractiveBucketsConfig {
  type: "InteractiveBuckets";
  hint?: string;
  items: string[];
  source: BucketConfig;
  destination: BucketConfig;
  destinationTip?: string;
}

export interface CollapsibleTreeConfig {
  type: "CollapsibleTree";
  hint?: string;
  tree: TreeNode;
  tip?: string;
  indent?: number;
}

export interface FileNavigatorConfig {
  type: "FileNavigator";
  hint?: string;
  tree: FileSystemTree;
  rootLabel?: string;
  tip?: string;
}

export interface InfoCalloutConfig {
  type: "InfoCallout";
  text: string;
  icon?: string;
  variant?: InfoCalloutVariant;
}

/** Stack multiple illustrations vertically for complex slides */
export interface MultiConfig {
  type: "Multi";
  gap?: number;
  illustrations: IllustrationConfig[];
}

export type IllustrationConfig =
  | ExpandableCardListConfig
  | ClickRevealGridConfig
  | StepSimulatorConfig
  | ComparePanelConfig
  | JourneyFlowConfig
  | InteractiveBucketsConfig
  | CollapsibleTreeConfig
  | FileNavigatorConfig
  | InfoCalloutConfig
  | MultiConfig;
