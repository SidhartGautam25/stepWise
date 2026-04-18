/**
 * Progress Repository — user_progress table CRUD.
 */

import { UserProgress } from "@repo/db";
import { prisma } from "@repo/db";

export async function findProgress(
  userId: string,
  challengeId: string,
): Promise<UserProgress | null> {
  return prisma.userProgress.findUnique({
    where: { userId_challengeId: { userId, challengeId } },
  });
}

export async function upsertProgress(data: {
  userId: string;
  challengeId: string;
  currentStepKey: string;
  completedStepKeys: string[];
  challengeCompleted: boolean;
}): Promise<UserProgress> {
  return prisma.userProgress.upsert({
    where: { userId_challengeId: { userId: data.userId, challengeId: data.challengeId } },
    create: data,
    update: {
      currentStepKey: data.currentStepKey,
      completedStepKeys: data.completedStepKeys,
      challengeCompleted: data.challengeCompleted,
    },
  });
}

export async function findAllProgressForUser(userId: string): Promise<UserProgress[]> {
  return prisma.userProgress.findMany({
    where: { userId },
    include: { challenge: true },
  });
}
