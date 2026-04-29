ALTER TABLE "challenge_steps"
  ADD COLUMN IF NOT EXISTS "interactive_lesson" JSONB,
  ADD COLUMN IF NOT EXISTS "render_config" JSONB;
