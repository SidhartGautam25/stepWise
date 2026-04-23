import {
  ChallengeInfoResponse,
  parseChallengeInfoResponse,
} from "@repo/types";
import { apiErrorMessage, getJson, LOCAL_API_BASE_URL } from "../api-client";

const DEFAULT_API_BASE_URL = LOCAL_API_BASE_URL;

/**
 * Fetches full challenge info (steps, prompts, starter availability, challengePath)
 * from the API server.
 */
export async function fetchChallengeInfo(
  challengeId: string,
  apiBaseUrl = DEFAULT_API_BASE_URL,
): Promise<ChallengeInfoResponse> {
  let response: Awaited<ReturnType<typeof getJson>>;

  try {
    response = await getJson(apiBaseUrl, `/challenges/${challengeId}`);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : `Cannot reach the StepWise API at ${apiBaseUrl}.`,
    );
  }

  const payload = response.payload;

  if (!response.ok) {
    throw new Error(apiErrorMessage(payload, response.status));
  }

  return parseChallengeInfoResponse(payload);
}
