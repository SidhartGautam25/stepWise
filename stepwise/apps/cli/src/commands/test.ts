import { runChallenge } from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";
import { readLocalTestCommandConfig } from "./test-config";
import { requestStartAttempt, submitRunnerResult } from "./test-api";

async function main() {
  const config = readLocalTestCommandConfig();
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

  console.log(
    JSON.stringify(
      {
        attempt: startedAttempt,
        result,
        progression: submittedResult,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "CLI execution failed");
  process.exit(1);
});
