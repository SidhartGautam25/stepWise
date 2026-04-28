import path from "path";
import pc from "picocolors";
import {
  runChallenge,
  installRuntime,
  TesterRegistry,
  type ResolvedChallengeStep,
} from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";
import { ServerTester } from "@repo/tester-server";
import {
  getLocalTestHelpText,
  readLocalTestCommandConfig,
  getInvocationDir,
} from "./test-config";
import { requestStartAttempt, submitRunnerResult } from "./test-api";
import { renderStudentFacingResult } from "./test-output";
import { fetchChallengeInfo } from "./init-api";
import {
  advanceWorkspace,
  readWorkspaceConfig,
} from "./workspace";
import type { ChallengeInfoResponse, ChallengeStepInfo } from "@repo/types";

export async function main() {
  const config = readLocalTestCommandConfig();

  if (config.helpRequested) {
    console.log(getLocalTestHelpText());
    return;
  }

  let challengeInfo;
  try {
    challengeInfo = await fetchChallengeInfo(config.challengeId, config.apiBaseUrl);
  } catch (err) {
    console.error(
      `\n${pc.bold(pc.red("✗ Could not fetch challenge registry"))}\n\n  ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }

  // ── Pick tester from pluggable registry using DB-backed metadata ─────────
  const testerRegistry = createCliTesterRegistry();
  const tester = testerRegistry.getTester({
    runtime: challengeInfo.runtime,
    challengeType: challengeInfo.challengeType,
    language: challengeInfo.language,
  });
  const isServerChallenge = challengeInfo.challengeType === "server";

  const startedAttempt = await requestStartAttempt({
    apiBaseUrl: config.apiBaseUrl,
    challengeId: config.challengeId,
    userId: config.userId,
    stepId: config.stepId,
  });
  const stepInfo = challengeInfo.steps.find((step) => step.id === startedAttempt.step.id);
  if (!stepInfo) {
    throw new Error(
      `Step "${startedAttempt.step.id}" was returned by the API attempt flow but is missing from the challenge registry.`,
    );
  }

  const resolvedStep = resolveStepFromApiRegistry(challengeInfo, stepInfo);

  if (!resolvedStep.defaultUserCodePath) {
    throw new Error(
      `Step "${startedAttempt.step.id}" does not declare a runnable entrypoint.`,
    );
  }

  const relativeEntrypoint = path.relative(
    resolvedStep.workspacePath,
    resolvedStep.defaultUserCodePath,
  );

  // For server challenges: pass the workspace DIRECTORY (ServerTester uses it to
  //   find server.js and start the process). For function challenges: path to index.js.
  const baseDir = config.workspaceDir ?? getInvocationDir();
  const defaultLocalCodePath = config.workspaceDir
    ? path.resolve(baseDir, relativeEntrypoint || "index.js")
    : resolvedStep.defaultUserCodePath;
  const userCodePath = isServerChallenge
    ? baseDir  // ServerTester resolves server.js within this directory
    : (config.userCodePath ?? defaultLocalCodePath);

  // ── Isolate BYOB Runtime Environment ─────────────────────────────────────
  let executablePath: string | undefined;
  
  if (challengeInfo.language) {
    try {
      // Temporarily default to node v20.12.0 for all Javascript/Node testing natively.
      const version = challengeInfo.runtime === "node" ? "v20.12.0" : "latest";
      executablePath = await installRuntime(challengeInfo.runtime || "node", version);
    } catch (err) {
      console.warn(`\n${pc.yellow("⚠ Warning:")} Could not forcefully isolate local runtime. Proceeding with system fallback...\n`);
    }
  }

  const result = await runChallenge({
    attemptId: startedAttempt.attemptId,
    challengePath: challengeInfo.challengePath,
    tester,
    resolvedChallenge: resolvedStep,
    userCodePath,
    stepId: startedAttempt.step.id,
    mode: "local",
    executablePath,
  });

  const submittedResult = await submitRunnerResult({
    apiBaseUrl: config.apiBaseUrl,
    attemptId: startedAttempt.attemptId,
    userId: config.userId,
    result,
  });

  const output = {
    attempt: startedAttempt,
    workspaceDir: config.workspaceDir ?? baseDir,
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

function createCliTesterRegistry() {
  return new TesterRegistry()
    .register({
      name: "server",
      supportedRuntimes: ["node"],
      supportedChallengeTypes: ["server"],
      create: () => new ServerTester(),
    })
    .register({
      name: "node",
      supportedRuntimes: ["node"],
      supportedChallengeTypes: ["function"],
      create: () => new NodeTester(),
    });
}

function resolveStepFromApiRegistry(
  challenge: ChallengeInfoResponse,
  step: ChallengeStepInfo,
): ResolvedChallengeStep {
  if (!step.visibleTestPath) {
    throw new Error(
      `Step "${step.id}" does not declare a visible test path in the DB registry.`,
    );
  }

  const challengePath = path.resolve(challenge.challengePath);
  const workspaceRelativePath = step.workspaceRoot ?? ".";
  const workspacePath = path.resolve(challengePath, workspaceRelativePath);
  const entrypoint =
    step.entrypoint ?? challenge.entrypoint ?? "index.js";

  return {
    challengePath,
    manifestPath: path.resolve(challengePath, "challenge.json"),
    challengeId: challenge.id,
    challengeVersion: challenge.version,
    challengeTitle: challenge.title,
    language: challenge.language,
    runtime: challenge.runtime,
    challengeType: challenge.challengeType,
    stepId: step.id,
    stepTitle: step.title,
    testFilePath: path.resolve(challengePath, step.visibleTestPath),
    hiddenTestFilePath: step.hiddenTestPath
      ? path.resolve(challengePath, step.hiddenTestPath)
      : undefined,
    workspacePath,
    starterPath: step.starterRoot
      ? path.resolve(challengePath, step.starterRoot)
      : undefined,
    defaultUserCodePath: path.resolve(workspacePath, entrypoint),
    timeoutMs: step.timeoutMs ?? challenge.defaultTimeoutMs ?? 2000,
    serverConfig:
      challenge.challengeType === "server"
        ? { ...challenge.server, ...step.server }
        : undefined,
  };
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
