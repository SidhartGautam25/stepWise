/**
 * Schema for .stepwise.json — the local workspace config file written by `stepwise init`.
 * This file lives in the student's challenge workspace folder.
 */
export interface LocalWorkspaceConfig {
  /** Semver version of the config schema, for future-proofing */
  schemaVersion: 1;
  /** The challenge id, e.g. "promise-basic" */
  challengeId: string;
  /** The challenge version string from the manifest, e.g. "0.2.0" */
  challengeVersion: string;
  /** The current step id the student is working on, e.g. "return-42" */
  currentStepId: string;
  /** User id — placeholder for real auth; will be token-derived in Phase 3 */
  userId: string;
  /** Base URL of the StepWise API */
  apiBaseUrl: string;
  /** ISO timestamp when init was run */
  initializedAt: string;
}

/** Filename used for the local workspace config */
export const LOCAL_WORKSPACE_CONFIG_FILENAME = ".stepwise.json";

/**
 * Response shape for GET /challenges/:id
 */
export interface ChallengeStepInfo {
  id: string;
  title: string;
  prompt?: string;
  explanation?: string;
  solution?: string;
  position: number;
  hasStarter: boolean;
  starterRoot?: string;
  workspaceRoot?: string;
  entrypoint?: string;
  visibleTestPath?: string;
  hiddenTestPath?: string;
  timeoutMs?: number;
  requiresTerminal?: boolean;
  server?: ServerConfig;
}

export interface ServerConfig {
  startScript?: string;
  portEnvVar?: string;
  readyEndpoint?: string;
  startupTimeoutMs?: number;
}

export interface ChallengeInfoResponse {
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  challengeType: "function" | "server";
  defaultTimeoutMs?: number;
  entrypoint?: string;
  server?: ServerConfig;
  steps: ChallengeStepInfo[];
  /** Absolute path on the server — used by CLI to locate starter files */
  challengePath: string;
}

/**
 * Response shape for GET /challenges
 */
export interface ChallengeSummary {
  id: string;
  version: string;
  title: string;
  stepCount: number;
}

export interface ListChallengesResponse {
  challenges: ChallengeSummary[];
}

// ─── Runtime parsers ────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid field: ${field}`);
  }
  return value;
}

function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid field: ${field}`);
  }
  return value;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readOptionalServerConfig(value: unknown): ServerConfig | undefined {
  if (!isRecord(value)) return undefined;

  return {
    startScript:
      typeof value.startScript === "string" ? value.startScript : undefined,
    portEnvVar:
      typeof value.portEnvVar === "string" ? value.portEnvVar : undefined,
    readyEndpoint:
      typeof value.readyEndpoint === "string" ? value.readyEndpoint : undefined,
    startupTimeoutMs: readOptionalNumber(value.startupTimeoutMs),
  };
}

export function parseChallengeInfoResponse(payload: unknown): ChallengeInfoResponse {
  if (!isRecord(payload)) throw new Error("Invalid challenge info response");

  const rawSteps = payload.steps;
  if (!Array.isArray(rawSteps)) throw new Error("Invalid steps in challenge info response");

  return {
    id: readString(payload.id, "id"),
    version: readString(payload.version, "version"),
    title: readString(payload.title, "title"),
    language: readString(payload.language, "language"),
    runtime: readString(payload.runtime, "runtime"),
    challengeType: payload.challengeType === "server" ? "server" : "function",
    defaultTimeoutMs: readOptionalNumber(payload.defaultTimeoutMs),
    entrypoint:
      typeof payload.entrypoint === "string" ? payload.entrypoint : undefined,
    server: readOptionalServerConfig(payload.server),
    challengePath: readString(payload.challengePath, "challengePath"),
    steps: rawSteps.map((step, index) => {
      if (!isRecord(step)) throw new Error(`Invalid step at index ${index}`);
      return {
        id: readString(step.id, `steps[${index}].id`),
        title: readString(step.title, `steps[${index}].title`),
        prompt: typeof step.prompt === "string" ? step.prompt : undefined,
        explanation:
          typeof step.explanation === "string" ? step.explanation : undefined,
        solution: typeof step.solution === "string" ? step.solution : undefined,
        position:
          typeof step.position === "number" ? step.position : index + 1,
        hasStarter: readBoolean(step.hasStarter, `steps[${index}].hasStarter`),
        starterRoot:
          typeof step.starterRoot === "string" ? step.starterRoot : undefined,
        workspaceRoot:
          typeof step.workspaceRoot === "string"
            ? step.workspaceRoot
            : undefined,
        entrypoint:
          typeof step.entrypoint === "string" ? step.entrypoint : undefined,
        visibleTestPath:
          typeof step.visibleTestPath === "string"
            ? step.visibleTestPath
            : undefined,
        hiddenTestPath:
          typeof step.hiddenTestPath === "string"
            ? step.hiddenTestPath
            : undefined,
        timeoutMs: readOptionalNumber(step.timeoutMs),
        requiresTerminal:
          typeof step.requiresTerminal === "boolean"
            ? step.requiresTerminal
            : undefined,
        server: readOptionalServerConfig(step.server),
      };
    }),
  };
}

export function parseListChallengesResponse(payload: unknown): ListChallengesResponse {
  if (!isRecord(payload)) throw new Error("Invalid list challenges response");

  const rawChallenges = payload.challenges;
  if (!Array.isArray(rawChallenges)) throw new Error("Invalid challenges list");

  return {
    challenges: rawChallenges.map((item, index) => {
      if (!isRecord(item)) throw new Error(`Invalid challenge at index ${index}`);
      return {
        id: readString(item.id, `challenges[${index}].id`),
        version: readString(item.version, `challenges[${index}].version`),
        title: readString(item.title, `challenges[${index}].title`),
        stepCount:
          typeof item.stepCount === "number" ? item.stepCount : 0,
      };
    }),
  };
}

export function parseLocalWorkspaceConfig(raw: unknown): LocalWorkspaceConfig {
  if (!isRecord(raw)) throw new Error("Invalid .stepwise.json config");
  return {
    schemaVersion: 1,
    challengeId: readString(raw.challengeId, "challengeId"),
    challengeVersion: readString(raw.challengeVersion, "challengeVersion"),
    currentStepId: readString(raw.currentStepId, "currentStepId"),
    userId: readString(raw.userId, "userId"),
    apiBaseUrl: readString(raw.apiBaseUrl, "apiBaseUrl"),
    initializedAt: readString(raw.initializedAt, "initializedAt"),
  };
}
