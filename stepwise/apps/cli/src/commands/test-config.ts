import path from "path";

export interface LocalTestCommandConfig {
  apiBaseUrl: string;
  challengeId: string;
  userId: string;
  stepId?: string;
  challengePath: string;
  userCodePath?: string;
  helpRequested: boolean;
}

const HELP_TEXT = `
Usage:
  stepwise test [options]

Options:
  --api <url>               API base URL. Default: http://127.0.0.1:4000
  --challenge <id>          Challenge id. Default: promise-basic
  --challenge-path <path>   Override challenge directory path
  --code <path>             Override user code path for the selected step
  --step <id>               Explicit step id to run
  --user <id>               User id. Default: student-local
  --help                    Show this help message
`.trim();

export function readLocalTestCommandConfig(): LocalTestCommandConfig {
  const args = parseArgs(process.argv.slice(2));
  const challengeId = args.challenge ?? "promise-basic";

  return {
    apiBaseUrl: args.api ?? "http://127.0.0.1:4000",
    challengeId,
    userId: args.user ?? "student-local",
    stepId: args.step,
    challengePath:
      args["challenge-path"] ??
      path.resolve(__dirname, `../../../../challenges/${challengeId}`),
    userCodePath: args.code,
    helpRequested: args.help === "true",
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

    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for "--${key}"`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}
