/**
 * Auth Controller — HTTP layer for auth endpoints.
 * Parses request body, calls authService, returns response. No business logic here.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import * as authService from "../services/authService";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { email, username } = request.body as { email?: unknown; username?: unknown };

  if (typeof email !== "string" || !email.includes("@")) {
    return reply.status(400).send({ error: "A valid email is required" });
  }

  try {
    const user = await authService.registerUser(
      email,
      typeof username === "string" && username.length > 0 ? username : undefined,
    );
    return reply.status(201).send({ userId: user.id, email: user.email, username: user.username });
  } catch (err) {
    return reply.status(409).send({ error: err instanceof Error ? err.message : "Registration failed" });
  }
}

export async function requestOtp(request: FastifyRequest, reply: FastifyReply) {
  const { email } = request.body as { email?: unknown };

  if (typeof email !== "string" || !email.includes("@")) {
    return reply.status(400).send({ error: "A valid email is required" });
  }

  try {
    const result = await authService.requestLoginOtp(email);
    return { message: result.message, ...(result.devCode ? { devCode: result.devCode } : {}) };
  } catch (err) {
    return reply.status(500).send({ error: err instanceof Error ? err.message : "Failed to send OTP" });
  }
}

export async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
  const { email, code } = request.body as { email?: unknown; code?: unknown };

  if (typeof email !== "string" || typeof code !== "string") {
    return reply.status(400).send({ error: "email and code are required" });
  }

  try {
    const result = await authService.verifyLoginOtp(email, code);
    return result;
  } catch (err) {
    return reply.status(401).send({ error: err instanceof Error ? err.message : "Authentication failed" });
  }
}

export async function devLogin(request: FastifyRequest, reply: FastifyReply) {
  if (process.env.NODE_ENV === "production") {
    return reply.status(404).send({ error: "Not found" });
  }

  const { email } = request.body as { email?: unknown };

  if (typeof email !== "string" || !email.includes("@")) {
    return reply.status(400).send({ error: "A valid email is required" });
  }

  try {
    const result = await authService.devLogin(email);
    return result;
  } catch (err) {
    return reply.status(500).send({ error: err instanceof Error ? err.message : "Dev login failed" });
  }
}

export async function getMe(request: FastifyRequest, _reply: FastifyReply) {
  const user = await authService.getUserById(request.user!.sub);
  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
  };
}
