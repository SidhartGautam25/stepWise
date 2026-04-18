import {
  parseStartAttemptResponse,
  parseSubmitResultResponse,
  StartAttemptResponse,
  SubmitResultResponse,
} from "../../../../packages/attempt-contracts/src";
import { RunChallengeResult } from "@repo/challenge-runner";
import { getStoredCredentials } from "../credentials";

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
  const response = await fetch(`${input.apiBaseUrl}/attempts/start`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": getAuthHeader(),
    },
    body: JSON.stringify({
      challengeId: input.challengeId,
      userId: input.userId,   // API ignores this, uses JWT sub instead
      mode: "local",
      stepId: input.stepId,
    }),
  });

  return parseStartAttemptResponse(await readApiResponse(response));
}

export async function submitRunnerResult(
  input: SubmitResultInput,
): Promise<SubmitResultResponse> {
  const response = await fetch(`${input.apiBaseUrl}/attempts/submit-result`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": getAuthHeader(),
    },
    body: JSON.stringify({
      attemptId: input.attemptId,
      userId: input.userId,   // API ignores this, uses JWT sub instead
      result: input.result,
    }),
  });

  return parseSubmitResultResponse(await readApiResponse(response));
}

async function readApiResponse(response: Response): Promise<unknown> {
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as Record<string, unknown>).error === "string"
    ) {
      throw new Error((payload as Record<string, unknown>).error as string);
    }

    throw new Error(`API request failed with status ${response.status}`);
  }

  return payload;
}
