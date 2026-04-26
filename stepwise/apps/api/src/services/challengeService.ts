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

    const interactiveLesson = parseInteractiveLesson(
      challengePath,
      stepDir,
      s.interactiveLesson,
    );

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
      interactiveLesson,
      position: i + 1,
      codeFiles,
      requiresTerminal: typeof s.requiresTerminal === "boolean" ? s.requiresTerminal : true,
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
