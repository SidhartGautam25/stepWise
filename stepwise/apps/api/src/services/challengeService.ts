/**
 * Challenge Service — challenge catalog and prompt loading.
 * Wraps the disk-based challenge catalog + DB step lookups.
 */

import fs from "fs";
import path from "path";
import { prisma, type ChallengeRegistry, type ChallengeStepRegistryEntry } from "@repo/db";
import {
  StepContentManager,
  type CodeFileContent,
  type InteractiveLesson,
} from "@repo/challenge-runner";

const CHALLENGES_ROOT = path.resolve(__dirname, "../../../../challenges");

export type CodeFile = CodeFileContent;

export interface StepInfo {
  id: string;
  title: string;
  prompt?: string;
  explanation?: string;
  solution?: string;
  visibleTestPath?: string;
  hiddenTestPath?: string;
  hasStarter: boolean;
  starterRoot?: string;
  workspaceRoot?: string;
  entrypoint?: string;
  interactiveLesson?: InteractiveLesson;
  position: number;
  codeFiles?: CodeFile[];
  requiresTerminal?: boolean;
  timeoutMs?: number;
  server?: Record<string, unknown>;
}

export interface ChallengeInfo {
  challengeVersionId: string;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  challengeType: string;
  description?: string;
  defaultTimeoutMs?: number;
  entrypoint?: string;
  server?: Record<string, unknown>;
  systemRequirements?: Record<string, unknown>;
  steps: StepInfo[];
  challengePath: string;
}

export interface ChallengeSummary {
  id: string;
  title: string;
  version: string;
  language: string;
  runtime: string;
  stepCount: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asRegistry(value: unknown): ChallengeRegistry {
  if (!isRecord(value) || !Array.isArray(value.steps)) {
    throw new Error("Challenge version has an invalid step registry");
  }

  return value as unknown as ChallengeRegistry;
}

export function getChallengePath(challengeId: string): string {
  const p = path.resolve(CHALLENGES_ROOT, challengeId);
  if (!fs.existsSync(p)) throw new Error(`Challenge "${challengeId}" not found`);
  return p;
}

async function getCurrentVersion(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      versions: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!challenge) {
    throw new Error(`Challenge "${challengeId}" not found. Run db:seed to sync challenge manifests.`);
  }

  const version =
    challenge.versions.find((candidate) => candidate.version === challenge.version) ??
    challenge.versions[0];

  if (!version) {
    throw new Error(`Challenge "${challengeId}" has no version snapshot. Run db:seed to create one.`);
  }

  return version;
}

function buildStepInfo(
  manager: StepContentManager,
  step: ChallengeStepRegistryEntry,
): StepInfo {
  const content = manager.loadStep(step);

  return {
    id: content.id,
    title: content.title,
    prompt: content.prompt,
    explanation: content.explanation,
    solution: content.solution,
    visibleTestPath: step.visibleTestPath,
    hiddenTestPath: step.hiddenTestPath,
    hasStarter: content.hasStarter,
    starterRoot: content.starterRoot,
    workspaceRoot: content.workspaceRoot,
    entrypoint: content.entrypoint,
    interactiveLesson: content.interactiveLesson,
    position: content.position,
    codeFiles: content.codeFiles,
    requiresTerminal: content.requiresTerminal,
    timeoutMs: step.timeoutMs,
    server: step.server,
  };
}

export async function getChallengeInfo(challengeId: string): Promise<ChallengeInfo> {
  const version = await getCurrentVersion(challengeId);
  const registry = asRegistry(version.stepRegistry);
  const challengePath = getChallengePath(registry.id);
  const manager = new StepContentManager(challengePath);
  const steps = registry.steps.map((step) => buildStepInfo(manager, step));

  if (steps.length === 0) throw new Error(`Challenge "${challengeId}" has no steps`);

  return {
    challengeVersionId: version.id,
    id: version.challengeId,
    version: version.version,
    title: version.title,
    language: version.language,
    runtime: version.runtime,
    challengeType: version.challengeType,
    description: version.description ?? undefined,
    defaultTimeoutMs: registry.defaultTimeoutMs,
    entrypoint: registry.entrypoint,
    server: registry.server,
    systemRequirements: isRecord(version.systemRequirements)
      ? version.systemRequirements
      : undefined,
    steps,
    challengePath,
  };
}

export async function listChallenges(): Promise<ChallengeSummary[]> {
  const challenges = await prisma.challenge.findMany({
    include: {
      versions: {
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { title: "asc" },
  });

  return challenges.flatMap((challenge) => {
    const version =
      challenge.versions.find((candidate) => candidate.version === challenge.version) ??
      challenge.versions[0];

    if (!version) return [];

    const registry = asRegistry(version.stepRegistry);

    return [{
      id: challenge.id,
      title: version.title,
      version: version.version,
      language: version.language,
      runtime: version.runtime,
      stepCount: registry.steps.length,
    }];
  });
}

export function getNextStepId(challenge: ChallengeInfo, currentStepId: string): string | undefined {
  const idx = challenge.steps.findIndex((s) => s.id === currentStepId);
  if (idx === -1) throw new Error(`Step "${currentStepId}" not found`);
  return challenge.steps[idx + 1]?.id;
}

export function getStepOrThrow(challenge: ChallengeInfo, stepId?: string): StepInfo {
  if (!stepId) {
    const first = challenge.steps[0];
    if (!first) throw new Error(`Challenge "${challenge.id}" has no steps`);
    return first;
  }
  const step = challenge.steps.find((s) => s.id === stepId);
  if (!step) throw new Error(`Step "${stepId}" not found in challenge "${challenge.id}"`);
  return step;
}
