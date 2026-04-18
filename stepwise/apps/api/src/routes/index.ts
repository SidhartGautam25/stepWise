/**
 * Routes — wires all controllers to Fastify routes.
 * This is the only file that knows about URL paths and HTTP methods.
 */

import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/authMiddleware";
import * as authController from "../controllers/authController";
import * as attemptController from "../controllers/attemptController";
import * as challengeController from "../controllers/challengeController";

export function registerRoutes(app: FastifyInstance): void {
  // ── Health ───────────────────────────────────────────────────────────────────
  app.get("/health", () => ({ status: "ok", ts: new Date().toISOString() }));

  // ── Auth (public) ────────────────────────────────────────────────────────────
  app.post("/auth/register",        authController.register);
  app.post("/auth/login/request",   authController.requestOtp);
  app.post("/auth/login/verify",    authController.verifyOtp);
  app.post("/auth/login/dev",       authController.devLogin);
  app.get("/auth/me",               { preValidation: requireAuth }, authController.getMe);

  // ── Challenges (public) ──────────────────────────────────────────────────────
  app.get("/challenges",            challengeController.listAllChallenges);
  app.get("/challenges/:id",        challengeController.getChallengeById);

  // ── Attempts (authenticated) ─────────────────────────────────────────────────
  app.post("/attempts/start",       { preValidation: requireAuth }, attemptController.startAttempt);
  app.post("/attempts/submit-result", { preValidation: requireAuth }, attemptController.submitResult);

  // ── Dashboard (authenticated) ────────────────────────────────────────────────
  app.get("/dashboard",             { preValidation: requireAuth }, attemptController.getDashboard);
}
