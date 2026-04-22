import path from "path";
import fs from "fs";
import pc from "picocolors";
import { fetchChallengeInfo } from "./init-api";
import { provisionWorkspace, readWorkspaceConfig } from "./workspace";
import {
  renderInitResult,
  renderInitError,
  renderAlreadyInitialized,
} from "./init-output";
import { getStoredCredentials } from "../credentials";

interface InitCommandConfig {
  challengeId: string;
  stepId?: string;
  targetDir: string;
  userId: string;
  apiBaseUrl: string;
  showPrompt: boolean;
  helpRequested: boolean;
}

const HELP_TEXT = `
Usage:
  stepwise init <quest-id> [options]

Options:
  --step <id>         Start at a specific step (default: first step)
  --dir <path>        Output directory for the workspace (default: ./<quest-id>)
  --user <id>         User id (default: student-local, replace with real id when auth is added)
  --api <url>         API base URL (default: http://127.0.0.1:4000)
  --no-prompt         Do not print the step prompt/instructions
  --help              Show this help message

Examples:
  stepwise init promise-basic
  stepwise init promise-basic --step return-42
  stepwise init promise-basic --dir ~/my-quests/promises
`.trim();

function parseInitArgs(argv: string[]): InitCommandConfig {
  const parsed: Record<string, string> = {};
  let showPrompt = true;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help") {
      return {
        challengeId: "",
        targetDir: "",
        userId: "",
        apiBaseUrl: "",
        showPrompt: true,
        helpRequested: true,
      };
    }

    if (arg === "--no-prompt") {
      showPrompt = false;
      continue;
    }

    if (arg?.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for "${arg}"`);
      }
      parsed[key] = value;
      i += 1;
      continue;
    }

    // Positional: challenge id
    if (!parsed._challengeId) {
      parsed._challengeId = arg ?? "";
      continue;
    }

    throw new Error(`Unexpected argument "${arg}". Use --help for usage.`);
  }

  const challengeId = parsed._challengeId ?? "";

  if (!challengeId) {
    throw new Error(
      'Please specify a quest id. Example: stepwise init promise-basic\nRun "stepwise init --help" for usage.',
    );
  }

  return {
    challengeId,
    stepId: parsed.step,
    targetDir: parsed.dir
      ? path.resolve(parsed.dir)
      : path.resolve(process.cwd(), challengeId),
    userId: parsed.user ?? "",   // resolved from credentials below
    apiBaseUrl: parsed.api ?? process.env.STEPWISE_API_URL ?? "https://api.stepwise.run",
    showPrompt,
    helpRequested: false,
  };
}

export async function main() {
  let config: InitCommandConfig;

  try {
    // Slice past the command word ("init") — commandIndex is set by index.ts dispatcher
    const commandIndex = (process as any).__stepwiseCommandIndex ?? 2;
    config = parseInitArgs(process.argv.slice(commandIndex + 1));
  } catch (err) {
    console.error(renderInitError(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }

  if (config.helpRequested) {
    console.log(HELP_TEXT);
    return;
  }

  // Resolve userId from stored credentials
  const creds = getStoredCredentials();

  if (!creds) {
    console.error(renderInitError(
      "Not logged in. Run `stepwise login` first to get a token.",
    ));
    process.exit(1);
  }

  const userId = config.userId || creds.userId;

  console.log(pc.dim(`\n  Fetching quest "${config.challengeId}" from API...`));

  let challenge;
  try {
    challenge = await fetchChallengeInfo(config.challengeId, config.apiBaseUrl);
  } catch (err) {
    console.error(renderInitError(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }

  // Resolve which step to start on
  const step = config.stepId
    ? challenge.steps.find((s) => s.id === config.stepId)
    : challenge.steps[0];

  if (!step) {
    const msg = config.stepId
      ? `Step "${config.stepId}" not found in quest "${challenge.id}". Available steps: ${challenge.steps.map((s) => s.id).join(", ")}`
      : `Quest "${challenge.id}" has no steps.`;
    console.error(renderInitError(msg));
    process.exit(1);
  }

  // Check if workspace for this step already exists
  const stepDir = path.resolve(config.targetDir, step.id);
  const existingConfig = readWorkspaceConfig(stepDir);

  if (existingConfig) {
    console.log(renderAlreadyInitialized(step, stepDir));
    return;
  }

  // Provision the workspace
  let provisioned;
  try {
    provisioned = provisionWorkspace(
      challenge,
      step,
      config.targetDir,
      userId,
      config.apiBaseUrl,
    );
  } catch (err) {
    console.error(renderInitError(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }

  console.log(renderInitResult(challenge, provisioned, config.showPrompt));
}


