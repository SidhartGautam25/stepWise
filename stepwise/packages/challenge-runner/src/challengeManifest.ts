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

function parseStep(step: unknown, index: number): ChallengeStepManifest {
  if (!isRecord(step)) {
    throw new Error(`Invalid challenge manifest step at index ${index}`);
  }

  const tests = step.tests;

  if (!isRecord(tests)) {
    throw new Error(`Invalid challenge manifest tests for step ${index}`);
  }

  return {
    id: assertString(step.id, `steps[${index}].id`),
    title: assertString(step.title, `steps[${index}].title`),
    prompt:
      typeof step.prompt === "string" && step.prompt.length > 0
        ? step.prompt
        : undefined,
    tests: {
      visible: assertString(tests.visible, `steps[${index}].tests.visible`),
      hidden:
        typeof tests.hidden === "string" && tests.hidden.length > 0
          ? tests.hidden
          : undefined,
    },
    entrypoint:
      typeof step.entrypoint === "string" && step.entrypoint.length > 0
        ? step.entrypoint
        : undefined,
    timeoutMs:
      typeof step.timeoutMs === "number" && Number.isFinite(step.timeoutMs)
        ? step.timeoutMs
        : undefined,
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
    entrypoint:
      typeof manifest.entrypoint === "string" && manifest.entrypoint.length > 0
        ? manifest.entrypoint
        : undefined,
    defaultTimeoutMs:
      typeof manifest.defaultTimeoutMs === "number" &&
      Number.isFinite(manifest.defaultTimeoutMs)
        ? manifest.defaultTimeoutMs
        : undefined,
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
    stepId: step.id,
    stepTitle: step.title,
    testFilePath: path.resolve(resolvedChallengePath, step.tests.visible),
    hiddenTestFilePath: step.tests.hidden
      ? path.resolve(resolvedChallengePath, step.tests.hidden)
      : undefined,
    defaultEntrypoint: path.resolve(
      resolvedChallengePath,
      step.entrypoint ?? manifest.entrypoint ?? "index.js",
    ),
    timeoutMs:
      timeoutOverride ??
      step.timeoutMs ??
      manifest.defaultTimeoutMs ??
      DEFAULT_TIMEOUT_MS,
  };
}
