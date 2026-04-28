import { spawn } from "child_process";
import path from "path";
import {
  BulkRunInput,
  BulkTester,
  RuntimeContext,
  TestCase,
  TesterRegistration,
  TestResult,
} from "@repo/challenge-runner";

interface CommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number;
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<CommandResult> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      resolve({
        exitCode: null,
        stdout,
        stderr: `${stderr}\nCommand timed out after ${timeoutMs}ms`.trim(),
        duration: Date.now() - startedAt,
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        exitCode: null,
        stdout,
        stderr: err.message,
        duration: Date.now() - startedAt,
      });
    });

    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        exitCode,
        stdout,
        stderr,
        duration: Date.now() - startedAt,
      });
    });
  });
}

export class RustTester implements BulkTester {
  async prepare(_userCodePath: string): Promise<RuntimeContext> {
    return { runtime: null };
  }

  async execute(_test: TestCase, _context: RuntimeContext): Promise<void> {}

  async cleanup(_context?: RuntimeContext): Promise<void> {}

  async runAllTests(input: BulkRunInput): Promise<TestResult[]> {
    const workspaceDir = path.resolve(input.userCodePath);
    const timeoutMs = input.challenge.timeoutMs;
    const cargo = input.executablePath ?? "cargo";
    const result = await runCommand(cargo, ["test", "--quiet"], workspaceDir, timeoutMs);
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();

    if (result.exitCode === 0) {
      return [{
        name: "cargo test",
        status: "pass",
        duration: result.duration,
        visibility: "visible",
      }];
    }

    return [{
      name: "cargo test",
      status: result.exitCode === null ? "timeout" : "fail",
      error: output || `cargo test exited with code ${result.exitCode}`,
      duration: result.duration,
      visibility: "visible",
    }];
  }
}

export const testerRegistration: TesterRegistration = {
  name: "rust",
  supportedRuntimes: ["rust"],
  supportedChallengeTypes: ["function"],
  create: () => new RustTester(),
  canHandle: ({ runtime, challengeType }) =>
    runtime === "rust" && challengeType === "function",
};
