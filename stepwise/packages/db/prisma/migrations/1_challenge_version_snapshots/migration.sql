-- Preserve the existing current-catalog tables and add immutable snapshots.
CREATE TABLE "challenge_versions" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "challenge_type" TEXT NOT NULL DEFAULT 'function',
    "description" TEXT,
    "difficulty" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "capabilities" TEXT NOT NULL DEFAULT '[]',
    "system_requirements" JSONB,
    "step_registry" JSONB NOT NULL,
    "source_path" TEXT,
    "manifest_hash" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "challenge_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "challenge_versions_challenge_id_version_key" ON "challenge_versions"("challenge_id", "version");
CREATE INDEX "challenge_versions_challenge_id_updated_at_idx" ON "challenge_versions"("challenge_id", "updated_at");

ALTER TABLE "attempts" ADD COLUMN "challenge_version_id" TEXT;

ALTER TABLE "challenge_versions" ADD CONSTRAINT "challenge_versions_challenge_id_fkey"
  FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attempts" ADD CONSTRAINT "attempts_challenge_version_id_fkey"
  FOREIGN KEY ("challenge_version_id") REFERENCES "challenge_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
