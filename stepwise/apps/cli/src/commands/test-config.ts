import path from "path";

export interface LocalTestCommandConfig {
  apiBaseUrl: string;
  challengeId: string;
  userId: string;
  stepId?: string;
  challengePath: string;
  userCodePath?: string;
}

export function readLocalTestCommandConfig(): LocalTestCommandConfig {
  const challengeId = process.env.STEPWISE_CHALLENGE_ID ?? "promise-basic";
  const userId = process.env.STEPWISE_USER_ID ?? "student-local";
  const stepId = readOptionalArg("--step");
  const challengePath =
    process.env.STEPWISE_CHALLENGE_PATH ??
    path.resolve(__dirname, `../../../../challenges/${challengeId}`);
  const userCodePath = process.env.STEPWISE_USER_CODE_PATH;

  return {
    apiBaseUrl: process.env.STEPWISE_API_URL ?? "http://127.0.0.1:4000",
    challengeId,
    userId,
    stepId,
    challengePath,
    userCodePath,
  };
}

function readOptionalArg(flag: string): string | undefined {
  const flagIndex = process.argv.indexOf(flag);

  if (flagIndex === -1) {
    return undefined;
  }

  return process.argv[flagIndex + 1];
}
