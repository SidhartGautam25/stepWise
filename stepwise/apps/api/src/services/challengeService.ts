/**
 * Challenge Service — challenge catalog and prompt loading.
 * Wraps the disk-based challenge catalog + DB step lookups.
 */

import fs from "fs";
import path from "path";

const CHALLENGES_ROOT = path.resolve(__dirname, "../../../../challenges");

export interface CodeFile {
  filename: string;
  language: string;
  diffContent: string;
  finalCode: string;
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
  position: number;
  codeFiles?: CodeFile[];
}

export interface ChallengeInfo {
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

export function getChallengePath(challengeId: string): string {
  const p = path.resolve(CHALLENGES_ROOT, challengeId);
  if (!fs.existsSync(p)) throw new Error(`Challenge "${challengeId}" not found`);
  return p;
}

export function getChallengeInfo(challengeId: string): ChallengeInfo {
  const challengePath = getChallengePath(challengeId);
  const manifest = JSON.parse(
    fs.readFileSync(path.resolve(challengePath, "challenge.json"), "utf-8"),
  ) as unknown;

  if (!isRecord(manifest) || !Array.isArray(manifest.steps)) {
    throw new Error(`Invalid challenge manifest for "${challengeId}"`);
  }

  const steps: StepInfo[] = manifest.steps.map((s: unknown, i: number) => {
    if (!isRecord(s)) throw new Error(`Invalid step at index ${i}`);

    const stepId = readString(s.id, `steps[${i}].id`);
    const stepDir = path.resolve(challengePath, "steps", stepId);
    const workspaceConfig = isRecord(s.workspace) ? s.workspace : undefined;
    const workspaceRoot =
      typeof workspaceConfig?.root === "string"
        ? workspaceConfig.root
        : `steps/${stepId}/workspace`;
    const starterRoot =
      typeof workspaceConfig?.starter === "string"
        ? workspaceConfig.starter
        : `steps/${stepId}/starter`;
    const entrypoint =
      typeof workspaceConfig?.entrypoint === "string"
        ? workspaceConfig.entrypoint
        : typeof s.entrypoint === "string"
          ? s.entrypoint
          : "index.js";
    const starterDir = path.resolve(challengePath, starterRoot);

    let prompt: string | undefined;
    if (typeof s.prompt === "string") {
      const promptPath = path.resolve(stepDir, s.prompt);
      if (fs.existsSync(promptPath)) {
        prompt = fs.readFileSync(promptPath, "utf-8");
      }
    }

    let explanation: string | undefined;
    if (typeof s.explanation === "string") {
      const explanationPath = path.resolve(stepDir, s.explanation);
      if (fs.existsSync(explanationPath)) {
        explanation = fs.readFileSync(explanationPath, "utf-8");
      }
    }

    let solution: string | undefined;
    if (typeof s.solution === "string") {
      const solutionPath = path.resolve(stepDir, s.solution);
      if (fs.existsSync(solutionPath)) {
        solution = fs.readFileSync(solutionPath, "utf-8");
      }
    }

    let codeFiles: CodeFile[] | undefined;
    const codeJsonPath = path.resolve(stepDir, "code.json");
    if (fs.existsSync(codeJsonPath)) {
      try {
        const parsedCode = JSON.parse(fs.readFileSync(codeJsonPath, "utf-8"));
        if (Array.isArray(parsedCode)) {
          codeFiles = parsedCode as CodeFile[];
        }
      } catch (err) {
        console.warn(`Failed to parse code.json for step ${stepId}:`, err);
      }
    }

    return {
      id: stepId,
      title: readString(s.title, `steps[${i}].title`),
      prompt,
      explanation,
      solution,
      hasStarter: fs.existsSync(starterDir),
      starterRoot,
      workspaceRoot,
      entrypoint,
      position: i + 1,
      codeFiles,
    };
  });

  if (steps.length === 0) throw new Error(`Challenge "${challengeId}" has no steps`);

  return {
    id: readString(manifest.id, "id"),
    version: readString(manifest.version, "version"),
    title: readString(manifest.title, "title"),
    language: readString(manifest.language, "language"),
    runtime: readString(manifest.runtime, "runtime"),
    description: typeof manifest.description === "string" ? manifest.description : undefined,
    systemRequirements: isRecord(manifest.systemRequirements) ? manifest.systemRequirements : undefined,
    steps,
    challengePath,
  };
}

export function listChallenges(): ChallengeSummary[] {
  if (!fs.existsSync(CHALLENGES_ROOT)) return [];

  return fs.readdirSync(CHALLENGES_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => {
      try {
        const info = getChallengeInfo(e.name);
        return [{
          id: info.id,
          title: info.title,
          version: info.version,
          language: info.language,
          runtime: info.runtime,
          stepCount: info.steps.length,
        }];
      } catch {
        return [];
      }
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
