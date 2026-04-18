import path from "path";
import {
  registerWorkspaceAliases,
  runWithTimeout,
} from "@repo/challenge-runner";

async function main() {
  const userCodePath = process.argv[2];
  const testFilePath = process.argv[3];
  const timeoutArg = process.argv[4];
  const timeoutMs = timeoutArg ? Number(timeoutArg) : 2000;

  if (!userCodePath || !testFilePath) {
    console.error("Missing arguments: userCodePath or testFilePath");
    process.exit(1);
  }

  try {
    registerWorkspaceAliases();

    const userModule = require(path.resolve(userCodePath));
    const tests = require(path.resolve(testFilePath));
    const results = [];

    for (const test of tests) {
      const testStart = Date.now();

      try {
        await runWithTimeout(
          Promise.resolve(test.fn(userModule)),
          test.timeout ?? timeoutMs,
        );

        results.push({
          name: test.name,
          status: "pass",
          duration: Date.now() - testStart,
          visibility: "visible",
        });
      } catch (err: any) {
        results.push({
          name: test.name,
          status: err.message === "TIMEOUT" ? "timeout" : "fail",
          error: err.message,
          duration: Date.now() - testStart,
          visibility: "visible",
        });
      }
    }

    console.log(JSON.stringify({ results, logs: { stdout: "", stderr: "" } }));
    process.exit(0);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
