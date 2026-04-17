export interface RuntimeContext {
  runtime: any;
  metadata?: Record<string, any>;
}

export interface TestCase {
  name: string;
  fn: (runtime: any) => Promise<void> | void;
  timeout?: number;
}

export interface Tester {
  prepare(userCodePath: string): Promise<RuntimeContext>;
  execute(test: TestCase, context: RuntimeContext): Promise<void>;
  cleanup(context: RuntimeContext): Promise<void>;
}

export interface RunChallengeInput {
  userCodePath: string;
  challengePath: string;
  tester: Tester;
  timeout?: number;
}

export interface TestResult {
  name: string;
  status: "pass" | "fail" | "error" | "timeout";
  error?: string;
  duration: number;
}

export interface RunChallengeResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  executionTime: number;
}
