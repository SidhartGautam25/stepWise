import {
  parseStartAttemptResponse,
  parseSubmitResultResponse,
  StartAttemptResponse,
  SubmitResultResponse,
} from "../../../../packages/attempt-contracts/src";
import { RunChallengeResult } from "@repo/challenge-runner";
import { getStoredCredentials } from "../credentials";
import { apiErrorMessage, postJson } from "../api-client";

interface StartAttemptInput {
  apiBaseUrl: string;
  challengeId: string;
  userId: string;   // kept for type compat; API overrides from JWT
  stepId?: string;
}

interface SubmitResultInput {
  apiBaseUrl: string;
  attemptId: string;
  userId: string;   // kept for type compat; API overrides from JWT
  result: RunChallengeResult;
}

/**
 * Returns the Authorization header value from stored credentials.
 * Throws with a clear CLI message if not logged in.
 */
function getAuthHeader(): string {
  const creds = getStoredCredentials();

  if (!creds) {
    throw new Error("Not logged in. Run `stepwise login` first.");
  }

  const expiresAt = new Date(creds.expiresAt).getTime();
  if (Date.now() > expiresAt) {
    throw new Error("Your session has expired. Run `stepwise login` to refresh.");
  }

  return `Bearer ${creds.token}`;
}

export async function requestStartAttempt(
  input: StartAttemptInput,
): Promise<StartAttemptResponse> {
  const response = await postJson(input.apiBaseUrl, "/attempts/start", {
    challengeId: input.challengeId,
    userId: input.userId,   // API ignores this, uses JWT sub instead
    mode: "local",
    stepId: input.stepId,
  }, {
    authorization: getAuthHeader(),
  });

  return parseStartAttemptResponse(readApiResponse(response));
}

export async function submitRunnerResult(
  input: SubmitResultInput,
): Promise<SubmitResultResponse> {
  const response = await postJson(input.apiBaseUrl, "/attempts/submit-result", {
    attemptId: input.attemptId,
    userId: input.userId,   // API ignores this, uses JWT sub instead
    result: input.result,
  }, {
    authorization: getAuthHeader(),
  });

  return parseSubmitResultResponse(readApiResponse(response));
}

function readApiResponse(response: Awaited<ReturnType<typeof postJson>>): unknown {
  if (!response.ok) {
    throw new Error(apiErrorMessage(response.payload, response.status));
  }

  return response.payload;
}
