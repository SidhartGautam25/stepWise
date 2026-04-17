import path from "path";
import { Tester, RuntimeContext, TestCase } from "@repo/challenge-runner";
import { runInSandbox } from "./sandbox";

export class NodeTester implements Tester {
  async prepare(): Promise<RuntimeContext> {
    return { runtime: null }; // not used anymore
  }

  async execute(test: TestCase, context: RuntimeContext): Promise<void> {
    throw new Error("Not used in sandbox mode");
  }

  async runAllTests(userCodePath: string, challengePath: string) {
    const scriptPath = path.resolve(__dirname, "runner-script.js");

    const result: any = await runInSandbox(
      scriptPath,
      [userCodePath, challengePath],
      3000,
    );

    return result.results;
  }

  async cleanup(): Promise<void> {}
}
