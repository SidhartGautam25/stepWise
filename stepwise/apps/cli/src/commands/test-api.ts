import {
  parseStartAttemptResponse,
  parseSubmitResultResponse,
  StartAttemptResponse,
  SubmitResultResponse,
} from "../../../../packages/attempt-contracts/src";
import { RunChallengeResult } from "@repo/challenge-runner";

interface StartAttemptInput {
  apiBaseUrl: string;
  challengeId: string;
  userId: string;
  stepId?: string;
}

interface SubmitResultInput {
  apiBaseUrl: string;
  attemptId: string;
  userId: string;
  result: RunChallengeResult;
}

export async function requestStartAttempt(
  input: StartAttemptInput,
): Promise<StartAttemptResponse> {
  const response = await fetch(`${input.apiBaseUrl}/attempts/start`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      challengeId: input.challengeId,
      userId: input.userId,
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
    },
    body: JSON.stringify({
      attemptId: input.attemptId,
      userId: input.userId,
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
      typeof payload.error === "string"
    ) {
      throw new Error(payload.error);
    }

    throw new Error(`API request failed with status ${response.status}`);
  }

  return payload;
}
