ALTER TABLE "challenges"
ADD COLUMN "latest_version_id" TEXT;

ALTER TABLE "challenges"
ADD CONSTRAINT "challenges_latest_version_id_fkey"
FOREIGN KEY ("latest_version_id") REFERENCES "challenge_versions"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
