/**
 * Challenge Service — challenge catalog and prompt loading.
 * Wraps the disk-based challenge catalog + DB step lookups.
 */

import fs from "fs";
import path from "path";
import { prisma, type ChallengeRegistry, type ChallengeStepRegistryEntry } from "@repo/db";

const CHALLENGES_ROOT = path.resolve(__dirname, "../../../../challenges");

export interface CodeFile {
  filename: string;
  language: string;
  diffContent: string;
  finalCode: string;
}

export interface InteractiveLessonSlide {
  id: string;
  heading: string;
  body: string;
  bullets?: string[];
}

export interface InteractiveLesson {
  type: "sequence";
  slides: InteractiveLessonSlide[];
}

export interface StepInfo {
  id: string;
  title: string;
  prompt?: string;
  explanation?: string;
  solution?: string;
  hasStarter: boolean;
  starterRoot?: string;
  workspaceRoot?: string;
  entrypoint?: string;
  interactiveLesson?: InteractiveLesson;
  position: number;
  codeFiles?: CodeFile[];
  requiresTerminal?: boolean;
}

export interface ChallengeInfo {
  challengeVersionId: string;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  description?: string;
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

function readString(v: unknown, field: string): string {
  if (typeof v !== "string" || !v) throw new Error(`Manifest field "${field}" is required`);
  return v;
}

function asRegistry(value: unknown): ChallengeRegistry {
  if (!isRecord(value) || !Array.isArray(value.steps)) {
    throw new Error("Challenge version has an invalid step registry");
  }

  return value as unknown as ChallengeRegistry;
}

function parseInteractiveLesson(
  challengePath: string,
  stepDir: string,
  value: unknown,
): InteractiveLesson | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (value.type !== "sequence" || typeof value.content !== "string") {
    return undefined;
  }

  const lessonPath = path.resolve(stepDir, value.content);

  if (!fs.existsSync(lessonPath)) {
    throw new Error(`Interactive lesson file not found: ${lessonPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(lessonPath, "utf-8")) as unknown;

  if (!isRecord(parsed) || !Array.isArray(parsed.slides)) {
    throw new Error(`Invalid interactive lesson content for ${challengePath}`);
  }

  return {
    type: "sequence",
    slides: parsed.slides.map((slide, index) => {
      if (!isRecord(slide)) {
        throw new Error(`Invalid interactive lesson slide at index ${index}`);
      }

      return {
        id: readString(slide.id, `interactiveLesson.slides[${index}].id`),
        heading: readString(
          slide.heading,
          `interactiveLesson.slides[${index}].heading`,
        ),
        body: readString(slide.body, `interactiveLesson.slides[${index}].body`),
        bullets: Array.isArray(slide.bullets)
          ? slide.bullets
              .filter((bullet): bullet is string => typeof bullet === "string")
          : undefined,
      };
    }),
  };
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

function readOptionalFile(root: string, relativePath?: string): string | undefined {
  if (!relativePath) return undefined;

  const filePath = path.resolve(root, relativePath);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : undefined;
}

function buildStepInfo(
  challengePath: string,
  step: ChallengeStepRegistryEntry,
): StepInfo {
  const stepDir = path.resolve(challengePath, "steps", step.id);
  const workspaceRoot = step.workspaceRoot ?? `steps/${step.id}/workspace`;
  const starterRoot = step.starterRoot ?? `steps/${step.id}/starter`;
  const entrypoint = step.entrypoint ?? "index.js";
  const starterDir = path.resolve(challengePath, starterRoot);

  const prompt = readOptionalFile(challengePath, step.promptPath);
  const explanation = readOptionalFile(challengePath, step.explanationPath);
  const solution = readOptionalFile(challengePath, step.solutionPath);

  let codeFiles: CodeFile[] | undefined;
  const codeJsonPath = path.resolve(stepDir, "code.json");
  if (fs.existsSync(codeJsonPath)) {
    try {
      const parsedCode = JSON.parse(fs.readFileSync(codeJsonPath, "utf-8"));
      if (Array.isArray(parsedCode)) {
        codeFiles = parsedCode as CodeFile[];
      }
    } catch (err) {
      console.warn(`Failed to parse code.json for step ${step.id}:`, err);
    }
  }

  const interactiveLesson = step.interactiveLesson
    ? parseInteractiveLesson(challengePath, stepDir, {
        type: step.interactiveLesson.type,
        content: path.basename(step.interactiveLesson.contentPath),
      })
    : undefined;

  return {
    id: step.id,
    title: step.title,
    prompt,
    explanation,
    solution,
    hasStarter: fs.existsSync(starterDir),
    starterRoot,
    workspaceRoot,
    entrypoint,
    interactiveLesson,
    position: step.position,
    codeFiles,
    requiresTerminal: step.requiresTerminal,
  };
}

export async function getChallengeInfo(challengeId: string): Promise<ChallengeInfo> {
  const version = await getCurrentVersion(challengeId);
  const registry = asRegistry(version.stepRegistry);
  const challengePath = getChallengePath(registry.id);
  const steps = registry.steps.map((step) => buildStepInfo(challengePath, step));

  if (steps.length === 0) throw new Error(`Challenge "${challengeId}" has no steps`);

  return {
    challengeVersionId: version.id,
    id: version.challengeId,
    version: version.version,
    title: version.title,
    language: version.language,
    runtime: version.runtime,
    description: version.description ?? undefined,
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
