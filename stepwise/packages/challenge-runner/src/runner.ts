import { RunChallengeInput, RunChallengeResult, TestResult } from "./types";
import { loadTests } from "./testLoader";
import { runWithTimeout } from "./utils/timeout";

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

  const { tester, userCodePath, challengePath, timeout = 2000 } = input;

  // 🚨 NEW: bulk execution path (sandbox)
  if ("runAllTests" in tester && typeof tester.runAllTests === "function") {
    const results = await tester.runAllTests(userCodePath, challengePath);

    return {
      total: results.length,
      passed: results.filter((r: any) => r.status === "pass").length,
      failed: results.filter((r: any) => r.status !== "pass").length,
      results,
      executionTime: Date.now() - startTime,
    };
  }

  // 👇 OLD fallback (non-sandbox mode)
  const tests = loadTests(challengePath);
  const context = await tester.prepare(userCodePath);

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      await tester.execute(test, context);

      results.push({
        name: test.name,
        status: "pass",
        duration: 0,
      });
    } catch (err: any) {
      results.push({
        name: test.name,
        status: "fail",
        error: err.message,
        duration: 0,
      });
    }
  }

  await tester.cleanup(context);

  return {
    total: results.length,
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status !== "pass").length,
    results,
    executionTime: Date.now() - startTime,
  };
}
