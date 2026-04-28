import fs from "fs";
import path from "path";
import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import { buildChallengeRegistry } from "./challengeRegistry";

export const CHALLENGES_ROOT = path.resolve(__dirname, "../../../challenges");

export interface SyncChallengeResult {
  id: string;
  version: string;
  stepCount: number;
  skippedPublishedSnapshot: boolean;
}

export async function syncChallengeDirectory(
  challengeDir: string,
  challengesRoot = CHALLENGES_ROOT,
): Promise<SyncChallengeResult> {
  const registry = buildChallengeRegistry(challengeDir);

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
      systemRequirements: registry.systemRequirements
        ? (registry.systemRequirements as Prisma.InputJsonObject)
        : undefined,
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
      systemRequirements: registry.systemRequirements
        ? (registry.systemRequirements as Prisma.InputJsonObject)
        : undefined,
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

  const skippedPublishedSnapshot = Boolean(existingVersion?.isPublished);

  if (!skippedPublishedSnapshot) {
    const sourcePath = path.relative(challengesRoot, registry.sourcePath);
    const stepRegistrySnapshot = JSON.parse(
      JSON.stringify({
        ...registry,
        sourcePath,
        manifestPath: path.join(sourcePath, "challenge.json"),
      }),
    ) as Prisma.InputJsonObject;

    const versionRow = await prisma.challengeVersion.upsert({
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
        systemRequirements: registry.systemRequirements
          ? (registry.systemRequirements as Prisma.InputJsonObject)
          : undefined,
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
        systemRequirements: registry.systemRequirements
          ? (registry.systemRequirements as Prisma.InputJsonObject)
          : undefined,
        stepRegistry: stepRegistrySnapshot,
        sourcePath,
        manifestHash: registry.manifestHash,
      },
    });

    await prisma.challenge.update({
      where: { id: registry.id },
      data: { latestVersionId: versionRow.id },
    });
  } else if (existingVersion) {
    await prisma.challenge.update({
      where: { id: registry.id },
      data: { latestVersionId: existingVersion.id },
    });
  }

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

  return {
    id: registry.id,
    version: registry.version,
    stepCount: registry.steps.length,
    skippedPublishedSnapshot,
  };
}

export async function syncAllChallenges(
  challengesRoot = CHALLENGES_ROOT,
): Promise<SyncChallengeResult[]> {
  if (!fs.existsSync(challengesRoot)) return [];

  const entries = fs
    .readdirSync(challengesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const results: SyncChallengeResult[] = [];

  for (const entry of entries) {
    results.push(
      await syncChallengeDirectory(path.resolve(challengesRoot, entry.name), challengesRoot),
    );
  }

  return results;
}
