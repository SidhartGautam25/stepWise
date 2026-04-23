/**
 * Attempt Service — step-unlock logic, outcome calculation, attempt lifecycle.
 *
 * This is the business logic layer. It knows about challenges, steps, attempts,
 * and progress — but never about HTTP or raw Prisma types.
 */

import crypto from "crypto";
import type { Attempt, UserProgress } from "@repo/db";
import {
  StartAttemptRequest,
  StartAttemptResponse,
  SubmitResultRequest,
  SubmitResultResponse,
} from "../../../../packages/attempt-contracts/src";
import {
  getChallengeInfo,
  getNextStepId,
  getStepOrThrow,
  type ChallengeInfo,
  type StepInfo,
} from "./challengeService";
import {
  createAttempt,
  findAttemptById,
  findActiveAttempt,
  markAttemptSubmitted,
} from "../repositories/attemptRepository";
import {
  findProgress,
  upsertProgress,
  findAllProgressForUser,
} from "../repositories/progressRepository";
import { findStepByKey } from "../repositories/stepRepository";

// ─── Internal types ───────────────────────────────────────────────────────────

interface NormalizedAttempt {
  attemptId: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  stepKey: string;
  status: "started" | "submitted";
  outcome?: "passed" | "failed";
  startedAt: string;
  submittedAt?: string;
}

interface NormalizedProgress {
  userId: string;
  challengeId: string;
  currentStepKey: string;
  completedStepKeys: string[];
  challengeCompleted: boolean;
}

// ─── Mappers (private to this service) ───────────────────────────────────────

function mapAttempt(row: Attempt): NormalizedAttempt {
  return {
    attemptId: row.id,
    userId: row.userId,
    challengeId: row.challengeId,
    challengeVersion: row.challengeVersion,
    stepKey: row.stepKey,
    status: row.status === "STARTED" ? "started" : "submitted",
    outcome: row.outcome ? (row.outcome.toLowerCase() as "passed" | "failed") : undefined,
    startedAt: row.startedAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString(),
  };
}

function mapProgress(row: UserProgress): NormalizedProgress {
  return {
    userId: row.userId,
    challengeId: row.challengeId,
    currentStepKey: row.currentStepKey,
    completedStepKeys: row.completedStepKeys,
    challengeCompleted: row.challengeCompleted,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function startAttempt(
  payload: StartAttemptRequest & { userId: string },
): Promise<StartAttemptResponse> {
  const challenge = getChallengeInfo(payload.challengeId);
  const active = await findActiveAttempt(payload.userId, payload.challengeId);

  if (active) {
    throw new Error(
      `An active attempt already exists for challenge "${payload.challengeId}". ` +
      `Submit or finish attempt "${active.id}" before starting another one.`,
    );
  }

  const existingProgress = await findProgress(payload.userId, payload.challengeId);
  const fallbackStepKey = existingProgress?.challengeCompleted
    ? challenge.steps.at(-1)?.id
    : existingProgress?.currentStepKey;

  const step = getStepOrThrow(challenge, payload.stepId ?? fallbackStepKey);

  if (existingProgress && !isStepUnlocked(challenge, mapProgress(existingProgress), step.id)) {
    throw new Error(`Step "${step.id}" is not unlocked for user "${payload.userId}"`);
  }

  const startedAt = new Date();
  const attemptId = crypto.randomUUID();

  // Resolve DB step UUID from step key
  const dbStep = await findStepByKey(challenge.id, step.id);

  await createAttempt({
    id: attemptId,
    userId: payload.userId,
    challengeId: challenge.id,
    challengeVersion: challenge.version,
    stepId: dbStep.id,
    stepKey: step.id,
    mode: payload.mode,
    startedAt,
  });

  // Ensure progress row exists
  await upsertProgress({
    userId: payload.userId,
    challengeId: challenge.id,
    currentStepKey: step.id,
    completedStepKeys: existingProgress?.completedStepKeys ?? [],
    challengeCompleted: existingProgress?.challengeCompleted ?? false,
  });

  return {
    attemptId,
    userId: payload.userId,
    challengeId: challenge.id,
    challengeVersion: challenge.version,
    mode: payload.mode,
    status: "started",
    startedAt: startedAt.toISOString(),
    step: { id: step.id, title: step.title },
    nextStepId: getNextStepId(challenge, step.id),
  };
}

export async function submitResult(
  payload: SubmitResultRequest & { userId: string },
): Promise<SubmitResultResponse> {
  const row = await findAttemptById(payload.attemptId);
  if (!row) throw new Error(`Attempt "${payload.attemptId}" not found`);

  const attempt = mapAttempt(row);

  if (attempt.userId !== payload.userId) throw new Error("Attempt user mismatch");
  if (attempt.status === "submitted") throw new Error(`Attempt "${payload.attemptId}" was already submitted`);
  if (attempt.challengeId !== payload.result.challengeId) throw new Error("Challenge mismatch");
  if (attempt.challengeVersion !== payload.result.challengeVersion) throw new Error("Challenge version mismatch");
  if (attempt.stepKey !== payload.result.stepId) throw new Error("Step mismatch");

  const challenge = getChallengeInfo(attempt.challengeId);
  const outcome: "passed" | "failed" = payload.result.failed === 0 ? "passed" : "failed";
  const submittedAt = new Date();
  const nextStepId = getNextStepId(challenge, attempt.stepKey);

  const progress = await findProgress(payload.userId, attempt.challengeId);
  const currentProgress = progress
    ? mapProgress(progress)
    : buildDefaultProgress(payload.userId, attempt.challengeId, attempt.stepKey);

  const completedStepKeys = new Set(currentProgress.completedStepKeys);
  if (outcome === "passed") completedStepKeys.add(attempt.stepKey);

  const challengeCompleted = outcome === "passed" && !nextStepId;
  const newCurrentStepKey = outcome === "passed" && nextStepId ? nextStepId : currentProgress.currentStepKey;

  await markAttemptSubmitted(payload.attemptId, payload.result, outcome, submittedAt);
  await upsertProgress({
    userId: payload.userId,
    challengeId: attempt.challengeId,
    currentStepKey: newCurrentStepKey,
    completedStepKeys: Array.from(completedStepKeys),
    challengeCompleted,
  });

  return {
    attemptId: payload.attemptId,
    userId: payload.userId,
    challengeId: attempt.challengeId,
    challengeVersion: attempt.challengeVersion,
    stepId: attempt.stepKey,
    outcome,
    submittedAt: submittedAt.toISOString(),
    nextStepId: outcome === "passed" ? nextStepId : undefined,
    challengeCompleted,
  };
}

// ─── User dashboard aggregation ───────────────────────────────────────────────

export interface UserDashboardData {
  userId: string;
  progress: Array<{
    challengeId: string;
    challengeTitle: string;
    currentStepKey: string;
    completedCount: number;
    totalSteps: number;
    challengeCompleted: boolean;
    completedStepKeys: string[];
  }>;
}

export async function getUserDashboard(userId: string): Promise<UserDashboardData> {
  const allProgress = await findAllProgressForUser(userId);

  const progress = allProgress.map((p: UserProgress & { challenge?: unknown }) => {
    let totalSteps = 0;
    let challengeTitle = p.challengeId;
    try {
      const info = getChallengeInfo(p.challengeId);
      totalSteps = info.steps.length;
      challengeTitle = info.title;
    } catch { /* challenge might have been removed */ }

    return {
      challengeId: p.challengeId,
      challengeTitle,
      currentStepKey: p.currentStepKey,
      completedCount: p.completedStepKeys.length,
      totalSteps,
      challengeCompleted: p.challengeCompleted,
      completedStepKeys: p.completedStepKeys,
    };
  });

  return { userId, progress };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function isStepUnlocked(challenge: ChallengeInfo, progress: NormalizedProgress, stepKey: string): boolean {
  if (progress.challengeCompleted) return true;
  if (challenge.steps[0]?.id === stepKey) return true;
  return progress.currentStepKey === stepKey || progress.completedStepKeys.includes(stepKey);
}

function buildDefaultProgress(userId: string, challengeId: string, stepKey: string): NormalizedProgress {
  return { userId, challengeId, currentStepKey: stepKey, completedStepKeys: [], challengeCompleted: false };
}
