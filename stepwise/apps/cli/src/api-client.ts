import http from "node:http";
import https from "node:https";

export const DEFAULT_API_BASE_URL = "https://api.stepwise.run";
export const LOCAL_API_BASE_URL = "http://127.0.0.1:4000";

interface JsonRequestOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
}

interface JsonResponse {
  ok: boolean;
  status: number;
  payload: unknown;
}

export class ApiConnectionError extends Error {
  constructor(
    public readonly apiBaseUrl: string,
    public readonly causeMessage: string,
  ) {
    super(
      `Cannot reach the StepWise API at ${apiBaseUrl}. ${causeMessage}\n\n` +
      `For local development, run:\n` +
      `  PowerShell: $env:STEPWISE_API_URL="${LOCAL_API_BASE_URL}"\n` +
      `  macOS/Linux: export STEPWISE_API_URL=${LOCAL_API_BASE_URL}`,
    );
    this.name = "ApiConnectionError";
  }
}

export async function getJson(
  apiBaseUrl: string,
  path: string,
  headers?: Record<string, string>,
): Promise<JsonResponse> {
  return requestJson(apiBaseUrl, path, { method: "GET", headers });
}

export async function postJson(
  apiBaseUrl: string,
  path: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<JsonResponse> {
  return requestJson(apiBaseUrl, path, { method: "POST", body, headers });
}

async function requestJson(
  apiBaseUrl: string,
  path: string,
  options: JsonRequestOptions,
): Promise<JsonResponse> {
  const url = new URL(path, normalizeBaseUrl(apiBaseUrl));
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method: options.method ?? "GET",
        headers: {
          accept: "application/json",
          ...(body ? { "content-type": "application/json", "content-length": Buffer.byteLength(body).toString() } : {}),
          ...(options.headers ?? {}),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let payload: unknown = raw;

          if (raw.length > 0) {
            try {
              payload = JSON.parse(raw);
            } catch {
              payload = raw;
            }
          }

          resolve({
            ok: response.statusCode !== undefined && response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode ?? 0,
            payload,
          });
        });
      },
    );

    request.setTimeout(15000, () => {
      request.destroy(new Error("Request timed out."));
    });

    request.on("error", (err: NodeJS.ErrnoException) => {
      reject(new ApiConnectionError(apiBaseUrl, err.message));
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

export function apiBaseUrlFromArgs(parsedApi?: string): string {
  return parsedApi ?? process.env.STEPWISE_API_URL ?? DEFAULT_API_BASE_URL;
}

export function apiErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as Record<string, unknown>).error === "string"
  ) {
    return (payload as Record<string, unknown>).error as string;
  }

  return `API request failed with status ${status}`;
}

function normalizeBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
}
