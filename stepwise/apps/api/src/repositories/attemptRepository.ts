/**
 * Attempt Repository — pure Prisma CRUD for the `attempts` table.
 * No business logic. No type mapping. Just raw Prisma operations.
 */

import { Attempt, AttemptMode, AttemptOutcome, AttemptStatus, Prisma } from "@repo/db";
import { prisma } from "@repo/db";
import type { AttemptExecutionResult } from "../../../../packages/attempt-contracts/src";

export async function createAttempt(data: {
  id: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  stepId: string;       // DB ChallengeStep UUID
  stepKey: string;
  mode: "local" | "server" | "web";
  startedAt: Date;
}): Promise<Attempt> {
  return prisma.attempt.create({
    data: {
      id: data.id,
      userId: data.userId,
      challengeId: data.challengeId,
      challengeVersion: data.challengeVersion,
      stepId: data.stepId,
      stepKey: data.stepKey,
      mode: data.mode === "local" ? AttemptMode.LOCAL : AttemptMode.SERVER,
      status: AttemptStatus.STARTED,
      startedAt: data.startedAt,
    },
  });
}

export async function findAttemptById(id: string): Promise<Attempt | null> {
  return prisma.attempt.findUnique({ where: { id } });
}

export async function findActiveAttempt(
  userId: string,
  challengeId: string,
): Promise<Attempt | null> {
  return prisma.attempt.findFirst({
    where: { userId, challengeId, status: AttemptStatus.STARTED },
    orderBy: { startedAt: "desc" },
  });
}

export async function markAttemptSubmitted(
  attemptId: string,
  result: AttemptExecutionResult,
  outcome: "passed" | "failed",
  submittedAt: Date,
): Promise<Attempt> {
  return prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.SUBMITTED,
      outcome: outcome === "passed" ? AttemptOutcome.PASSED : AttemptOutcome.FAILED,
      submittedAt,
      resultJson: result as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function findAttemptsByUser(userId: string): Promise<Attempt[]> {
  return prisma.attempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });
}
