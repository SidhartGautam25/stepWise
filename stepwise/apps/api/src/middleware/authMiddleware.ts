/**
 * Auth Middleware — Fastify preValidation hooks.
 *
 * requireAuth: rejects 401 if no valid JWT.
 * optionalAuth: populates request.user when valid JWT is present, never rejects.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken, type AuthContext } from "@repo/auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthContext;
    userId?: string;
  }
}

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = extractBearerToken(request);

  if (!token) {
    await reply.status(401).send({
      error: "Authentication required. Run `stepwise login` to get a token.",
    });
    return;
  }

  try {
    const user = await verifyToken(token);
    request.user = user;
    request.userId = user.sub;
  } catch {
    await reply.status(401).send({
      error: "Invalid or expired token. Run `stepwise login` to refresh.",
    });
  }
}

export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const token = extractBearerToken(request);
  if (!token) return;

  try {
    const user = await verifyToken(token);
    request.user = user;
    request.userId = user.sub;
  } catch { /* treat as unauthenticated */ }
}
