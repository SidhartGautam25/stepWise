/**
 * Step Repository — challenge_steps table lookups.
 */

import { ChallengeStep } from "@repo/db";
import { prisma } from "@repo/db";

export async function findStepByKey(
  challengeId: string,
  stepKey: string,
): Promise<ChallengeStep> {
  const step = await prisma.challengeStep.findUnique({
    where: { challengeId_stepKey: { challengeId, stepKey } },
  });

  if (!step) {
    throw new Error(
      `Step "${stepKey}" not found for challenge "${challengeId}". Run db:seed to sync.`,
    );
  }

  return step;
}
