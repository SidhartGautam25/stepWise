import { runChallenge } from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";
import {
  getLocalTestHelpText,
  readLocalTestCommandConfig,
} from "./test-config";
import { requestStartAttempt, submitRunnerResult } from "./test-api";
import { renderStudentFacingResult } from "./test-output";

async function main() {
  const config = readLocalTestCommandConfig();

  if (config.helpRequested) {
    console.log(getLocalTestHelpText());
    return;
  }

  const tester = new NodeTester();

  const startedAttempt = await requestStartAttempt({
    apiBaseUrl: config.apiBaseUrl,
    challengeId: config.challengeId,
    userId: config.userId,
    stepId: config.stepId,
  });

  const result = await runChallenge({
    attemptId: startedAttempt.attemptId,
    challengePath: config.challengePath,
    tester,
    userCodePath: config.userCodePath,
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
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "CLI execution failed");
  process.exit(1);
});
