import {
  ChallengeInfoResponse,
  parseChallengeInfoResponse,
} from "@repo/types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:4000";

/**
 * Fetches full challenge info (steps, prompts, starter availability, challengePath)
 * from the API server.
 */
export async function fetchChallengeInfo(
  challengeId: string,
  apiBaseUrl = DEFAULT_API_BASE_URL,
): Promise<ChallengeInfoResponse> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/challenges/${challengeId}`);
  } catch {
    throw new Error(
      `Cannot reach the StepWise API at ${apiBaseUrl}. Is the API server running? (npm run dev inside apps/api)`,
    );
  }

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const msg =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as Record<string, unknown>).error === "string"
        ? (payload as Record<string, unknown>).error
        : `API returned ${response.status}`;
    throw new Error(msg as string);
  }

  return parseChallengeInfoResponse(payload);
}
