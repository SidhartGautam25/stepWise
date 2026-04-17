import fs from "fs";
import path from "path";
import {
  AttemptExecutionResult,
  AttemptOutcome,
  AttemptStatus,
} from "../../../packages/attempt-contracts/src";

export interface StoredAttempt {
  attemptId: string;
  userId: string;
  challengeId: string;
  challengeVersion: string;
  stepId: string;
  mode: "local";
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  outcome?: AttemptOutcome;
  result?: AttemptExecutionResult;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  currentStepId: string;
  completedStepIds: string[];
  challengeCompleted: boolean;
  updatedAt: string;
}

interface AttemptStoreShape {
  attempts: StoredAttempt[];
  progress: ChallengeProgress[];
}

const dataDir = path.resolve(__dirname, "../data");
const storePath = path.resolve(dataDir, "attempts.json");

function ensureStore(): AttemptStoreShape {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(
      storePath,
      JSON.stringify({ attempts: [], progress: [] }, null, 2),
      "utf-8",
    );
  }

  return JSON.parse(fs.readFileSync(storePath, "utf-8")) as AttemptStoreShape;
}

function saveStore(store: AttemptStoreShape) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
}

export function createAttempt(
  attempt: StoredAttempt,
  progress: ChallengeProgress,
): StoredAttempt {
  const store = ensureStore();
  store.attempts.push(attempt);

  const progressIndex = store.progress.findIndex(
    (entry) =>
      entry.userId === progress.userId && entry.challengeId === progress.challengeId,
  );

  if (progressIndex === -1) {
    store.progress.push(progress);
  } else {
    store.progress[progressIndex] = progress;
  }

  saveStore(store);
  return attempt;
}

export function getAttempt(attemptId: string): StoredAttempt | undefined {
  const store = ensureStore();
  return store.attempts.find((attempt) => attempt.attemptId === attemptId);
}

export function getActiveAttempt(
  userId: string,
  challengeId: string,
): StoredAttempt | undefined {
  const store = ensureStore();

  return store.attempts.find(
    (attempt) =>
      attempt.userId === userId &&
      attempt.challengeId === challengeId &&
      attempt.status === "started",
  );
}

export function getProgress(
  userId: string,
  challengeId: string,
): ChallengeProgress | undefined {
  const store = ensureStore();
  return store.progress.find(
    (entry) => entry.userId === userId && entry.challengeId === challengeId,
  );
}

export function updateAttempt(
  attemptId: string,
  updater: (attempt: StoredAttempt) => StoredAttempt,
): StoredAttempt {
  const store = ensureStore();
  const attemptIndex = store.attempts.findIndex(
    (attempt) => attempt.attemptId === attemptId,
  );

  if (attemptIndex === -1) {
    throw new Error(`Attempt "${attemptId}" not found`);
  }

  const existingAttempt = store.attempts[attemptIndex];

  if (!existingAttempt) {
    throw new Error(`Attempt "${attemptId}" not found`);
  }

  const updatedAttempt = updater(existingAttempt);
  store.attempts[attemptIndex] = updatedAttempt;
  saveStore(store);

  return updatedAttempt;
}

export function updateProgress(progress: ChallengeProgress): ChallengeProgress {
  const store = ensureStore();
  const progressIndex = store.progress.findIndex(
    (entry) =>
      entry.userId === progress.userId && entry.challengeId === progress.challengeId,
  );

  if (progressIndex === -1) {
    store.progress.push(progress);
  } else {
    store.progress[progressIndex] = progress;
  }

  saveStore(store);
  return progress;
}
