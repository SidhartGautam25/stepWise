/*

-> language agnostic engine
      -> challenge-runner must NOT know Node/Go

-> pluggable testers
      -> we should be able to add new language support without touching the 
         challenge-runner 
-> deterministic execution and result collection
      -> for same input we should get same output irrespective of the 
         language or test harness used

-> isolated execution environment
      -> user code should run in isolated environment to prevent any security

-> observable execution
      -> each stage should be inspectable and we should be able to collect logs, errors, 
         and results at each stage

// system architecture

CLI / Worker
     ↓
challenge-runner (engine)
     ↓
tester (node/go)
     ↓
sandbox (process isolation)
     ↓
test execution
     ↓
result aggregation


// Interfaces

-> tester interface

interface Tester {
  prepare(userCodePath: string): Promise<RuntimeContext>;
  execute(test: TestCase, context: RuntimeContext): Promise<void>;
  cleanup(context: RuntimeContext): Promise<void>;
}

prepare → load/build environment
execute → run each test
cleanup → free resources


-> runtimeContext

interface RuntimeContext {
  runtime: any;
  metadata?: Record<string, any>;
}

-> Testcases
interface TestCase {
  name: string;
  fn: (runtime: any) => Promise<void> | void;
  timeout?: number;
}

-> Runner Input
interface RunChallengeInput {
  userCodePath: string;
  challengePath: string;
  tester: Tester;
  timeout?: number;
}

-> result modal
interface TestResult {
  name: string;
  status: "pass" | "fail" | "error" | "timeout";
  error?: string;
  duration: number;
}

interface RunChallengeResult {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  executionTime: number;
}

// Execution lifecycle

1. Load tests
2. tester.prepare()
3. For each test:
    - enforce timeout
    - tester.execute()
    - capture result
4. tester.cleanup()
5. return aggregated result



// Timeout handling
- use setTimeout to enforce time limits on test execution
- if timeout occurs, mark test as "timeout" and proceed to next test
- ensure cleanup is called even in case of timeout


-> Sandbox layer

interface Sandbox {
  run(command: string, args: string[]): Promise<ExecutionResult>;
}

NodeTester may use:

direct require (dev)
child_process (safe)
Docker (cloud)


-> Node Tester design
-> responsibilities:
          1. load JS module
          2. provide runtime
          3. execute test

-> flow

1. prepare():
  require(userCode)

2. execute():
  call test.fn(runtime)

3. cleanup():
  clear cache (optional)

// edge cases to handle 
      -> require cache pollution
      -> async errors
      -> rejected promises








*/
