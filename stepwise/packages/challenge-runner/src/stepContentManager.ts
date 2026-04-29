import fs from "fs";
import path from "path";

export interface StepContentRegistryEntry {
  id: string;
  title: string;
  position: number;
  promptPath?: string;
  explanationPath?: string;
  solutionPath?: string;
  visibleTestPath?: string;
  hiddenTestPath?: string;
  workspaceRoot?: string;
  starterRoot?: string;
  entrypoint?: string;
  free?: boolean;
  requiresTerminal?: boolean;
  timeoutMs?: number;
  interactiveLesson?: {
    type: string;
    contentPath: string;
  };
  interactiveLessonContent?: unknown;
  renderConfig?: unknown;
}

export interface InteractiveLessonSlideAdvance {
  mode: "exact" | "prefix";
  value: string;
}

export interface InteractiveLessonSlide {
  id: string;
  heading: string;
  body: string;
  bullets?: string[];
  illustration?: unknown;
  advanceOnCommand?: InteractiveLessonSlideAdvance;
}

export interface InteractiveLesson {
  type: "sequence";
  slides: InteractiveLessonSlide[];
}

export interface CodeFileContent {
  filename: string;
  language: string;
  diffContent: string;
  finalCode: string;
}

export interface LoadedStepContent {
  id: string;
  title: string;
  position: number;
  prompt?: string;
  explanation?: string;
  solution?: string;
  hasStarter: boolean;
  starterRoot?: string;
  workspaceRoot?: string;
  entrypoint?: string;
  interactiveLesson?: InteractiveLesson;
  codeFiles?: CodeFileContent[];
  requiresTerminal: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Content field "${field}" is required`);
  }

  return value;
}

function readOptionalFile(root: string, relativePath?: string): string | undefined {
  if (!relativePath) return undefined;

  const filePath = path.resolve(root, relativePath);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : undefined;
}

export class StepContentManager {
  private readonly cache = new Map<string, LoadedStepContent>();

  constructor(private readonly challengeRoot: string) {}

  loadStep(step: StepContentRegistryEntry): LoadedStepContent {
    const cacheKey = `${this.challengeRoot}:${step.id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const stepDir = path.resolve(this.challengeRoot, "steps", step.id);
    const workspaceRoot = step.workspaceRoot ?? `steps/${step.id}/workspace`;
    const starterRoot = step.starterRoot ?? `steps/${step.id}/starter`;
    const entrypoint = step.entrypoint ?? "index.js";
    const starterDir = path.resolve(this.challengeRoot, starterRoot);

    const lesson = step.interactiveLesson
      ? this.loadInteractiveLesson(stepDir, step.interactiveLesson, step.interactiveLessonContent)
      : undefined;

    let promptPlain = readOptionalFile(this.challengeRoot, step.promptPath);
    let explanationPlain = readOptionalFile(this.challengeRoot, step.explanationPath);

    /** Single interactive-sequence file can replace standalone prompt/explanation markdown. */
    if (!promptPlain && lesson?.slides?.[0]) {
      const s = lesson.slides[0];
      promptPlain = `# ${s.heading}\n\n${s.body}`;
    }
    if (!explanationPlain && lesson?.slides?.[1]) {
      const s = lesson.slides[1];
      explanationPlain = `# ${s.heading}\n\n${s.body}`;
    }

    const content: LoadedStepContent = {
      id: step.id,
      title: step.title,
      position: step.position,
      prompt: promptPlain,
      explanation: explanationPlain,
      solution: readOptionalFile(this.challengeRoot, step.solutionPath),
      hasStarter: fs.existsSync(starterDir),
      starterRoot,
      workspaceRoot,
      entrypoint,
      interactiveLesson: lesson,
      codeFiles: this.loadCodeFiles(stepDir, step.id),
      requiresTerminal: step.requiresTerminal ?? true,
    };

    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }

  private loadCodeFiles(
    stepDir: string,
    stepId: string,
  ): CodeFileContent[] | undefined {
    const codeJsonPath = path.resolve(stepDir, "code.json");
    if (!fs.existsSync(codeJsonPath)) return undefined;

    try {
      const parsed = JSON.parse(fs.readFileSync(codeJsonPath, "utf-8")) as unknown;
      return Array.isArray(parsed) ? (parsed as CodeFileContent[]) : undefined;
    } catch (err) {
      console.warn(`Failed to parse code.json for step ${stepId}:`, err);
      return undefined;
    }
  }

  private loadInteractiveLesson(
    stepDir: string,
    lesson: { type: string; contentPath: string },
    content?: unknown,
  ): InteractiveLesson | undefined {
    if (lesson.type !== "sequence") return undefined;

    const lessonPath = path.resolve(stepDir, path.basename(lesson.contentPath));
    if (!content && !fs.existsSync(lessonPath)) {
      throw new Error(`Interactive lesson file not found: ${lessonPath}`);
    }

    const parsed = content ?? JSON.parse(fs.readFileSync(lessonPath, "utf-8")) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.slides)) {
      throw new Error(`Invalid interactive lesson content: ${lessonPath}`);
    }

    return {
      type: "sequence",
      slides: parsed.slides.map((slide, index) => {
        if (!isRecord(slide)) {
          throw new Error(`Invalid interactive lesson slide at index ${index}`);
        }

        const advance = isRecord(slide.advanceOnCommand)
          ? {
              mode:
                slide.advanceOnCommand.mode === "exact" ? ("exact" as const) : ("prefix" as const),
              value: readString(
                slide.advanceOnCommand.value,
                `slides[${index}].advanceOnCommand.value`,
              ),
            }
          : undefined;

        return {
          id: readString(slide.id, `slides[${index}].id`),
          heading: readString(slide.heading, `slides[${index}].heading`),
          body: readString(slide.body, `slides[${index}].body`),
          bullets: Array.isArray(slide.bullets)
            ? slide.bullets.filter((bullet): bullet is string => typeof bullet === "string")
            : undefined,
          illustration: isRecord(slide.illustration) ? slide.illustration : undefined,
          advanceOnCommand: advance,
        };
      }),
    };
  }
}
