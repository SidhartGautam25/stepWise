import fs from "fs";
import path from "path";

export interface ChallengeStepInfo {
  id: string;
  title: string;
}

export interface ChallengeInfo {
  id: string;
  version: string;
  title: string;
  steps: ChallengeStepInfo[];
}

interface ChallengeManifest {
  id: string;
  version: string;
  title: string;
  steps: ChallengeStepInfo[];
}

const challengesRoot = path.resolve(__dirname, "../../../challenges");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid challenge manifest field: ${field}`);
  }

  return value;
}

export function getChallengePath(challengeId: string): string {
  const challengePath = path.resolve(challengesRoot, challengeId);

  if (!fs.existsSync(challengePath)) {
    throw new Error(`Challenge "${challengeId}" not found`);
  }

  return challengePath;
}

export function getChallengeInfo(challengeId: string): ChallengeInfo {
  const manifestPath = path.resolve(getChallengePath(challengeId), "challenge.json");
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8"),
  ) as unknown;

  if (!isRecord(manifest) || !Array.isArray(manifest.steps)) {
    throw new Error(`Invalid challenge manifest for "${challengeId}"`);
  }

  const parsedManifest: ChallengeManifest = {
    id: readString(manifest.id, "id"),
    version: readString(manifest.version, "version"),
    title: readString(manifest.title, "title"),
    steps: manifest.steps.map((step, index) => {
      if (!isRecord(step)) {
        throw new Error(`Invalid step definition at index ${index}`);
      }

      return {
        id: readString(step.id, `steps[${index}].id`),
        title: readString(step.title, `steps[${index}].title`),
      };
    }),
  };

  if (parsedManifest.steps.length === 0) {
    throw new Error(`Challenge "${challengeId}" has no steps`);
  }

  return parsedManifest;
}

export function getNextStepId(
  challenge: ChallengeInfo,
  currentStepId: string,
): string | undefined {
  const currentStepIndex = challenge.steps.findIndex(
    (step) => step.id === currentStepId,
  );

  if (currentStepIndex === -1) {
    throw new Error(`Step "${currentStepId}" not found in challenge`);
  }

  return challenge.steps[currentStepIndex + 1]?.id;
}

export function getStepOrThrow(
  challenge: ChallengeInfo,
  stepId?: string,
): ChallengeStepInfo {
  if (!stepId) {
    const firstStep = challenge.steps[0];

    if (!firstStep) {
      throw new Error(`Challenge "${challenge.id}" has no steps`);
    }

    return firstStep;
  }

  const step = challenge.steps.find((candidate) => candidate.id === stepId);

  if (!step) {
    throw new Error(
      `Step "${stepId}" not found for challenge "${challenge.id}"`,
    );
  }

  return step;
}
