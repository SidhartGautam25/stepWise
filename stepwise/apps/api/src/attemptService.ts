import crypto from "crypto";
import {
  StartAttemptRequest,
  StartAttemptResponse,
  SubmitResultRequest,
  SubmitResultResponse,
} from "../../../packages/attempt-contracts/src";
import {
  getChallengeInfo,
  getNextStepId,
  getStepOrThrow,
} from "./challengeCatalog";
import {
  ChallengeProgress,
  createAttempt,
  getActiveAttempt,
  getAttempt,
  getProgress,
  updateAttempt,
  updateProgress,
} from "./attemptStore";

export function startAttempt(
  payload: StartAttemptRequest,
): StartAttemptResponse {
  const challenge = getChallengeInfo(payload.challengeId);
  const activeAttempt = getActiveAttempt(payload.userId, payload.challengeId);

  if (activeAttempt) {
    throw new Error(
      `An active attempt already exists for challenge "${payload.challengeId}". Submit or finish attempt "${activeAttempt.attemptId}" before starting another one.`,
    );
  }

  const existingProgress = getProgress(payload.userId, payload.challengeId);
  const fallbackStepId =
    existingProgress?.challengeCompleted === true
      ? challenge.steps[challenge.steps.length - 1]?.id
      : existingProgress?.currentStepId;
  const step = getStepOrThrow(challenge, payload.stepId ?? fallbackStepId);

  if (existingProgress && !isStepUnlocked(existingProgress, step.id)) {
    throw new Error(
      `Step "${step.id}" is not unlocked for user "${payload.userId}"`,
    );
  }

  const startedAt = new Date().toISOString();
  const attemptId = crypto.randomUUID();
  const progress = ensureProgress(
    existingProgress,
    payload.userId,
    challenge.id,
    step.id,
    startedAt,
  );

  createAttempt(
    {
      attemptId,
      userId: payload.userId,
      challengeId: challenge.id,
      challengeVersion: challenge.version,
      stepId: step.id,
      mode: payload.mode,
      status: "started",
      startedAt,
    },
    progress,
  );

  return {
    attemptId,
    userId: payload.userId,
    challengeId: challenge.id,
    challengeVersion: challenge.version,
    mode: payload.mode,
    status: "started",
    startedAt,
    step,
    nextStepId: getNextStepId(challenge, step.id),
  };
}

export function submitResult(
  payload: SubmitResultRequest,
): SubmitResultResponse {
  const attempt = getAttempt(payload.attemptId);

  if (!attempt) {
    throw new Error(`Attempt "${payload.attemptId}" not found`);
  }

  if (attempt.userId !== payload.userId) {
    throw new Error("Attempt user mismatch");
  }

  if (attempt.status === "submitted") {
    throw new Error(`Attempt "${payload.attemptId}" was already submitted`);
  }

  if (attempt.challengeId !== payload.result.challengeId) {
    throw new Error("Challenge mismatch");
  }

  if (attempt.challengeVersion !== payload.result.challengeVersion) {
    throw new Error("Challenge version mismatch");
  }

  if (attempt.stepId !== payload.result.stepId) {
    throw new Error("Step mismatch");
  }

  const challenge = getChallengeInfo(attempt.challengeId);
  const progress = ensureProgress(
    getProgress(payload.userId, attempt.challengeId),
    payload.userId,
    attempt.challengeId,
    attempt.stepId,
    attempt.startedAt,
  );
  const outcome = payload.result.failed === 0 ? "passed" : "failed";
  const submittedAt = new Date().toISOString();
  const nextStepId = getNextStepId(challenge, attempt.stepId);
  const updatedCompletedSteps = new Set(progress.completedStepIds);

  if (outcome === "passed") {
    updatedCompletedSteps.add(attempt.stepId);
  }

  const challengeCompleted = outcome === "passed" && !nextStepId;
  const currentStepId =
    outcome === "passed" && nextStepId ? nextStepId : progress.currentStepId;

  updateAttempt(payload.attemptId, (currentAttempt) => ({
    ...currentAttempt,
    status: "submitted",
    submittedAt,
    outcome,
    result: payload.result,
  }));

  updateProgress({
    ...progress,
    currentStepId,
    completedStepIds: Array.from(updatedCompletedSteps),
    challengeCompleted,
    updatedAt: submittedAt,
  });

  return {
    attemptId: payload.attemptId,
    userId: payload.userId,
    challengeId: attempt.challengeId,
    challengeVersion: attempt.challengeVersion,
    stepId: attempt.stepId,
    outcome,
    submittedAt,
    nextStepId: outcome === "passed" ? nextStepId : undefined,
    challengeCompleted,
  };
}

function ensureProgress(
  progress: ChallengeProgress | undefined,
  userId: string,
  challengeId: string,
  firstStepId: string,
  updatedAt: string,
): ChallengeProgress {
  if (progress) {
    return progress;
  }

  return {
    userId,
    challengeId,
    currentStepId: firstStepId,
    completedStepIds: [],
    challengeCompleted: false,
    updatedAt,
  };
}

function isStepUnlocked(progress: ChallengeProgress, stepId: string): boolean {
  return (
    progress.currentStepId === stepId ||
    progress.completedStepIds.includes(stepId)
  );
}
