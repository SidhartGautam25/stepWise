/**
 * Seed script: reads all challenge.json manifests from the challenges/ directory
 * and upserts them into the database (Challenge + ChallengeStep rows).
 *
 * Safe to run multiple times (idempotent via upsert).
 * Run with: pnpm --filter @repo/db db:seed
 */

import fs from "fs";
import path from "path";
import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import { buildChallengeRegistry } from "./challengeRegistry";

const CHALLENGES_ROOT = path.resolve(__dirname, "../../../challenges");

async function seed() {
  if (!fs.existsSync(CHALLENGES_ROOT)) {
    console.log(`No challenges directory found at ${CHALLENGES_ROOT}`);
    return;
  }

  const entries = fs
    .readdirSync(CHALLENGES_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  let synced = 0;

  for (const entry of entries) {
    const challengeDir = path.resolve(CHALLENGES_ROOT, entry.name);
    let registry;

    try {
      registry = buildChallengeRegistry(challengeDir);
    } catch (err) {
      console.warn(
        `  ⚠ Skipping ${entry.name}: ${err instanceof Error ? err.message : "invalid challenge.json"}`,
      );
      continue;
    }

    // Upsert Challenge
    await prisma.challenge.upsert({
      where: { id: registry.id },
      create: {
        id: registry.id,
        version: registry.version,
        title: registry.title,
        language: registry.language,
        runtime: registry.runtime,
        challengeType: registry.type,
        description: registry.description,
        difficulty: registry.difficulty,
        tags: JSON.stringify(registry.tags),
        systemRequirements: registry.systemRequirements ? (registry.systemRequirements as Prisma.InputJsonObject) : undefined,
      },
      update: {
        version: registry.version,
        title: registry.title,
        language: registry.language,
        runtime: registry.runtime,
        challengeType: registry.type,
        description: registry.description,
        difficulty: registry.difficulty,
        tags: JSON.stringify(registry.tags),
        systemRequirements: registry.systemRequirements ? (registry.systemRequirements as Prisma.InputJsonObject) : undefined,
      },
    });

    const existingVersion = await prisma.challengeVersion.findUnique({
      where: {
        challengeId_version: {
          challengeId: registry.id,
          version: registry.version,
        },
      },
    });

    if (!existingVersion?.isPublished) {
      const sourcePath = path.relative(CHALLENGES_ROOT, registry.sourcePath);
      const stepRegistrySnapshot = JSON.parse(
        JSON.stringify({
          ...registry,
          sourcePath,
          manifestPath: path.join(sourcePath, "challenge.json"),
        }),
      ) as Prisma.InputJsonObject;

      await prisma.challengeVersion.upsert({
        where: {
          challengeId_version: {
            challengeId: registry.id,
            version: registry.version,
          },
        },
        create: {
          challengeId: registry.id,
          version: registry.version,
          title: registry.title,
          language: registry.language,
          runtime: registry.runtime,
          challengeType: registry.type,
          description: registry.description,
          difficulty: registry.difficulty,
          tags: JSON.stringify(registry.tags),
          capabilities: JSON.stringify(registry.capabilities),
          systemRequirements: registry.systemRequirements ? (registry.systemRequirements as Prisma.InputJsonObject) : undefined,
          stepRegistry: stepRegistrySnapshot,
          sourcePath,
          manifestHash: registry.manifestHash,
        },
        update: {
          title: registry.title,
          language: registry.language,
          runtime: registry.runtime,
          challengeType: registry.type,
          description: registry.description,
          difficulty: registry.difficulty,
          tags: JSON.stringify(registry.tags),
          capabilities: JSON.stringify(registry.capabilities),
          systemRequirements: registry.systemRequirements ? (registry.systemRequirements as Prisma.InputJsonObject) : undefined,
          stepRegistry: stepRegistrySnapshot,
          sourcePath,
          manifestHash: registry.manifestHash,
        },
      });
    }

    // Upsert each step
    for (let i = 0; i < registry.steps.length; i++) {
      const step = registry.steps[i];
      if (!step) continue;

      await prisma.challengeStep.upsert({
        where: {
          challengeId_stepKey: {
            challengeId: registry.id,
            stepKey: step.id,
          },
        },
        create: {
          challengeId: registry.id,
          stepKey: step.id,
          title: step.title,
          position: i + 1,
          promptPath: step.promptPath ?? null,
        },
        update: {
          title: step.title,
          position: i + 1,
          promptPath: step.promptPath ?? null,
        },
      });
    }

    console.log(
      `  ✓ ${registry.id} v${registry.version} — ${registry.steps.length} step(s)`,
    );
    synced++;
  }

  console.log(`\nSeeded ${synced} challenge(s).`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
