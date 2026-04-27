import path from "path";
import {
  loadChallengeManifestFromFile,
  type ChallengeManifest as SharedChallengeManifest,
} from "@repo/challenge-schema";
import {
  ChallengeManifest,
  ResolvedChallengeStep,
} from "./types";

const DEFAULT_TIMEOUT_MS = 2000;

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid challenge manifest field: ${field}`);
  }

  return value;
}

function toRunnerManifest(sharedManifest: SharedChallengeManifest): ChallengeManifest {
  return {
    schemaVersion: 1,
    id: sharedManifest.id,
    version: sharedManifest.version,
    title: sharedManifest.title,
    language: sharedManifest.language,
    runtime: sharedManifest.runtime,
    type: sharedManifest.type,
    description: sharedManifest.description,
    difficulty: sharedManifest.difficulty,
    systemRequirements: sharedManifest.systemRequirements,
    tags: sharedManifest.tags,
    entrypoint: sharedManifest.entrypoint,
    defaultTimeoutMs: sharedManifest.defaultTimeoutMs,
    server: sharedManifest.server,
    steps: sharedManifest.steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      prompt: step.prompt,
      free: step.free ?? true,
      tests: {
        visible: assertString(step.tests?.visible, `steps[${index}].tests.visible`),
        hidden: step.tests?.hidden,
      },
      workspace: step.workspace?.root
        ? {
            root: step.workspace.root,
            starter: step.workspace.starter,
            entrypoint: step.workspace.entrypoint,
          }
        : undefined,
      entrypoint: step.entrypoint,
      timeoutMs: step.timeoutMs,
      server: step.server,
    })),
  };
}

export function loadChallengeManifest(challengePath: string): ChallengeManifest {
  const manifestPath = path.resolve(challengePath, "challenge.json");
  const sharedManifest = loadChallengeManifestFromFile(manifestPath);
  return toRunnerManifest(sharedManifest);
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
