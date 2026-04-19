import fs from "fs";
import path from "path";
import {
  ChallengeManifest,
  ChallengeStepManifest,
  ResolvedChallengeStep,
} from "./types";

const DEFAULT_TIMEOUT_MS = 2000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid challenge manifest field: ${field}`);
  }

  return value;
}

function parseServerConfig(value: unknown): import("./types").ServerConfig | undefined {
  if (!isRecord(value)) return undefined;
  return {
    startScript: typeof value.startScript === "string" ? value.startScript : undefined,
    portEnvVar: typeof value.portEnvVar === "string" ? value.portEnvVar : undefined,
    readyEndpoint: typeof value.readyEndpoint === "string" ? value.readyEndpoint : undefined,
    startupTimeoutMs: typeof value.startupTimeoutMs === "number" ? value.startupTimeoutMs : undefined,
  };
}

function parseStep(step: unknown, index: number): ChallengeStepManifest {
  if (!isRecord(step)) {
    throw new Error(`Invalid challenge manifest step at index ${index}`);
  }

  const tests = step.tests;

  if (!isRecord(tests)) {
    throw new Error(`Invalid challenge manifest tests for step ${index}`);
  }

  const workspace = step.workspace;

  return {
    id: assertString(step.id, `steps[${index}].id`),
    title: assertString(step.title, `steps[${index}].title`),
    prompt:
      typeof step.prompt === "string" && step.prompt.length > 0
        ? step.prompt
        : undefined,
    free: typeof step.free === "boolean" ? step.free : true,
    tests: {
      visible: assertString(tests.visible, `steps[${index}].tests.visible`),
      hidden:
        typeof tests.hidden === "string" && tests.hidden.length > 0
          ? tests.hidden
          : undefined,
    },
    workspace: isRecord(workspace)
      ? {
          root: assertString(workspace.root, `steps[${index}].workspace.root`),
          starter:
            typeof workspace.starter === "string" &&
            workspace.starter.length > 0
              ? workspace.starter
              : undefined,
          entrypoint:
            typeof workspace.entrypoint === "string" &&
            workspace.entrypoint.length > 0
              ? workspace.entrypoint
              : undefined,
        }
      : undefined,
    entrypoint:
      typeof step.entrypoint === "string" && step.entrypoint.length > 0
        ? step.entrypoint
        : undefined,
    timeoutMs:
      typeof step.timeoutMs === "number" && Number.isFinite(step.timeoutMs)
        ? step.timeoutMs
        : undefined,
    server: parseServerConfig(step.server),
  };
}

export function loadChallengeManifest(challengePath: string): ChallengeManifest {
  const manifestPath = path.resolve(challengePath, "challenge.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Challenge manifest not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8"),
  ) as unknown;

  if (!isRecord(manifest)) {
    throw new Error("Challenge manifest must be an object");
  }

  const rawSteps = manifest.steps;

  if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
    throw new Error("Challenge manifest must contain at least one step");
  }

  return {
    schemaVersion: 1,
    id: assertString(manifest.id, "id"),
    version: assertString(manifest.version, "version"),
    title: assertString(manifest.title, "title"),
    language: assertString(manifest.language, "language"),
    runtime: assertString(manifest.runtime, "runtime"),
    type: manifest.type === "server" ? "server" : "function",
    description: typeof manifest.description === "string" ? manifest.description : undefined,
    difficulty:
      manifest.difficulty === "beginner" ||
      manifest.difficulty === "intermediate" ||
      manifest.difficulty === "advanced"
        ? manifest.difficulty
        : undefined,
    tags: Array.isArray(manifest.tags)
      ? (manifest.tags as unknown[]).filter((t): t is string => typeof t === "string")
      : undefined,
    entrypoint:
      typeof manifest.entrypoint === "string" && manifest.entrypoint.length > 0
        ? manifest.entrypoint
        : undefined,
    defaultTimeoutMs:
      typeof manifest.defaultTimeoutMs === "number" &&
      Number.isFinite(manifest.defaultTimeoutMs)
        ? manifest.defaultTimeoutMs
        : undefined,
    server: parseServerConfig(manifest.server),
    steps: rawSteps.map(parseStep),
  };
}

export function resolveChallengeStep(
  challengePath: string,
  stepId?: string,
  timeoutOverride?: number,
): ResolvedChallengeStep {
  const resolvedChallengePath = path.resolve(challengePath);
  const manifestPath = path.resolve(resolvedChallengePath, "challenge.json");
  const manifest = loadChallengeManifest(resolvedChallengePath);
  const step =
    (stepId
      ? manifest.steps.find((candidate) => candidate.id === stepId)
      : manifest.steps[0]) ?? null;

  if (!step) {
    throw new Error(
      `Step "${stepId}" not found for challenge "${manifest.id}"`,
    );
  }

  return {
    challengePath: resolvedChallengePath,
    manifestPath,
    challengeId: manifest.id,
    challengeVersion: manifest.version,
    challengeTitle: manifest.title,
    language: manifest.language,
    runtime: manifest.runtime,
    challengeType: manifest.type ?? "function",
    stepId: step.id,
    stepTitle: step.title,
    testFilePath: path.resolve(resolvedChallengePath, step.tests.visible),
    hiddenTestFilePath: step.tests.hidden
      ? path.resolve(resolvedChallengePath, step.tests.hidden)
      : undefined,
    workspacePath: path.resolve(
      resolvedChallengePath,
      step.workspace?.root ?? ".",
    ),
    starterPath: step.workspace?.starter
      ? path.resolve(resolvedChallengePath, step.workspace.starter)
      : undefined,
    defaultUserCodePath: path.resolve(
      resolvedChallengePath,
      step.workspace?.root ?? ".",
      step.workspace?.entrypoint ?? step.entrypoint ?? manifest.entrypoint ?? "index.js",
    ),
    timeoutMs:
      timeoutOverride ??
      step.timeoutMs ??
      manifest.defaultTimeoutMs ??
      DEFAULT_TIMEOUT_MS,
    // Merge manifest-level server config with step-level overrides
    serverConfig:
      manifest.type === "server"
        ? { ...manifest.server, ...step.server }
        : undefined,
  };
}
