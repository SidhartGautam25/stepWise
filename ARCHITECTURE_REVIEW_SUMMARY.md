# Architecture Review - TL;DR Summary

## 🔴 Top 5 Issues

### 1. **Dual Source of Truth** 
- Challenge metadata lives in both `challenge.json` AND database
- Manual `db:seed` required after every change
- API/CLI can disagree on step structure
- **Impact:** Adding new fields requires changes in 5+ places

### 2. **Scattered Content Definition**
- Steps defined in: filesystem `.md` files, JSON manifest, database, interactive-engine imports
- No single place to see "what is a Step?"
- Updating step requires edits in 5+ systems
- **Impact:** 800 steps × 5 places to edit = massive error surface

### 3. **Tight Coupling in Challenge Resolution**
- Same file-path logic duplicated in CLI, API, and Runner
- Hard to add new challenge types (Rust, Docker, AI)
- Must edit core code → recompile binary
- **Impact:** Can't add new testers without shipping new binary

### 4. **Missing Step Registry/Plugin System**
- Testers hardcoded: `if (server) new ServerTester() else new NodeTester()`
- No way to add Rust/Docker challenges without core code changes
- **Impact:** Platform locked to current challenge types

### 5. **Database Schema Gaps**
- Missing: `explanation_path`, `entrypoint`, `estimated_minutes`, `prerequisites`, versioning
- `challengeService` must re-read filesystem constantly
- **Impact:** Can't enforce step unlock logic or tracking in DB

---

## ✅ Quick Wins (Do First)

| Task | Time | Impact | Difficulty |
|------|------|--------|------------|
| Extract `StepContentManager` | 1 day | Removes duplication | Easy |
| Add `ChallengeVersion` table | 2 days | Enables versioning | Medium |
| Create quest scaffold tool | 1 day | Faster new quests | Easy |
| Document "Adding a Quest" SOP | 1 day | Prevents mistakes | Easy |

---

## 🏗️ Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Database (Neon)                       │
│  ChallengeVersion (id, version, stepRegistry JSON)      │
│  ChallengeAttempt (linked to ChallengeVersion)          │
└─────────────────────────────────────────────────────────┘
          ▲
          │ (read)
          │
┌─────────────────────────────────────────────────────────┐
│            Content Services (Single Source)             │
│  • ChallengeRegistry (fetch from DB, cache in RAM)      │
│  • StepContentManager (load .md, test files on disk)   │
│  • ContentWatcher (auto-sync on challenges/*.json edit) │
└─────────────────────────────────────────────────────────┘
          ▲
          │ (uses)
          │
┌─────────────────────────────────────────────────────────┐
│         apps/cli          │         apps/api            │
│  (reads registry)         │  (reads registry)           │
│  (runs tester)            │  (serves catalog)           │
└──────────┬────────────────┬─────────────────────────────┘
           │
           │ (uses)
           ▼
┌─────────────────────────────────────────────────────────┐
│              TesterRegistry (Pluggable)                  │
│  • NodeTester (registered)                              │
│  • ServerTester (registered)                            │
│  • RustTester (new - just register, no code changes)    │
│  • DockerTester (future)                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Benefits After Refactor

| Metric | Before | After |
|--------|--------|-------|
| **Time to add new step** | ~5 min (edit JSON + re-seed) | ~1 sec (auto-sync) |
| **Time to add new challenge type** | 1-2 days (code changes) | 1 hour (register tester) |
| **Files to update when adding field** | 5-7 files | 2 files (JSON + .md) |
| **Scaling to 100 quests** | Manual burden high | Mostly automated |
| **API/CLI disagreements** | Possible | Impossible (same DB) |
| **Challenge versioning** | Not present | Built-in |

---

## 📝 Recommended Implementation Order

### Phase 1: Database Foundation (Week 1)
```bash
1. Add ChallengeRegistry interface to @repo/types
2. Extend Prisma schema with ChallengeVersion table
3. Update db:seed to create version rows
4. Update challengeService.ts to read from DB
```

### Phase 2: Consolidation (Week 2)
```bash
1. Create StepContentManager in @repo/challenge-runner
2. Refactor CLI to use manager
3. Refactor API to use manager
4. Add tests
```

### Phase 3: Extensibility (Week 3)
```bash
1. Build TesterRegistry system
2. Refactor CLI to use registry
3. Create RustTester as example
4. Document plugin interface
```

### Phase 4: Developer Experience (Week 4)
```bash
1. Create @repo/quest-generator package
2. Build scaffold tool
3. Add content watcher for dev
4. Update docs
```

---

## 🚀 New Developer Experience

After changes:
```bash
# Create a new quest (fully scaffolded)
pnpm create-quest
# ? Quest ID: react-hooks
# ? Title: Learn React Hooks
# ? Steps: 5
# ✅ Generated at challenges/react-hooks/

# Development auto-syncs
pnpm turbo run dev
# [ContentWatcher] Detected change: challenges/react-hooks/challenge.json
# [ContentWatcher] ✅ Updated react-hooks in DB

# Add new challenge type
# (no code change needed, just register tester)

# Create new tester
packages/tester-rust/src/index.ts (implements Tester interface)
# Then somewhere: testerRegistry.register(new RustTester())
```

---

## 🔗 Related Files in Repo

- **Current source of truth conflicts:**
  - [challenges/node-crud/challenge.json](challenges/node-crud/challenge.json) (filesystem)
  - [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma) (DB)
  - [packages/db/src/seed.ts](packages/db/src/seed.ts) (parser)
  - [apps/api/src/services/challengeService.ts](apps/api/src/services/challengeService.ts) (reader)

- **Duplication:**
  - [apps/cli/src/commands/test.ts](apps/cli/src/commands/test.ts) (tester selection)
  - [packages/challenge-runner/src/challengeManifest.ts](packages/challenge-runner/src/challengeManifest.ts) (path resolution)
  - [apps/api/src/services/challengeService.ts](apps/api/src/services/challengeService.ts) (path resolution)

- **Content scattered:**
  - [challenges/*/steps/](challenges/) (prompt.md, explanation.md)
  - [packages/lesson-content/src/](packages/lesson-content/src/) (interactive content)
  - [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma) (metadata)

---

## ❓ Key Questions to Decide

1. **DB-driven vs File-driven?**
   - Recommendation: Keep `.md` files on disk, metadata + structure in DB

2. **When to version challenges?**
   - Recommendation: Explicit (semver in `challenge.json`), developer chooses

3. **Interactive lessons in DB?**
   - Recommendation: Yes, similar to ChallengeRegistry pattern

4. **Enforce test result schema?**
   - Recommendation: Yes, add `@repo/test-result-schema` package

---

## 📚 See Full Details

Read the full review: [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md)

Contains:
- Detailed problem analysis
- Code examples for each solution
- Complete implementation guide
- Roadmap with effort estimates
- FAQ and decision matrix
