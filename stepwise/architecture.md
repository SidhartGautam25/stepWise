# StepWise Global Architecture Blueprint

Welcome to the central high-level documentation of the StepWise platform! This document outlines exactly how our Monorepo is structured, what the responsibilities of each individual app/package are, and how they seamlessly interconnect to deliver a zero-friction educational coding platform.

## 🏗️ High-Level System Architecture

We utilize **Turborepo** to securely sandbox isolated logic into discrete components while natively bundling them for high-performance deployments.

The platform is broadly split into two root directories:
1. `apps/` = Directly runnable processes and interfaces.
2. `packages/` = Isolated logic layers and database schemas imported silently by apps.

---

## 💻 Apps

### 1. `apps/cli` (The Bring-Your-Own-Binary Engine)
**Responsibility**: Powers the student terminal workflow (`stepwise init`, `stepwise test`).
- Uses `tsup` and `pkg` to compile raw Node.js V8 engines + the Typescript logic into monolithic Standalone Native Binaries (`.exe`, Linux ELF, Mac Mach-O) for ultimate Zero-Setup distribution.
- Employs static `await import()` dispatcher patterns.
- Proxies test executions directly to the API, and pulls Challenge structure payloads locally.

### 2. `apps/web` (The Interactive Platform)
**Responsibility**: The visually staggering Next.js Dashboard.
- Renders the interactive Challenge Curriculum steps (`prompt.md`, `explanation.md`).
- Handles User Session management, displaying achievements, and rendering educational analogs.
- Consumes heavily from `@repo/db` and acts as the face of the StepWise brand.

### 3. `apps/api` (The Grand Router)
**Responsibility**: Fastify-driven core HTTP server managing strict stateless data flow.
- Houses controllers for fetching curriculum data, logging users in via securely signed JWTs (JSON Web Tokens), and storing challenge attempts.
- Exclusively uses `@repo/auth` for credential resolution and `@repo/db` for writes.

---

## 📦 Packages

### 1. `@repo/db`
**Responsibility**: The central source of truth for all schemas.
- Natively connects to our remote **Neon Postgres Pooler**.
- Handles data structure mapping through `schema.prisma`.
- Exposes strict TypeScript bindings via Prisma Client (`prisma.$queryRaw`) so Apps don't write manual SQL.
- Ships the declarative `db:seed` script that scrapes local `challenges/` JSON manifests and dynamically provisions them into the cloud!

### 2. `@repo/challenge-runner`
**Responsibility**: The highly restricted sandbox executing arbitrary student code natively.
- Pulls `workspace/` directories locally.
- Injects standard Testing Framework APIs or dynamic `HTTP Server` health-check probes.
- Reports structured `TestResult[]` objects (pass/fail) back out to the API.

### 3. `@repo/auth`
**Responsibility**: Specialized cryptography wrappers.
- Generates deeply hashed passwords (bcrypt).
- Mints stateless access tokens (jsonwebtoken) distributed across domains via browser cookies and CLI file caches.

### 4. `@repo/types`
**Responsibility**: Abstract Interfaces bridging decoupled boundaries.
- Resolves cross-package friction by mapping out Data Transfer Objects (DTO) like `ChallengeStepManifest` globally!

---

## 🔄 The Data Flow Blueprint (How they work together)

Let's walk through an entire student cycle:

1. **Auth (`web` ↔ `api` ↔ `@repo/db`):** 
Student clicks "Login" on `apps/web`. A fastify request is sent to `apps/api`. The API triggers `@repo/auth` to issue a JWT, stored in `@repo/db`.
2. **Setup (`cli` ↔ `api` ↔ `@repo/db`):** 
Student invokes `stepwise init node-crud` in bash. `apps/cli` asks `apps/api` for the challenge. Wait, the DB previously acquired the data via `@repo/db`'s `seed.ts` script!
3. **Execution (`cli` ↔ `@repo/challenge-runner`):** 
Student writes code and triggers `stepwise test`. `apps/cli` spawns `@repo/challenge-runner`, pointing to their local filesystem, running heavy programmatic tests in seconds, and beaming the results out to the world!
