# @repo/db — Database Package

Prisma schema and client singleton for StepWise. Backed by Neon (managed Postgres).

## Quick Setup

### 1. Create a Neon database

1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project → pick a region near you
3. Open your project → **Connection Details** → copy the connection string  
   It looks like: `postgresql://alex:pass@ep-cool-123.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. Set your connection string

Create or edit `stepwise/.env` (already gitignored):

```bash
DATABASE_URL="postgresql://your-user:your-pass@your-host.neon.tech/stepwise?sslmode=require"
NODE_ENV="development"
```

The same file is read by the API app (`apps/api`) and the db package.

### 3. Push the schema and run the seed

From the **monorepo root** (`stepwise/`):

```bash
# Create all tables in Neon (no migration history, good for early dev)
pnpm --filter @repo/db db:push

# Seed challenge metadata from challenge.json manifests
pnpm --filter @repo/db db:seed
```

After seeding, every challenge in `challenges/` will have corresponding rows in  
`challenges` and `challenge_steps` tables.

### 4. Run migrations (when you're ready for production)

```bash
# Creates a versioned migration file and applies it
pnpm --filter @repo/db db:migrate

# Deploy existing migrations (CI / production)
pnpm --filter @repo/db db:migrate:deploy
```

---

## Schema Overview

| Table | Purpose |
|---|---|
| `users` | Student accounts (email/username, no auth yet) |
| `challenges` | Challenge metadata seeded from `challenge.json` |
| `challenge_steps` | Individual steps within a challenge |
| `attempts` | One run of one step — includes result JSON |
| `user_progress` | Current step + completed steps per (user, challenge) |

## Useful Commands

```bash
# Open Prisma Studio (visual DB browser)
pnpm --filter @repo/db db:studio

# Regenerate the Prisma client after schema changes
pnpm --filter @repo/db db:generate

# Re-seed after adding new challenges
pnpm --filter @repo/db db:seed
```
