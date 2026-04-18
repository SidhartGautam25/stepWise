"use client";

/**
 * Client-side auth utilities.
 * JWT stored in localStorage (simple for MVP, can be moved to httpOnly cookie).
 */

export const AUTH_KEY = "sw_token";
export const USER_KEY = "sw_user";

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  username: string | null;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (!raw || !user) return null;
    return JSON.parse(user) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(token: string, userId: string, email: string, username: string | null) {
  const session: AuthSession = { token, userId, email, username };
  localStorage.setItem(AUTH_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_KEY);
}
