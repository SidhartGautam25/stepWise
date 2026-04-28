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

Good examples:

- Fix typo in draft quest, not published:
  keep the same version and re-seed.
- Add a new step to a published quest:
  bump `1.0.0` to `1.1.0`, update `challenge.json`, then re-seed.

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
