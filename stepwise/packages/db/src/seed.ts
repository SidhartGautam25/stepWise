/**
 * Seed script: reads all challenge.json manifests from the challenges/ directory
 * and upserts current catalog rows plus versioned ChallengeRegistry snapshots.
 *
 * Safe to run multiple times. Published snapshots are not overwritten.
 * Run with: pnpm --filter @repo/db db:seed
 */

import { prisma } from "./client";
import { CHALLENGES_ROOT, syncChallengeDirectory } from "./challengeSync";
import fs from "fs";
import path from "path";

async function seed() {
  if (!fs.existsSync(CHALLENGES_ROOT)) {
    console.log(`No challenges directory found at ${CHALLENGES_ROOT}`);
    return;
  }

  const entries = fs
    .readdirSync(CHALLENGES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  let synced = 0;
  let failed = 0;

  for (const entry of entries) {
    const challengeDir = path.resolve(CHALLENGES_ROOT, entry.name);

    try {
      const result = await syncChallengeDirectory(challengeDir);
      const publishedNote = result.skippedPublishedSnapshot
        ? " (published snapshot preserved)"
        : "";

      console.log(
        `  ✓ ${result.id} v${result.version} — ${result.stepCount} step(s)${publishedNote}`,
      );
      synced++;
    } catch (err) {
      failed++;
      console.warn(
        `  ⚠ Skipping ${entry.name}: ${
          err instanceof Error ? err.message : "invalid challenge.json"
        }`,
      );
    }
  }

  console.log(`\nSeeded ${synced} challenge(s).`);

  if (failed > 0) {
    throw new Error(`Failed to seed ${failed} challenge(s).`);
  }
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
