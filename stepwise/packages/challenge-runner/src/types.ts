export type ExecutionMode = "local" | "server";
export type TestVisibility = "visible" | "hidden";
export type TestStatus = "pass" | "fail" | "error" | "timeout";
export type ChallengeType = "function" | "server";
export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Server-specific config — how to start the student's process and
 * where to probe readiness. All fields are optional (we have sane defaults).
 */
export interface ServerConfig {
  /** Script to execute via `node <startScript>`. Default: "server.js" */
  startScript?: string;
  /** Env var name for the port. Default: "PORT" */
  portEnvVar?: string;
  /** Path to probe for readiness. Default: "/health" */
  readyEndpoint?: string;
  /** Max ms to wait for server to become ready. Default: 6000 */
  startupTimeoutMs?: number;
}

export interface RuntimeContext {
  runtime: unknown;
  metadata?: Record<string, unknown>;
}

export interface TestCase {
  name: string;
  fn: (runtime: unknown) => Promise<void> | void;
  timeout?: number;
}

export interface ChallengeStepManifest {
  id: string;
  title: string;
  prompt?: string;
  /** If true this step is accessible without a paid subscription. Default: true */
  free?: boolean;
  tests: {
    visible: string;
    hidden?: string;
  };
  workspace?: {
    root: string;
    starter?: string;
    entrypoint?: string;
  };
  entrypoint?: string;
  timeoutMs?: number;
  /** Server-challenge overrides for this specific step */
  server?: ServerConfig;
}

export interface ChallengeManifest {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  /** "function" = pure JS module tests; "server" = HTTP server tests. Default: "function" */
  type?: ChallengeType;
  description?: string;
  difficulty?: Difficulty;
  tags?: string[];
  entrypoint?: string;
  defaultTimeoutMs?: number;
  /** Default server config for all steps (steps can override). Only used when type=="server" */
  server?: ServerConfig;
  steps: ChallengeStepManifest[];
}

export interface ResolvedChallengeStep {
  challengePath: string;
  manifestPath: string;
  challengeId: string;
  challengeVersion: string;
  challengeTitle: string;
  language: string;
  runtime: string;
  challengeType: ChallengeType;
  stepId: string;
  stepTitle: string;
  testFilePath: string;
  hiddenTestFilePath?: string;
  workspacePath: string;
  starterPath?: string;
  defaultUserCodePath?: string;
  timeoutMs: number;
  /** Merged server config (manifest defaults + step override). Populated for type=="server" only */
  serverConfig?: ServerConfig;
}

export interface BulkRunInput {
  userCodePath: string;
  challenge: ResolvedChallengeStep;
}

export interface Tester {
  prepare(userCodePath: string): Promise<RuntimeContext>;
  execute(test: TestCase, context: RuntimeContext): Promise<void>;
  cleanup(context: RuntimeContext): Promise<void>;
}

export interface BulkTester extends Tester {
  runAllTests(input: BulkRunInput): Promise<TestResult[]>;
}

export interface RunChallengeInput {
  challengePath: string;
  tester: Tester;
  userCodePath?: string;
  stepId?: string;
  timeout?: number;
  mode?: ExecutionMode;
  attemptId?: string;
}

export interface TestResult {
  name: string;
  status: TestStatus;
  error?: string;
  duration: number;
  visibility?: TestVisibility;
}

export interface RunChallengeResult {
  attemptId?: string;
  challengeId: string;
  challengeVersion: string;
  stepId: string;
  mode: ExecutionMode;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  executionTime: number;
}
