import crypto from "crypto";
import fs from "fs";
import path from "path";

export const CHALLENGE_REGISTRY_SCHEMA_VERSION = 1;

export interface ChallengeStepRegistryEntry {
  id: string;
  title: string;
  position: number;
  difficulty?: string;
  estimatedMinutes?: number;
  prerequisites: string[];
  promptPath?: string;
  explanationPath?: string;
  solutionPath?: string;
  visibleTestPath?: string;
  hiddenTestPath?: string;
  workspaceRoot?: string;
  starterRoot?: string;
  entrypoint?: string;
  free: boolean;
  timeoutMs?: number;
  server?: Record<string, unknown>;
  interactiveLessonId?: string;
  interactiveLesson?: {
    type: string;
    contentPath: string;
  };
  interactiveLessonContent?: unknown;
  raw: Record<string, unknown>;
}

export interface ChallengeRegistry {
  schemaVersion: number;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  type: string;
  mode?: string;
  description?: string;
  difficulty?: string;
  tags: string[];
  capabilities: string[];
  systemRequirements?: Record<string, unknown>;
  defaultTimeoutMs?: number;
  entrypoint?: string;
  server?: Record<string, unknown>;
  sourcePath: string;
  manifestPath: string;
  manifestHash: string;
  steps: ChallengeStepRegistryEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Manifest field "${field}" is required`);
  }

  return value;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function relativeStepPath(
  stepId: string,
  filename: unknown,
): string | undefined {
  const name = readOptionalString(filename);
  return name ? `steps/${stepId}/${name}` : undefined;
}

function inferCapabilities(manifest: Record<string, unknown>): string[] {
  const capabilities = new Set<string>();
  const runtime = readOptionalString(manifest.runtime);
  const mode = readOptionalString(manifest.mode);
  const type = readOptionalString(manifest.type);

  if (runtime) capabilities.add(runtime);
  if (mode) capabilities.add(`${mode}-mode`);
  if (type === "server") capabilities.add("server-runner");
  if (runtime === "node") capabilities.add("cli-runner");
  if (runtime === "web-terminal" || mode === "web")
    capabilities.add("web-terminal");

  return Array.from(capabilities);
}

function parseStep(step: unknown, index: number): ChallengeStepRegistryEntry {
  if (!isRecord(step)) {
    throw new Error(`Invalid challenge manifest step at index ${index}`);
  }

  const id = readRequiredString(step.id, `steps[${index}].id`);
  const workspace = isRecord(step.workspace) ? step.workspace : undefined;
  const tests = isRecord(step.tests) ? step.tests : undefined;
  const interactiveLesson = isRecord(step.interactiveLesson)
    ? step.interactiveLesson
    : undefined;
  const interactiveContent = readOptionalString(interactiveLesson?.content);

  return {
    id,
    title: readRequiredString(step.title, `steps[${index}].title`),
    position: index + 1,
    difficulty: readOptionalString(step.difficulty),
    estimatedMinutes: readOptionalNumber(step.estimatedMinutes),
    prerequisites: readStringArray(step.prerequisites),
    promptPath: relativeStepPath(id, step.prompt),
    explanationPath: relativeStepPath(id, step.explanation),
    solutionPath: relativeStepPath(id, step.solution),
    visibleTestPath: readOptionalString(tests?.visible),
    hiddenTestPath: readOptionalString(tests?.hidden),
    workspaceRoot: readOptionalString(workspace?.root),
    starterRoot: readOptionalString(workspace?.starter),
    entrypoint:
      readOptionalString(workspace?.entrypoint) ??
      readOptionalString(step.entrypoint),
    free: typeof step.free === "boolean" ? step.free : true,
    timeoutMs: readOptionalNumber(step.timeoutMs),
    server: isRecord(step.server) ? step.server : undefined,
    interactiveLessonId: readOptionalString(step.interactiveLessonId),
    interactiveLesson:
      interactiveLesson && interactiveContent
        ? {
            type: readOptionalString(interactiveLesson.type) ?? "sequence",
            contentPath: `steps/${id}/${interactiveContent}`,
        }
        : undefined,
    raw: step,
  };
}

function readJsonFile(filePath: string): unknown | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
}

export function buildChallengeRegistry(
  challengeDir: string,
): ChallengeRegistry {
  const sourcePath = path.resolve(challengeDir);
  const manifestPath = path.resolve(sourcePath, "challenge.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Challenge manifest not found at ${manifestPath}`);
  }

  const manifestText = fs.readFileSync(manifestPath, "utf-8");
  const parsed = JSON.parse(manifestText) as unknown;

  if (!isRecord(parsed) || !Array.isArray(parsed.steps)) {
    throw new Error(`Invalid challenge manifest at ${manifestPath}`);
  }

  return {
    schemaVersion: CHALLENGE_REGISTRY_SCHEMA_VERSION,
    id: readRequiredString(parsed.id, "id"),
    version: readRequiredString(parsed.version, "version"),
    title: readRequiredString(parsed.title, "title"),
    language: readRequiredString(parsed.language, "language"),
    runtime: readRequiredString(parsed.runtime, "runtime"),
    type: readOptionalString(parsed.type) ?? "function",
    mode: readOptionalString(parsed.mode),
    description: readOptionalString(parsed.description),
    difficulty: readOptionalString(parsed.difficulty),
    tags: readStringArray(parsed.tags),
    capabilities: inferCapabilities(parsed),
    systemRequirements: isRecord(parsed.systemRequirements)
      ? parsed.systemRequirements
      : undefined,
    defaultTimeoutMs:
      typeof parsed.defaultTimeoutMs === "number" &&
      Number.isFinite(parsed.defaultTimeoutMs)
        ? parsed.defaultTimeoutMs
        : undefined,
    entrypoint: readOptionalString(parsed.entrypoint),
    server: isRecord(parsed.server) ? parsed.server : undefined,
    sourcePath,
    manifestPath,
    manifestHash: crypto
      .createHash("sha256")
      .update(manifestText)
      .digest("hex"),
    steps: parsed.steps.map((step, index) => {
      const parsedStep = parseStep(step, index);
      const lessonPath = parsedStep.interactiveLesson?.contentPath
        ? path.resolve(sourcePath, parsedStep.interactiveLesson.contentPath)
        : undefined;

      return {
        ...parsedStep,
        interactiveLessonContent: lessonPath
          ? readJsonFile(lessonPath)
          : undefined,
      };
    }),
  };
}
