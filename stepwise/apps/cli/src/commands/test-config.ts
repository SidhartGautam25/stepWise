import path from "path";
import fs from "fs";
import { parseLocalWorkspaceConfig, LOCAL_WORKSPACE_CONFIG_FILENAME } from "@repo/types";

export interface LocalTestCommandConfig {
  apiBaseUrl: string;
  challengeId: string;
  userId: string;
  stepId?: string;
  challengePath: string;
  userCodePath?: string;
  workspaceDir?: string;
  jsonOutput: boolean;
  helpRequested: boolean;
}

const HELP_TEXT = `
Usage:
  stepwise test [options]

Options:
  --api <url>               API base URL. Default: http://127.0.0.1:4000
  --challenge <id>          Challenge id. Default: promise-basic
  --challenge-path <path>   Override challenge directory path (absolute)
  --code <path>             Override user code path for the selected step
  --step <id>               Explicit step id to run
  --user <id>               User id. Default: student-local
  --json                    Print raw JSON output instead of student-facing text
  --help                    Show this help message

When run from a folder initialized with "stepwise init", all options are read
automatically from the .stepwise.json file — no flags needed.
`.trim();

/**
 * Returns the directory where the student actually ran `npx stepwise`.
 *
 * When invoked via `npx`, npm sets INIT_CWD to the original working directory
 * before npm changes into the package directory. This is the authoritative
 * source for "where the student is standing."
 *
 * Falls back to process.cwd() for direct node/tsx invocations in development.
 */
export function getInvocationDir(): string {
  return process.env.INIT_CWD ?? process.cwd();
}

/**
 * Walks up from `startDir` looking for a .stepwise.json config file.
 * Returns the config and the directory it was found in, or undefined.
 */
function findWorkspaceConfig(
  startDir: string,
): { config: ReturnType<typeof parseLocalWorkspaceConfig>; dir: string } | undefined {
  let dir = startDir;

  for (let i = 0; i < 6; i++) {
    const configPath = path.resolve(dir, LOCAL_WORKSPACE_CONFIG_FILENAME);

    if (fs.existsSync(configPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(configPath, "utf-8")) as unknown;
        return { config: parseLocalWorkspaceConfig(raw), dir };
      } catch {
        // Malformed config — fall through to flag-based parsing
        return undefined;
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) break; // filesystem root
    dir = parent;
  }

  return undefined;
}

export function readLocalTestCommandConfig(): LocalTestCommandConfig {
  // Slice past the command word ("test") — commandIndex is set by index.ts dispatcher
  const commandIndex = (process as any).__stepwiseCommandIndex ?? 2;
  const args = parseArgs(process.argv.slice(commandIndex + 1));

  // If --help was requested, return early
  if (args.help === "true") {
    return {
      apiBaseUrl: "",
      challengeId: "",
      userId: "",
      challengePath: "",
      jsonOutput: false,
      helpRequested: true,
    };
  }

  // Try to auto-detect config from the student's invocation directory
  const foundConfig = findWorkspaceConfig(getInvocationDir());

  if (foundConfig && Object.keys(args).length === 0) {
    // Zero-flag mode — run entirely from .stepwise.json
    const { config, dir } = foundConfig;
    return {
      apiBaseUrl: config.apiBaseUrl,
      challengeId: config.challengeId,
      userId: config.userId,
      stepId: config.currentStepId,
      challengePath: "" , // resolved by server/runner from challengeId
      userCodePath: undefined, // runner will use defaultUserCodePath if undefined, but we will override in test.ts
      workspaceDir: dir,
      jsonOutput: false,
      helpRequested: false,
    };
  }

  // Flag-based mode (legacy / developer override)
  const challengeId = args.challenge ?? (foundConfig?.config.challengeId) ?? "promise-basic";
  const userId = args.user ?? foundConfig?.config.userId ?? "student-local";
  const apiBaseUrl = args.api ?? foundConfig?.config.apiBaseUrl ?? process.env.STEPWISE_API_URL ?? "https://api.stepwise.run";
  const stepId = args.step ?? foundConfig?.config.currentStepId;

  return {
    apiBaseUrl,
    challengeId,
    userId,
    stepId,
    challengePath:
      args["challenge-path"] ??
      path.resolve(__dirname, `../../../../challenges/${challengeId}`),
    userCodePath: args.code,
    workspaceDir: foundConfig?.dir ?? getInvocationDir(),
    jsonOutput: args.json === "true",
    helpRequested: false,
  };
}

export function getLocalTestHelpText(): string {
  return HELP_TEXT;
}

function parseArgs(argv: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg?.startsWith("--")) {
      throw new Error(`Unexpected argument "${arg}". Use --help for usage.`);
    }

    const key = arg.slice(2);

    if (key === "help") {
      parsed.help = "true";
      continue;
    }

    if (key === "json") {
      parsed.json = "true";
      continue;
    }

    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for "--${key}"`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}
