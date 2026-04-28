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
  getCurrentChallengeVersion,
} from "./store";

export {
  buildChallengeRegistry,
  CHALLENGE_REGISTRY_SCHEMA_VERSION,
} from "./challengeRegistry";

export {
  CHALLENGES_ROOT,
  syncAllChallenges,
  syncChallengeDirectory,
} from "./challengeSync";

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
  ChallengeVersion,
  ChallengeStep,
  User,
} from "@prisma/client";

export type {
  ChallengeRegistry,
  ChallengeStepRegistryEntry,
} from "./challengeRegistry";

export type { SyncChallengeResult } from "./challengeSync";

// Store-specific input/output types
export type {
  StoredAttempt,
  ChallengeProgress,
  CreateAttemptInput,
  UpsertProgressInput,
} from "./store";
