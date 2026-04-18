/**
 * Typed repository layer for Attempt and UserProgress operations.
 *
 * This module is the single place the API reaches for persistence.
 * It mirrors the function signatures of the old attemptStore.ts so
 * replacing it is a drop-in swap in attemptService.ts.
 *
 * Types re-exported from here keep the import surface clean:
 *   import { createAttempt, StoredAttempt } from "@repo/db/store"
 */

import {
  Attempt,
  AttemptMode,
  AttemptOutcome,
  AttemptStatus,
  UserProgress,
  Prisma,
} from "@prisma/client";
import { prisma } from "./client";
import type { AttemptExecutionResult } from "@repo/attempt-contracts";

// ─── Re-export DB types with the names the API uses ──────────────────────────

export type StoredAttempt = Attempt;
export type ChallengeProgress = UserProgress;

// ─── Attempt operations ───────────────────────────────────────────────────────

export interface CreateAttemptInput {
  attemptId: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  stepId: string;
  stepKey: string;
  mode: "local" | "server";
  status: "started";
  startedAt: string;
}

export async function createAttempt(input: CreateAttemptInput): Promise<Attempt> {
  return prisma.attempt.create({
    data: {
      id: input.attemptId,
      userId: input.userId,
      challengeId: input.challengeId,
      challengeVersion: input.challengeVersion,
      stepId: input.stepId,
      stepKey: input.stepKey,
      mode: input.mode === "local" ? AttemptMode.LOCAL : AttemptMode.SERVER,
      status: AttemptStatus.STARTED,
      startedAt: new Date(input.startedAt),
    },
  });
}

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  return prisma.attempt.findUnique({ where: { id: attemptId } });
}

export async function getActiveAttempt(
  userId: string,
  challengeId: string,
): Promise<Attempt | null> {
  return prisma.attempt.findFirst({
    where: {
      userId,
      challengeId,
      status: AttemptStatus.STARTED,
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function submitAttempt(
  attemptId: string,
  result: AttemptExecutionResult,
  outcome: "passed" | "failed",
  submittedAt: string,
): Promise<Attempt> {
  return prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.SUBMITTED,
      outcome: outcome === "passed" ? AttemptOutcome.PASSED : AttemptOutcome.FAILED,
      submittedAt: new Date(submittedAt),
      resultJson: result as unknown as Prisma.InputJsonValue,
    },
  });
}

// ─── UserProgress operations ──────────────────────────────────────────────────

export async function getProgress(
  userId: string,
  challengeId: string,
): Promise<UserProgress | null> {
  return prisma.userProgress.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
  });
}

export interface UpsertProgressInput {
  userId: string;
  challengeId: string;
  currentStepKey: string;
  completedStepKeys: string[];
  challengeCompleted: boolean;
}

export async function upsertProgress(input: UpsertProgressInput): Promise<UserProgress> {
  return prisma.userProgress.upsert({
    where: {
      userId_challengeId: {
        userId: input.userId,
        challengeId: input.challengeId,
      },
    },
    create: {
      userId: input.userId,
      challengeId: input.challengeId,
      currentStepKey: input.currentStepKey,
      completedStepKeys: input.completedStepKeys,
      challengeCompleted: input.challengeCompleted,
    },
    update: {
      currentStepKey: input.currentStepKey,
      completedStepKeys: input.completedStepKeys,
      challengeCompleted: input.challengeCompleted,
    },
  });
}

// ─── ChallengeStep lookup ─────────────────────────────────────────────────────

/**
 * Finds a ChallengeStep row by its challenge + stepKey combination.
 * Used to resolve the DB step.id (UUID) from the manifest step key string.
 */
export async function getStepByKey(
  challengeId: string,
  stepKey: string,
) {
  const step = await prisma.challengeStep.findUnique({
    where: {
      challengeId_stepKey: { challengeId, stepKey },
    },
  });

  if (!step) {
    throw new Error(`Step "${stepKey}" not found for challenge "${challengeId}" in database. Run db:seed to sync challenge manifests.`);
  }

  return step;
}
