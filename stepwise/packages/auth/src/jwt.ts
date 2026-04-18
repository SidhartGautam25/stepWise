/**
 * JWT utilities for StepWise.
 *
 * Uses `jose` — pure JS, works in Node, Deno, Cloudflare Workers, and browsers.
 * This is the same library NextAuth v5 uses internally, so when we add web
 * auth the token format is already compatible.
 *
 * Algorithm: HS256 (HMAC-SHA256), symmetric key from `JWT_SECRET` env var.
 * For asymmetric (RS256 / public-key) you'd swap `new TextEncoder()` for
 * crypto.subtle.importKey() — no other changes needed.
 */

import { SignJWT, jwtVerify, decodeJwt, type JWTPayload } from "jose";
import type { AuthPayload, AuthContext } from "./types";

const DEFAULT_EXPIRY = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET env var is missing or too short (min 32 chars). " +
      "Add it to your .env file: JWT_SECRET=\"$(openssl rand -hex 32)\"",
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT containing the given auth payload.
 * Expiry defaults to 7 days. Pass `expiry` to override (e.g. `"1h"`, `"30d"`).
 */
export async function signToken(
  payload: AuthPayload,
  expiry: string = DEFAULT_EXPIRY,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setSubject(payload.sub)
    .sign(getSecret());
}

/**
 * Verifies a JWT and returns the decoded AuthContext.
 * Throws if the token is expired, tampered, or missing required fields.
 */
export async function verifyToken(token: string): Promise<AuthContext> {
  const { payload } = await jwtVerify(token, getSecret());

  assertString(payload.sub, "sub");
  assertString(payload.email, "email");

  const exp = payload.exp;

  if (typeof exp !== "number") {
    throw new Error("Token has no expiry");
  }

  return {
    sub: payload.sub!,
    email: payload.email as string,
    username: typeof payload.username === "string" ? payload.username : undefined,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

/**
 * Decodes a JWT WITHOUT verifying the signature.
 * Use only for reading token metadata (e.g. determining expiry before sending a request).
 * Never use for authorization decisions — always use verifyToken() for that.
 */
export function decodeToken(token: string): JWTPayload {
  return decodeJwt(token);
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Token is missing required field: "${field}"`);
  }
}
