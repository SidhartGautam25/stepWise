/**
 * Auth Controller — HTTP layer for auth endpoints.
 * Parses request body, calls authService, returns response. No business logic here.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import * as authService from "../services/authService";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { email, password, username } = request.body as { email?: unknown; password?: unknown; username?: unknown };

  if (typeof email !== "string" || !email.includes("@")) {
    return reply.status(400).send({ error: "A valid email is required" });
  }

  if (typeof password !== "string" || password.length < 6) {
    return reply.status(400).send({ error: "Password must be at least 6 characters" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authService.registerUser(
      email,
      passwordHash,
      typeof username === "string" && username.length > 0 ? username : undefined,
    );
    return reply.status(201).send({ userId: user.id, email: user.email, username: user.username });
  } catch (err) {
    return reply.status(409).send({ error: err instanceof Error ? err.message : "Registration failed" });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string") {
    return reply.status(400).send({ error: "Email and password are required" });
  }

  try {
    const result = await authService.loginWithPassword(email, password);
    return result;
  } catch (err) {
    return reply.status(401).send({ error: err instanceof Error ? err.message : "Authentication failed" });
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
