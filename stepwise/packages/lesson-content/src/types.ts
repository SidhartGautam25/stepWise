import type { IllustrationConfig } from "@repo/interactive-engine";

export type LessonVfsNode = {
  type: string;
  content?: string;
  children?: Record<string, LessonVfsNode>;
};

export interface SimulatedTerminalLessonConfig {
  type: "SimulatedTerminal";
  language?: "git" | "linux";
  hint?: string;
  initialVfs?: Record<string, LessonVfsNode>;
  preHistory?: string[];
  height?: number;
}

export type LessonIllustrationConfig =
  | IllustrationConfig
  | SimulatedTerminalLessonConfig;
