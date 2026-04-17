export type ExecutionMode = "local" | "server";
export type TestVisibility = "visible" | "hidden";
export type TestStatus = "pass" | "fail" | "error" | "timeout";

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
  tests: {
    visible: string;
    hidden?: string;
  };
  entrypoint?: string;
  timeoutMs?: number;
}

export interface ChallengeManifest {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  entrypoint?: string;
  defaultTimeoutMs?: number;
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
  stepId: string;
  stepTitle: string;
  testFilePath: string;
  hiddenTestFilePath?: string;
  defaultEntrypoint?: string;
  timeoutMs: number;
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
