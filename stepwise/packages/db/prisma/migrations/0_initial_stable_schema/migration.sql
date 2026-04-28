-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('LOCAL', 'SERVER');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('STARTED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "AttemptOutcome" AS ENUM ('PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "password_hash" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "challenge_type" TEXT NOT NULL DEFAULT 'function',
    "description" TEXT,
    "difficulty" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "system_requirements" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_steps" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "prompt_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "challenge_version" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "mode" "AttemptMode" NOT NULL DEFAULT 'LOCAL',
    "status" "AttemptStatus" NOT NULL DEFAULT 'STARTED',
    "outcome" "AttemptOutcome",
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "result_json" JSONB,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "current_step_key" TEXT NOT NULL,
    "completed_step_keys" TEXT[],
    "challenge_completed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "challenge_steps_challenge_id_position_idx" ON "challenge_steps"("challenge_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_steps_challenge_id_step_key_key" ON "challenge_steps"("challenge_id", "step_key");

-- CreateIndex
CREATE INDEX "attempts_user_id_challenge_id_status_idx" ON "attempts"("user_id", "challenge_id", "status");

-- CreateIndex
CREATE INDEX "attempts_user_id_challenge_id_step_key_idx" ON "attempts"("user_id", "challenge_id", "step_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_challenge_id_key" ON "user_progress"("user_id", "challenge_id");

-- AddForeignKey
ALTER TABLE "challenge_steps" ADD CONSTRAINT "challenge_steps_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "challenge_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

