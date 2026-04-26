/**
 * Typed API client for the web dashboard.
 * All API calls go through these functions — no raw fetch() in components.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export interface ChallengeSummary {
  id: string;
  title: string;
  version: string;
  language: string;
  runtime: string;
  stepCount: number;
}

export interface CodeFile {
  filename: string;
  language: string;
  diffContent: string;
  finalCode: string;
}

export interface InteractiveLessonSlide {
  id: string;
  heading: string;
  body: string;
  bullets?: string[];
}

export interface InteractiveLesson {
  type: "sequence";
  slides: InteractiveLessonSlide[];
}

export interface StepInfo {
  id: string;
  title: string;
  prompt?: string;
  explanation?: string;
  solution?: string;
  hasStarter: boolean;
  position: number;
  codeFiles?: CodeFile[];
  interactiveLesson?: InteractiveLesson;
}

export interface ChallengeDetail {
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  description?: string;
  systemRequirements?: {
    os?: string;
    cpu?: string;
    ram?: string;
    storage?: string;
    network?: string;
    [key: string]: string | undefined;
  };
  steps: StepInfo[];
  challengePath: string;
}

export interface DashboardProgress {
  challengeId: string;
  challengeTitle: string;
  currentStepKey: string;
  completedCount: number;
  totalSteps: number;
  challengeCompleted: boolean;
  completedStepKeys: string[];
}

export interface DashboardData {
  userId: string;
  progress: DashboardProgress[];
}

export interface AuthUser {
  userId: string;
  email: string;
  username: string | null;
  createdAt: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options?.headers,
    },
  });

  const data = await res.json() as unknown;

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as Record<string, unknown>).error === "string"
        ? (data as Record<string, unknown>).error as string
        : `API error ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function fetchChallenges(): Promise<ChallengeSummary[]> {
  const data = await apiFetch<{ challenges: ChallengeSummary[] }>("/challenges");
  return data.challenges;
}

export async function fetchChallenge(id: string): Promise<ChallengeDetail> {
  return apiFetch<ChallengeDetail>(`/challenges/${id}`);
}

export async function registerUser(email: string, passwordHash: string, username?: string): Promise<{ userId: string; email: string; username: string | null }> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password: passwordHash, username }),
  });
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me", {
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  return apiFetch<DashboardData>("/dashboard", {
    headers: { authorization: `Bearer ${token}` },
  });
}
