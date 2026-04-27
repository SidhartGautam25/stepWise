export const CHALLENGE_CAPABILITIES = {
  INTERACTIVE_SEQUENCE: "interactive-sequence",
  SIM_TERMINAL: "sim-terminal",
  QUEST_EVALUATOR: "quest-evaluator",
  CLI_RUNNER: "cli-runner",
  TEST_RUNNER: "test-runner",
} as const;

export type ChallengeCapability =
  (typeof CHALLENGE_CAPABILITIES)[keyof typeof CHALLENGE_CAPABILITIES];

export type ChallengeMode = "web" | "local";
export type ChallengeType = "function" | "server";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ServerConfig {
  startScript?: string;
  portEnvVar?: string;
  readyEndpoint?: string;
  startupTimeoutMs?: number;
}

export interface ChallengeStepManifest {
  id: string;
  title: string;
  prompt?: string;
  explanation?: string;
  solution?: string;
  free?: boolean;
  tests?: {
    visible?: string;
    hidden?: string;
  };
  workspace?: {
    root?: string;
    starter?: string;
    entrypoint?: string;
  };
  entrypoint?: string;
  timeoutMs?: number;
  requiresTerminal?: boolean;
  interactiveLesson?: {
    type: "sequence";
    content: string;
  };
  completion?: CompletionSpec;
  server?: ServerConfig;
}

export type CompletionRule =
  | { type: "command_exact"; command: string }
  | { type: "command_prefix"; prefix: string }
  | { type: "command_count_gte"; command: string; count: number }
  | { type: "cwd_is"; path: string }
  | { type: "git_initialized" }
  | { type: "git_commits_gte"; count: number; currentBranchOnly?: boolean }
  | { type: "git_branches_gte"; count: number }
  | { type: "vfs_dir_exists"; path: string }
  | { type: "vfs_file_contains"; path: string; text: string };

export interface CompletionSpec {
  all: CompletionRule[];
}

export interface ChallengeManifest {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  mode: ChallengeMode;
  capabilities: ChallengeCapability[];
  type: ChallengeType;
  description?: string;
  difficulty?: Difficulty;
  systemRequirements?: Record<string, unknown>;
  tags?: string[];
  entrypoint?: string;
  defaultTimeoutMs?: number;
  server?: ServerConfig;
  steps: ChallengeStepManifest[];
}

export const DEFAULT_WEB_CAPABILITIES: ChallengeCapability[] = [
  CHALLENGE_CAPABILITIES.INTERACTIVE_SEQUENCE,
  CHALLENGE_CAPABILITIES.SIM_TERMINAL,
  CHALLENGE_CAPABILITIES.QUEST_EVALUATOR,
];

export const DEFAULT_LOCAL_CAPABILITIES: ChallengeCapability[] = [
  CHALLENGE_CAPABILITIES.CLI_RUNNER,
  CHALLENGE_CAPABILITIES.TEST_RUNNER,
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readRequiredString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Manifest field "${field}" is required`);
  }
  return v;
}

function readOptionalString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function parseServerConfig(value: unknown): ServerConfig | undefined {
  if (!isRecord(value)) return undefined;
  return {
    startScript: readOptionalString(value.startScript),
    portEnvVar: readOptionalString(value.portEnvVar),
    readyEndpoint: readOptionalString(value.readyEndpoint),
    startupTimeoutMs:
      typeof value.startupTimeoutMs === "number" && Number.isFinite(value.startupTimeoutMs)
        ? value.startupTimeoutMs
        : undefined,
  };
}

function parseModeAndCapabilities(manifest: Record<string, unknown>, runtime: string): {
  mode: ChallengeMode;
  capabilities: ChallengeCapability[];
} {
  const mode: ChallengeMode = manifest.mode === "web" ? "web" : "local";
  const rawCapabilities = Array.isArray(manifest.capabilities)
    ? manifest.capabilities.filter(
        (cap): cap is ChallengeCapability =>
          typeof cap === "string" &&
          Object.values(CHALLENGE_CAPABILITIES).includes(cap as ChallengeCapability),
      )
    : [];

  if (rawCapabilities.length > 0) {
    return { mode, capabilities: rawCapabilities };
  }

  return {
    mode,
    capabilities:
      mode === "web" || runtime === "web-terminal"
        ? [...DEFAULT_WEB_CAPABILITIES]
        : [...DEFAULT_LOCAL_CAPABILITIES],
  };
}

function parseStep(step: unknown, index: number): ChallengeStepManifest {
  if (!isRecord(step)) {
    throw new Error(`Invalid challenge manifest step at index ${index}`);
  }

  const tests = isRecord(step.tests) ? step.tests : undefined;
  const workspace = isRecord(step.workspace) ? step.workspace : undefined;
  const interactiveLesson = isRecord(step.interactiveLesson) ? step.interactiveLesson : undefined;
  const completion = isRecord(step.completion) ? parseCompletion(step.completion) : undefined;

  return {
    id: readRequiredString(step.id, `steps[${index}].id`),
    title: readRequiredString(step.title, `steps[${index}].title`),
    prompt: readOptionalString(step.prompt),
    explanation: readOptionalString(step.explanation),
    solution: readOptionalString(step.solution),
    free: typeof step.free === "boolean" ? step.free : undefined,
    tests: tests
      ? {
          visible: readOptionalString(tests.visible),
          hidden: readOptionalString(tests.hidden),
        }
      : undefined,
    workspace: workspace
      ? {
          root: readOptionalString(workspace.root),
          starter: readOptionalString(workspace.starter),
          entrypoint: readOptionalString(workspace.entrypoint),
        }
      : undefined,
    entrypoint: readOptionalString(step.entrypoint),
    timeoutMs:
      typeof step.timeoutMs === "number" && Number.isFinite(step.timeoutMs)
        ? step.timeoutMs
        : undefined,
    requiresTerminal:
      typeof step.requiresTerminal === "boolean" ? step.requiresTerminal : undefined,
    interactiveLesson:
      interactiveLesson &&
      interactiveLesson.type === "sequence" &&
      typeof interactiveLesson.content === "string"
        ? { type: "sequence", content: interactiveLesson.content }
        : undefined,
    completion,
    server: parseServerConfig(step.server),
  };
}

function parseCompletionRule(rule: unknown): CompletionRule | null {
  if (!isRecord(rule) || typeof rule.type !== "string") return null;

  switch (rule.type) {
    case "command_exact":
      return typeof rule.command === "string" ? { type: "command_exact", command: rule.command } : null;
    case "command_prefix":
      return typeof rule.prefix === "string" ? { type: "command_prefix", prefix: rule.prefix } : null;
    case "command_count_gte":
      return typeof rule.command === "string" && typeof rule.count === "number"
        ? { type: "command_count_gte", command: rule.command, count: rule.count }
        : null;
    case "cwd_is":
      return typeof rule.path === "string" ? { type: "cwd_is", path: rule.path } : null;
    case "git_initialized":
      return { type: "git_initialized" };
    case "git_commits_gte":
      return typeof rule.count === "number"
        ? {
            type: "git_commits_gte",
            count: rule.count,
            currentBranchOnly: typeof rule.currentBranchOnly === "boolean" ? rule.currentBranchOnly : undefined,
          }
        : null;
    case "git_branches_gte":
      return typeof rule.count === "number" ? { type: "git_branches_gte", count: rule.count } : null;
    case "vfs_dir_exists":
      return typeof rule.path === "string" ? { type: "vfs_dir_exists", path: rule.path } : null;
    case "vfs_file_contains":
      return typeof rule.path === "string" && typeof rule.text === "string"
        ? { type: "vfs_file_contains", path: rule.path, text: rule.text }
        : null;
    default:
      return null;
  }
}

function parseCompletion(value: Record<string, unknown>): CompletionSpec | undefined {
  if (!Array.isArray(value.all)) return undefined;
  const rules = value.all
    .map(parseCompletionRule)
    .filter((rule): rule is CompletionRule => rule !== null);
  return rules.length > 0 ? { all: rules } : undefined;
}

export function parseChallengeManifest(manifest: unknown): ChallengeManifest {
  if (!isRecord(manifest)) {
    throw new Error("Challenge manifest must be an object");
  }

  if (!Array.isArray(manifest.steps) || manifest.steps.length === 0) {
    throw new Error("Challenge manifest must contain at least one step");
  }

  const runtime = readRequiredString(manifest.runtime, "runtime");
  const { mode, capabilities } = parseModeAndCapabilities(manifest, runtime);

  return {
    schemaVersion: 1,
    id: readRequiredString(manifest.id, "id"),
    version: readRequiredString(manifest.version, "version"),
    title: readRequiredString(manifest.title, "title"),
    language: readRequiredString(manifest.language, "language"),
    runtime,
    mode,
    capabilities,
    type: manifest.type === "server" ? "server" : "function",
    description: readOptionalString(manifest.description),
    difficulty:
      manifest.difficulty === "beginner" ||
      manifest.difficulty === "intermediate" ||
      manifest.difficulty === "advanced"
        ? manifest.difficulty
        : undefined,
    systemRequirements: isRecord(manifest.systemRequirements)
      ? manifest.systemRequirements
      : undefined,
    tags: Array.isArray(manifest.tags)
      ? manifest.tags.filter((t): t is string => typeof t === "string")
      : undefined,
    entrypoint: readOptionalString(manifest.entrypoint),
    defaultTimeoutMs:
      typeof manifest.defaultTimeoutMs === "number" &&
      Number.isFinite(manifest.defaultTimeoutMs)
        ? manifest.defaultTimeoutMs
        : undefined,
    server: parseServerConfig(manifest.server),
    steps: manifest.steps.map(parseStep),
  };
}

export function loadChallengeManifestFromFile(manifestPath: string): ChallengeManifest {
  const fs = require("fs") as typeof import("fs");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Challenge manifest not found at ${manifestPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as unknown;
  return parseChallengeManifest(raw);
}
