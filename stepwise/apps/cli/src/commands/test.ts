import path from "path";
import fs from "fs";
import pc from "picocolors";
import { runChallenge } from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";
import {
  getLocalTestHelpText,
  readLocalTestCommandConfig,
  getInvocationDir,
} from "./test-config";
import { requestStartAttempt, submitRunnerResult } from "./test-api";
import { renderStudentFacingResult } from "./test-output";
import { fetchChallengeInfo } from "./init-api";
import {
  writeWorkspaceConfig,
  advanceWorkspace,
  readWorkspaceConfig,
} from "./workspace";
import { parseLocalWorkspaceConfig, LOCAL_WORKSPACE_CONFIG_FILENAME } from "@repo/types";

async function main() {
  const config = readLocalTestCommandConfig();

  if (config.helpRequested) {
    console.log(getLocalTestHelpText());
    return;
  }

  // Determine the challenge source path.
  // In zero-flag / .stepwise.json mode, challengePath is empty string.
  // We need to fetch the challenge info from the API to get the real path.
  let challengePath = config.challengePath;

  if (!challengePath) {
    let challengeInfo;
    try {
      challengeInfo = await fetchChallengeInfo(config.challengeId, config.apiBaseUrl);
    } catch (err) {
      console.error(
        `\n${pc.bold(pc.red("✗ Could not resolve challenge path"))}\n\n  ${err instanceof Error ? err.message : String(err)}\n`,
      );
      process.exit(1);
    }
    challengePath = challengeInfo.challengePath;
  }

  const tester = new NodeTester();

  const startedAttempt = await requestStartAttempt({
    apiBaseUrl: config.apiBaseUrl,
    challengeId: config.challengeId,
    userId: config.userId,
    stepId: config.stepId,
  });

  // Resolve user code path: use explicit --code flag, or fall back to index.js in the workspace dir
  const baseDir = config.workspaceDir ?? getInvocationDir();
  const userCodePath =
    config.userCodePath ??
    path.resolve(baseDir, "index.js");

  const result = await runChallenge({
    attemptId: startedAttempt.attemptId,
    challengePath,
    tester,
    userCodePath,
    stepId: startedAttempt.step.id,
    mode: "local",
  });

  const submittedResult = await submitRunnerResult({
    apiBaseUrl: config.apiBaseUrl,
    attemptId: startedAttempt.attemptId,
    userId: config.userId,
    result,
  });

  const output = {
    attempt: startedAttempt,
    result,
    progression: submittedResult,
  };

  if (config.jsonOutput) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(renderStudentFacingResult(output));

  // ── Auto-advance workspace to next step ──────────────────────────────────
  // When running from a .stepwise.json workspace and the student passed,
  // automatically provision the next step folder and update the config.
  if (
    submittedResult.outcome === "passed" &&
    submittedResult.nextStepId &&
    !config.jsonOutput
  ) {
    await tryAdvanceWorkspace(
      config.challengeId,
      submittedResult.nextStepId,
      config.apiBaseUrl,
      config.userId,
    );
  }
}

/**
 * If the cwd is a stepwise workspace, advance to the next step automatically.
 */
async function tryAdvanceWorkspace(
  challengeId: string,
  nextStepId: string,
  apiBaseUrl: string,
  userId: string,
) {
  const invocationDir = getInvocationDir();
  const existingConfig = readWorkspaceConfig(invocationDir);
  if (!existingConfig) return; // Not a workspace dir, skip silently

  try {
    const challengeInfo = await fetchChallengeInfo(challengeId, apiBaseUrl);
    const nextStep = challengeInfo.steps.find((s) => s.id === nextStepId);
    if (!nextStep) return;

    const provisioned = advanceWorkspace(
      challengeInfo,
      nextStep,
      invocationDir,
      existingConfig,
    );

    console.log(
      `\n${pc.bold(pc.cyan("→ Next step ready:"))} ${nextStep.title}`,
    );
    console.log(
      `  ${pc.dim("cd")} ${pc.cyan(path.relative(path.dirname(invocationDir), provisioned.stepDir) + "/")}`,
    );
    console.log("");
  } catch {
    // Non-fatal — workspace advance is a convenience, not required
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "CLI execution failed");
  process.exit(1);
});
