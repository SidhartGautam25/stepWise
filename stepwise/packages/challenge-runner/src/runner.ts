import { resolveChallengeStep } from "./challengeManifest";
import { loadTests } from "./testLoader";
import { runWithTimeout } from "./utils/timeout";
import {
  BulkTester,
  RunChallengeInput,
  RunChallengeResult,
  TestResult,
} from "./types";

// export async function runChallenge(
//   input: RunChallengeInput,
// ): Promise<RunChallengeResult> {
//   const startTime = Date.now();

//   const { tester, userCodePath, challengePath, timeout = 2000 } = input;

//   // 1. Load tests
//   const tests = loadTests(challengePath);

//   // 2. Prepare runtime
//   const context = await tester.prepare(userCodePath);

//   const results: TestResult[] = [];

//   // 3. Execute tests
//   for (const test of tests) {
//     const testStart = Date.now();

//     try {
//       await runWithTimeout(
//         tester.execute(test, context),
//         test.timeout || timeout,
//       );

//       results.push({
//         name: test.name,
//         status: "pass",
//         duration: Date.now() - testStart,
//       });
//     } catch (err: any) {
//       let status: TestResult["status"] = "error";

//       if (err.message === "TIMEOUT") {
//         status = "timeout";
//       } else if (err.message?.includes("Assertion")) {
//         status = "fail";
//       }

//       results.push({
//         name: test.name,
//         status,
//         error: err.message,
//         duration: Date.now() - testStart,
//       });
//     }
//   }

//   // 4. Cleanup
//   await tester.cleanup(context);

//   const endTime = Date.now();

//   return {
//     total: results.length,
//     passed: results.filter((r) => r.status === "pass").length,
//     failed: results.filter((r) => r.status !== "pass").length,
//     results,
//     executionTime: endTime - startTime,
//   };
// }

export async function runChallenge(
  input: RunChallengeInput,
): Promise<RunChallengeResult> {
  const startTime = Date.now();

  const {
    tester,
    challengePath,
    userCodePath,
    stepId,
    timeout,
    mode = "local",
    attemptId,
  } = input;
  const challenge = resolveChallengeStep(challengePath, stepId, timeout);
  const resolvedUserCodePath = userCodePath ?? challenge.defaultUserCodePath;

  if (!resolvedUserCodePath) {
    throw new Error("A userCodePath is required to run this challenge");
  }

  if ("runAllTests" in tester && typeof tester.runAllTests === "function") {
    const results = await (tester as BulkTester).runAllTests({
      userCodePath: resolvedUserCodePath,
      challenge,
      executablePath: input.executablePath,
    });

    return {
      attemptId,
      challengeId: challenge.challengeId,
      challengeVersion: challenge.challengeVersion,
      stepId: challenge.stepId,
      mode,
      total: results.length,
      passed: results.filter((r: any) => r.status === "pass").length,
      failed: results.filter((r: any) => r.status !== "pass").length,
      results,
      executionTime: Date.now() - startTime,
    };
  }

  const tests = loadTests(challenge.testFilePath);
  const context = await tester.prepare(resolvedUserCodePath);

  const results: TestResult[] = [];

  for (const test of tests) {
    const testStart = Date.now();

    try {
      await runWithTimeout(
        tester.execute(test, context),
        test.timeout ?? challenge.timeoutMs,
      );

      results.push({
        name: test.name,
        status: "pass",
        duration: Date.now() - testStart,
        visibility: "visible",
      });
    } catch (err: any) {
      const status = err.message === "TIMEOUT" ? "timeout" : "fail";

      results.push({
        name: test.name,
        status,
        error: err.message,
        duration: Date.now() - testStart,
        visibility: "visible",
      });
    }
  }

  await tester.cleanup(context);

  return {
    attemptId,
    challengeId: challenge.challengeId,
    challengeVersion: challenge.challengeVersion,
    stepId: challenge.stepId,
    mode,
    total: results.length,
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status !== "pass").length,
    results,
    executionTime: Date.now() - startTime,
  };
}
