# Challenge Creation Guide

This guide reflects the current StepWise architecture:

- `challenge.json` is the developer-authored source file.
- `pnpm --filter @repo/db db:seed` or the dev `ContentWatcher` turns that into a DB snapshot.
- `challenge_versions.step_registry` is the runtime source of truth for API and CLI metadata.
- Markdown, tests, starter files, and interactive JSON still live on disk and are loaded through `StepContentManager` using DB registry paths.

## What Is Fully DB-Driven

- `apps/api` reads challenge metadata and step registry from the database.
- `apps/cli` test flow reads challenge metadata and step registry from the API/database.
- Challenge attempts are linked to immutable version snapshots.
- In dev, editing `challenge.json` auto-syncs through `ContentWatcher`.

## What Is Not Fully DB-Driven Yet

- The quest catalog and home-page track cards now derive from API challenge data.
- Some home-page marketing copy is still editorial and static by design.
- If you want brand-new registry fields to flow through web UI, add them to the registry parser and API response types together.

## Directory Structure

Each quest lives under `challenges/<challenge-id>/`.

```text
challenges/<challenge-id>/
├── challenge.json
└── steps/
    ├── 00-primer/
    │   ├── prompt.md
    │   ├── explanation.md
    │   ├── solution.md                 # optional
    │   ├── interactive-sequence.json   # optional
    │   ├── code.json                   # optional
    │   ├── tests/
    │   │   ├── visible.test.js
    │   │   └── hidden.test.js          # optional
    │   └── workspace/
    │       └── starter/
    └── 01-next-step/
        └── ...
```

## Developer Workflow

To create a new quest:

1. Create a new folder under `challenges/<quest-id>/`.
2. Add a `challenge.json`.
3. Add step folders under `steps/`.
4. Add the step assets referenced by `challenge.json`:
   `prompt.md`, `explanation.md`, `solution.md`, `tests/*`, `workspace/starter/*`, `interactive-sequence.json`, `code.json` as needed.
5. Sync the manifest into the database:
   `pnpm --filter @repo/db db:seed`
6. If the API is running in development, you can instead save `challenge.json` and let `ContentWatcher` sync it automatically.
7. Open the quest through API-backed surfaces:
   `apps/web/app/challenges/*`, the home page track cards, or the CLI.

To add a new step to an existing quest:

1. Create `challenges/<quest-id>/steps/<step-id>/`.
2. Add the step files.
3. Add the step entry to `challenge.json`.
4. If the quest content is already published, bump the quest `version` before changing `challenge.json`.
5. Re-seed or let the watcher sync.

## Writing `challenge.json`

`challenge.json` is the only file developers edit for challenge structure and metadata.

Minimum top-level fields:

```json
{
  "schemaVersion": 1,
  "id": "node-crud",
  "version": "1.0.0",
  "title": "Pure Node.js CRUD API",
  "language": "javascript",
  "runtime": "node",
  "type": "server",
  "steps": []
}
```

Common top-level fields supported by the registry builder:

- `id`
- `version`
- `title`
- `language`
- `runtime`
- `type`
- `mode`
- `description`
- `difficulty`
- `tags`
- `systemRequirements`
- `defaultTimeoutMs`
- `entrypoint`
- `server`
- `steps`

Common step fields supported by the registry builder:

- `id`
- `title`
- `difficulty`
- `estimatedMinutes`
- `prerequisites`
- `prompt`
- `explanation`
- `solution`
- `free`
- `requiresTerminal`
- `tests.visible`
- `tests.hidden`
- `workspace.root`
- `workspace.starter`
- `workspace.entrypoint`
- `entrypoint`
- `timeoutMs`
- `server`
- `interactiveLessonId`
- `interactiveLesson`

## Example Step Entry

```json
{
  "id": "01-setup",
  "title": "Boot the Server",
  "prompt": "prompt.md",
  "explanation": "explanation.md",
  "solution": "solution.md",
  "free": true,
  "workspace": {
    "root": "steps/01-setup/workspace",
    "starter": "steps/01-setup/workspace/starter",
    "entrypoint": "server.js"
  },
  "tests": {
    "visible": "steps/01-setup/tests/visible.test.js",
    "hidden": "steps/01-setup/tests/hidden.test.js"
  },
  "timeoutMs": 10000
}
```

## Testing Expectations

For Node function challenges:

- Use `@repo/tester-node`.
- The CLI chooses the tester from the DB-backed runtime metadata through `TesterRegistry`.

For Node server challenges:

- Use `@repo/tester-server`.
- Define `type: "server"` and optional `server` config in the manifest.

For Rust function challenges:

- Use `runtime: "rust"`.
- The CLI can resolve `@repo/tester-rust`.
- Current Rust tester runs `cargo test --quiet` in the student workspace.

## Publishing and Versioning

Important rule:

- `challenge_versions.step_registry` is treated as an immutable version snapshot.
- The current sync logic preserves published snapshots.
- If a challenge has already been published and you change its structure or metadata, bump `version` first.
- The `challenges.latest_version_id` field points the app to the current active snapshot for that quest.

Good examples:

- Fix typo in draft quest, not published:
  keep the same version and re-seed.
- Add a new step to a published quest:
  bump `1.0.0` to `1.1.0`, update `challenge.json`, then re-seed.
- Add a new optional field to a draft step:
  update the manifest, sync, and keep the same version unless the quest has already been published.

## Commands

Generate or refresh DB challenge snapshots:

```bash
pnpm --filter @repo/db db:seed
```

Run the API with dev auto-sync:

```bash
pnpm --filter api dev
```

Force watcher on:

```bash
STEPWISE_CONTENT_WATCHER=1 pnpm --filter api dev
```

Force watcher off:

```bash
STEPWISE_CONTENT_WATCHER=0 pnpm --filter api dev
```

## Current Caveats

- The new registry now has first-class fields for `difficulty`, `estimatedMinutes`, `prerequisites`, and `interactiveLessonId`, but the UI does not yet render all of them.
- The richer path/config snapshot is stored in `challenge_versions.step_registry`; individual SQL columns were intentionally not added for every step field.
- Home-page track cards are now derived from live challenge data, but the grouping and copy are still heuristic rather than editor-authored.

## Changing the Schema or Adding a New Field

Use this flow when you change the Prisma schema, add a new registry field, or want a new field to appear in API, CLI, or web surfaces.

### Case 1: Add a New Field Only to `challenge.json` / `step_registry`

This is the most common case. Use it when the new field belongs inside the JSON snapshot stored in `challenge_versions.step_registry`.

Examples:

- a new top-level field like `audience`
- a new step field like `hints`
- a new optional config block for a tester

Steps:

1. Update the TypeScript registry types in `packages/db/src/challengeRegistry.ts`.
   This makes the field part of the official contract instead of an informal JSON extra.
2. Update the parser in `buildChallengeRegistry()` / `parseStep()`.
   This teaches the seed and watcher how to read the field from `challenge.json`.
3. If the field should be visible to consumers, update response types and mappers in API, CLI, or web code.
   The registry can store the field even if the UI does not render it yet.
4. Add the field to `challenge.json`.
5. Sync the database snapshot.

Commands:

```bash
pnpm --filter @repo/db build
pnpm --filter api build
pnpm --filter cli build
pnpm --filter stepwise-web build
pnpm --filter @repo/db db:seed
```

In development, if the API watcher is running, saving `challenge.json` will auto-sync the snapshot. You still want the build commands before merging so we catch type drift across packages.

### Case 2: Add a New Database Column or Change Prisma Schema

Use this when the new field must live as a real SQL column instead of only inside `step_registry`.

Examples:

- add a new column to `challenges`
- add a foreign key
- add a new relation like `latest_version_id`

Steps:

1. Update `packages/db/prisma/schema.prisma`.
2. Generate the Prisma client.
3. Apply the schema change to the database.
4. Update any sync logic in `packages/db/src/challengeSync.ts` if the new column must be written during seed/watcher sync.
5. Update API, CLI, and web code that reads the new field.
6. Re-seed if the change depends on challenge manifests.

Commands:

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db build
pnpm --filter api build
pnpm --filter cli build
pnpm --filter stepwise-web build
pnpm --filter @repo/db db:seed
```

If Prisma schema apply fails in your environment, apply the migration SQL directly against the database, then run the same build and seed steps again.

### How to Decide: JSON Snapshot Field or SQL Column?

Put the field in `challenge_versions.step_registry` when:

- it is challenge metadata
- it changes per quest version
- it belongs to the manifest or step definition
- it does not need standalone SQL querying across rows

Add a dedicated SQL column when:

- the app needs to query or filter on it often
- it participates in relations or foreign keys
- it identifies the active version or another canonical row
- it is not just versioned manifest content

As a rule of thumb, step-level authoring data usually belongs in `step_registry`. Global relational state usually belongs in SQL columns.

## Why Versioning Matters

The `version` field in `challenge.json` is no longer cosmetic. It is the identity of the immutable snapshot stored in `challenge_versions`.

That gives us a few important guarantees:

1. Old learner attempts stay attached to the exact challenge definition they were created against.
2. We can safely improve a quest without rewriting history for already-submitted attempts.
3. API and CLI can agree on the same versioned metadata.
4. Published content becomes stable and auditable.

### Practical Versioning Rules

- Draft quest, not published yet:
  you can usually keep the same version and re-sync.
- Published quest, structure or metadata changes:
  bump the version first.
- Published quest, adding or removing steps:
  always bump the version.
- Published quest, changing runtime/test behavior/pathing:
  always bump the version.

Suggested version bumps:

- patch (`1.0.0` -> `1.0.1`):
  typo fixes or tiny metadata corrections
- minor (`1.0.0` -> `1.1.0`):
  new step, new optional behavior, meaningful content expansion
- major (`1.0.0` -> `2.0.0`):
  breaking structural change, runtime shift, or incompatible redesign

### What `latest_version_id` Is Doing for Us

The `challenges` table now keeps `latest_version_id`, which points to the active snapshot row in `challenge_versions`.

This matters because:

- the app does not have to guess which version is current
- web and API reads can consistently resolve the active quest snapshot
- old version rows remain intact for attempts and history

So the pattern is:

- `challenge.json` is what developers edit
- `challenge_versions` stores each immutable snapshot
- `challenges.latest_version_id` points to the current one
- `challenge_attempts.challenge_version_id` preserves history per learner attempt
