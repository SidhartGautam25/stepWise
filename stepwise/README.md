# StepWise Monorepo Developer Guide

Welcome to the StepWise Developer Platform! This architecture utilizes a high-performance **Turborepo** matrix housing isolated React frameworks, standard Node.js logic bindings, and a fully standalone CLI application.

## 🏗️ Architecture Overview

The system is split into two massive pillars: `apps/` and `packages/`

### Applications (`apps/`)
- **`web`**: The beautiful Challenge UI Frontend Dashboard (Next.js/React).
- **`api`**: The centralized system router handling OAuth and Data Pipelines.
- **`cli`**: The Native Standalone App distribution for our End-Users to complete curriculum!

### Packages (`packages/`)
- **`db`**: Prisma schemas scaling seamlessly against our remote pooler on Neon Postgres.
- **`challenge-runner`**: The isolated engine analyzing logic tests.
- **`auth`**: Centralized authentication wrappers and tokens.
- **`types`**: Strictly enforced TypeScript definitions distributed universally.

---

## ⚡ Local Development Setup

### 1. Database Provisioning
StepWise relies on a remote **Neon Serverless Postgres** platform mapped to standard Prisma bindings.
You **MUST** correctly seed the Database to propagate internal curriculum logic to the Web Dashboard.

```bash
# Force push Prisma Schema changes to the remote Neon Database natively
pnpm --filter @repo/db turbo run db:push

# Hydrate the tables with default challenges/users
pnpm --filter @repo/db turbo run db:seed
```

### 2. Spinning up the Dev Matrix
Since all internal apps depend natively on each other, you can forcefully spin them all up locally at the exact same time via Turborepo:

```bash
pnpm turbo run dev
```

> [!NOTE]
> This sequentially starts up `api` on Port 4000, and `web` on Port 3000 seamlessly!

---

## 💻 Working on the Native CLI (`apps/cli`)
Because StepWise is architected around a Zero-Dependency "Compile to Binary" pipeline, you don't run `node index.js`. 

To develop the CLI natively locally:
1. Make your logic modifications.
2. Build the exact payload bundle using `tsup`.
3. Alias the built payload strictly into your Local `%PATH%` via `npm link`.

```bash
# 1. Compile bundle
pnpm turbo run build --filter cli

# 2. Globally link the CLI binary
cd apps/cli
npm link  # NOTE: Run as elevated Administrator/Root if EACCES thrown
```

You can now freely test your new code directly by typing `stepwise init node-crud`!

### Production Releasing
When pushing code up to deployment, we natively strip out all external dependencies and bundle the raw NodeJS engine into your executable structure:
```bash
# Compiles V8 Mac/Windows/Linux executables locally
pnpm turbo run compile --filter cli
```

The resulting massive binaries land in `apps/cli/binaries/` natively. Do not commit these to git! Just upload them to GitHub releases.
