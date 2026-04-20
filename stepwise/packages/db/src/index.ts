// Public surface area of @repo/db
export { prisma } from "./client";

// Repository functions
export {
  createAttempt,
  getAttempt,
  getActiveAttempt,
  submitAttempt,
  getProgress,
  upsertProgress,
  getStepByKey,
} from "./store";

// Re-export Prisma generated types + enums (as values) so consumers
// don't need to import from @prisma/client directly.
// Enums MUST use regular export (not 'export type') to work as values.
export {
  Prisma,
  AttemptMode,
  AttemptStatus,
  AttemptOutcome,
} from "@prisma/client";

export type {
  Attempt,
  UserProgress,
  Challenge,
  ChallengeStep,
  User,
} from "@prisma/client";

// Store-specific input/output types
export type {
  StoredAttempt,
  ChallengeProgress,
  CreateAttemptInput,
  UpsertProgressInput,
} from "./store";
