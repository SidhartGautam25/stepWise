/**
 * Seed script: reads all challenge.json manifests from the challenges/ directory
 * and upserts them into the database (Challenge + ChallengeStep rows).
 *
 * Safe to run multiple times (idempotent via upsert).
 * Run with: pnpm --filter @repo/db db:seed
 */

import fs from "fs";
import path from "path";
import { prisma } from "./client";

const CHALLENGES_ROOT = path.resolve(__dirname, "../../../challenges");

interface ManifestStep {
  id: string;
  title: string;
  prompt?: string;
}

interface ChallengeManifest {
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  steps: ManifestStep[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function loadManifest(challengeDir: string): ChallengeManifest | null {
  const manifestPath = path.resolve(challengeDir, "challenge.json");
  if (!fs.existsSync(manifestPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as unknown;
    if (!isRecord(raw) || !Array.isArray(raw.steps)) return null;

    return {
      id: String(raw.id),
      version: String(raw.version),
      title: String(raw.title),
      language: String(raw.language),
      runtime: String(raw.runtime),
      steps: (raw.steps as unknown[]).map((s, i) => {
        if (!isRecord(s)) throw new Error(`Invalid step at index ${i}`);
        return {
          id: String(s.id),
          title: String(s.title),
          prompt: typeof s.prompt === "string" ? s.prompt : undefined,
        };
      }),
    };
  } catch {
    return null;
  }
}

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
    const manifest = loadManifest(challengeDir);

    if (!manifest) {
      console.warn(`  ⚠ Skipping ${entry.name} (no valid challenge.json)`);
      continue;
    }

    // Upsert Challenge
    await prisma.challenge.upsert({
      where: { id: manifest.id },
      create: {
        id: manifest.id,
        version: manifest.version,
        title: manifest.title,
        language: manifest.language,
        runtime: manifest.runtime,
      },
      update: {
        version: manifest.version,
        title: manifest.title,
        language: manifest.language,
        runtime: manifest.runtime,
      },
    });

    // Upsert each step
    for (let i = 0; i < manifest.steps.length; i++) {
      const step = manifest.steps[i];
      if (!step) continue;

      const promptPath =
        step.prompt
          ? `steps/${step.id}/${step.prompt}`
          : null;

      await prisma.challengeStep.upsert({
        where: {
          challengeId_stepKey: {
            challengeId: manifest.id,
            stepKey: step.id,
          },
        },
        create: {
          challengeId: manifest.id,
          stepKey: step.id,
          title: step.title,
          position: i + 1,
          promptPath,
        },
        update: {
          title: step.title,
          position: i + 1,
          promptPath,
        },
      });
    }

    console.log(
      `  ✓ ${manifest.id} v${manifest.version} — ${manifest.steps.length} step(s)`,
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
