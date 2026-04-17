export type AttemptMode = "local";
export type AttemptStatus = "started" | "submitted";
export type AttemptOutcome = "passed" | "failed";
export type TestStatus = "pass" | "fail" | "error" | "timeout";
export type TestVisibility = "visible" | "hidden";

export interface AttemptTestResult {
  name: string;
  status: TestStatus;
  error?: string;
  duration: number;
  visibility?: TestVisibility;
}

export interface AttemptExecutionResult {
  challengeId: string;
  challengeVersion: string;
  stepId: string;
  mode: AttemptMode;
  total: number;
  passed: number;
  failed: number;
  results: AttemptTestResult[];
  executionTime: number;
}

export interface StartAttemptRequest {
  challengeId: string;
  userId: string;
  mode: AttemptMode;
  stepId?: string;
}

export interface AttemptStepSummary {
  id: string;
  title: string;
}

export interface StartAttemptResponse {
  attemptId: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  mode: AttemptMode;
  status: AttemptStatus;
  startedAt: string;
  step: AttemptStepSummary;
  nextStepId?: string;
}

export interface SubmitResultRequest {
  attemptId: string;
  userId: string;
  result: AttemptExecutionResult;
}

export interface SubmitResultResponse {
  attemptId: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  stepId: string;
  outcome: AttemptOutcome;
  submittedAt: string;
  nextStepId?: string;
  challengeCompleted: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${field}`);
  }

  return value;
}

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid ${field}`);
  }

  return value;
}

function readAttemptMode(value: unknown, field: string): AttemptMode {
  if (value !== "local") {
    throw new Error(`Invalid ${field}`);
  }

  return value;
}

function readTestStatus(value: unknown, field: string): TestStatus {
  if (
    value !== "pass" &&
    value !== "fail" &&
    value !== "error" &&
    value !== "timeout"
  ) {
    throw new Error(`Invalid ${field}`);
  }

  return value;
}

function readVisibility(
  value: unknown,
  field: string,
): TestVisibility | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value !== "visible" && value !== "hidden") {
    throw new Error(`Invalid ${field}`);
  }

  return value;
}

export function parseStartAttemptRequest(
  payload: unknown,
): StartAttemptRequest {
  if (!isRecord(payload)) {
    throw new Error("Invalid start attempt payload");
  }

  return {
    challengeId: readString(payload.challengeId, "challengeId"),
    userId: readString(payload.userId, "userId"),
    mode: readAttemptMode(payload.mode, "mode"),
    stepId:
      payload.stepId === undefined
        ? undefined
        : readString(payload.stepId, "stepId"),
  };
}

export function parseAttemptExecutionResult(
  payload: unknown,
): AttemptExecutionResult {
  if (!isRecord(payload)) {
    throw new Error("Invalid result payload");
  }

  const rawResults = payload.results;

  if (!Array.isArray(rawResults)) {
    throw new Error("Invalid results");
  }

  return {
    challengeId: readString(payload.challengeId, "result.challengeId"),
    challengeVersion: readString(
      payload.challengeVersion,
      "result.challengeVersion",
    ),
    stepId: readString(payload.stepId, "result.stepId"),
    mode: readAttemptMode(payload.mode, "result.mode"),
    total: readNumber(payload.total, "result.total"),
    passed: readNumber(payload.passed, "result.passed"),
    failed: readNumber(payload.failed, "result.failed"),
    executionTime: readNumber(
      payload.executionTime,
      "result.executionTime",
    ),
    results: rawResults.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(`Invalid result.results[${index}]`);
      }

      return {
        name: readString(entry.name, `result.results[${index}].name`),
        status: readTestStatus(
          entry.status,
          `result.results[${index}].status`,
        ),
        error:
          entry.error === undefined
            ? undefined
            : readString(entry.error, `result.results[${index}].error`),
        duration: readNumber(
          entry.duration,
          `result.results[${index}].duration`,
        ),
        visibility: readVisibility(
          entry.visibility,
          `result.results[${index}].visibility`,
        ),
      };
    }),
  };
}

export function parseSubmitResultRequest(payload: unknown): SubmitResultRequest {
  if (!isRecord(payload)) {
    throw new Error("Invalid submit result payload");
  }

  return {
    attemptId: readString(payload.attemptId, "attemptId"),
    userId: readString(payload.userId, "userId"),
    result: parseAttemptExecutionResult(payload.result),
  };
}
