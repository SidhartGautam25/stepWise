/**
 * ServerTester — starts the student's HTTP server, runs HTTP-based tests, kills the process.
 *
 * Implements BulkTester so the existing runChallenge() can call runAllTests()
 * and get back TestResult[] in exactly the same format as NodeTester.
 *
 * Test file contract:
 *   module.exports = async function runTests({ fetch, baseUrl, restartServer }) {
 *     return [{ name, status: "pass"|"fail"|"error", error?, duration }];
 *   };
 */

import net from "net";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import {
  BulkTester,
  BulkRunInput,
  TestResult,
  RuntimeContext,
  TestCase,
} from "@repo/challenge-runner";

// ─── Port utilities ───────────────────────────────────────────────────────────

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const port = Math.floor(Math.random() * 10000) + 40000; // 40000–49999
    const probe = net.createServer();
    probe.once("error", () => findFreePort().then(resolve, reject));
    probe.once("listening", () => probe.close(() => resolve(port)));
    probe.listen(port, "127.0.0.1");
  });
}

// ─── Process lifecycle ────────────────────────────────────────────────────────

interface ServerHandle {
  port: number;
  baseUrl: string;
  kill(): Promise<void>;
}

function spawnServer(
  workspaceDir: string,
  startScript: string,
  portEnvVar: string,
  port: number,
): ChildProcess {
  const scriptPath = path.resolve(workspaceDir, startScript);
  return spawn("node", [scriptPath], {
    cwd: workspaceDir,
    env: { ...process.env, [portEnvVar]: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function startServer(
  workspaceDir: string,
  startScript: string,
  portEnvVar: string,
  port: number,
): Promise<ServerHandle> {
  const proc = spawnServer(workspaceDir, startScript, portEnvVar, port);
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    port,
    baseUrl,
    kill: () =>
      new Promise<void>((resolve) => {
        if (proc.killed || proc.exitCode !== null) return resolve();
        proc.once("exit", () => resolve());
        proc.kill("SIGTERM");
        setTimeout(() => { if (!proc.killed) proc.kill("SIGKILL"); }, 2000);
      }),
  };
}

async function waitForReady(
  baseUrl: string,
  readyEndpoint: string,
  startupTimeoutMs: number,
): Promise<void> {
  const url = `${baseUrl}${readyEndpoint}`;
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch { /* not ready yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }

  throw new Error(
    `Server did not become ready at ${url} within ${startupTimeoutMs}ms.\n` +
    `Make sure your server listens on the PORT environment variable.`,
  );
}

// ─── Test loader ──────────────────────────────────────────────────────────────

type ServerTestFn = (ctx: {
  fetch: typeof globalThis.fetch;
  baseUrl: string;
  restartServer: () => Promise<void>;
}) => Promise<TestResult[]>;

function loadServerTestFn(testFilePath: string): ServerTestFn {
  delete require.cache[require.resolve(testFilePath)];
  const mod = require(testFilePath) as unknown;

  if (typeof mod !== "function") {
    throw new Error(
      `Server test file must export an async function. Got: ${typeof mod}\n  at ${testFilePath}`,
    );
  }

  return mod as ServerTestFn;
}

// ─── ServerTester ─────────────────────────────────────────────────────────────

export class ServerTester implements BulkTester {
  async prepare(_userCodePath: string): Promise<RuntimeContext> {
    return { runtime: null };
  }

  async execute(_test: TestCase, _context: RuntimeContext): Promise<void> { }

  async cleanup(_context?: RuntimeContext): Promise<void> { }

  async runAllTests(input: BulkRunInput): Promise<TestResult[]> {
    const { challenge } = input;

    // Use the resolved server config attached by resolveChallengeStep()
    const cfg = challenge.serverConfig ?? {};
    const startScript: string = cfg.startScript ?? "server.js";
    const portEnvVar: string = cfg.portEnvVar ?? "PORT";
    const readyEndpoint: string = cfg.readyEndpoint ?? "/health";
    const startupTimeoutMs: number = cfg.startupTimeoutMs ?? 6000;

    // IMPORTANT: use input.userCodePath (the student's workspace dir),
    // NOT challenge.workspacePath (which is the template location in challenge repo).
    const workspaceDir = input.userCodePath;

    const port = await findFreePort();
    let handle = await startServer(workspaceDir, startScript, portEnvVar, port);

    try {
      await waitForReady(handle.baseUrl, readyEndpoint, startupTimeoutMs);
    } catch (err) {
      await handle.kill();
      return [{
        name: "Server starts and becomes ready",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        duration: 0,
        visibility: "visible",
      }];
    }

    const testFn = loadServerTestFn(challenge.testFilePath);
    let results: TestResult[] = [];

    try {
      results = await testFn({
        fetch: globalThis.fetch,
        baseUrl: handle.baseUrl,
        // restartServer: kills current process, starts a fresh one on same port
        restartServer: async () => {
          await handle.kill();
          await new Promise((r) => setTimeout(r, 400));
          handle = await startServer(workspaceDir, startScript, portEnvVar, port);
          await waitForReady(handle.baseUrl, readyEndpoint, startupTimeoutMs);
        },
      });
    } catch (err) {
      results = [{
        name: "Test suite execution",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        duration: 0,
        visibility: "visible",
      }];
    } finally {
      await handle.kill();
    }

    return results.map((r) => ({ ...r, visibility: r.visibility ?? "visible" }));
  }
}
