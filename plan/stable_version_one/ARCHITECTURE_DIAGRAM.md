# Visual Architecture Diagrams

## Current Architecture (Problems)

### Data Flow Diagram - Where Everything Lives Now

```
┌─────────────────────────────────────────────────────────────────┐
│                      DUAL SOURCES OF TRUTH                       │
└─────────────────────────────────────────────────────────────────┘

FILESYSTEM (challenges/)
┌──────────────────────────────────┐
│ challenges/node-crud/            │
│  ├── challenge.json              │  ← CLI reads this
│  │    (metadata + structure)     │  ← API reads this (sometimes)
│  └── steps/                      │
│      ├── 00-primer/              │
│      │   ├── prompt.md           │  ← Read individually
│      │   ├── explanation.md      │  ← Read individually
│      │   └── tests/visible.js    │  ← Executed by runner
│      └── 01-setup/               │
│          └── ...                 │
└──────────────────────────────────┘
          ▲
          │ (parsed by db:seed)
          │ (duplicated reading)
          │ (no sync guarantee)
          ▼

DATABASE (Neon Postgres)
┌──────────────────────────────────┐
│ Table: challenges                │
│ ├── id: "node-crud"              │
│ ├── title, language, runtime     │  ← Subset of data
│ └── created_at, updated_at       │
│                                  │
│ Table: challenge_steps           │
│ ├── challenge_id, step_key       │  ← Only step lookup
│ ├── title, position              │  ← Missing: paths, metadata
│ └── prompt_path                  │  ← Path to .md file
│                                  │
│ No versioning ❌                 │
│ No step registry ❌              │
│ No interactive content link ❌   │
└──────────────────────────────────┘
          ▲
          │ (reads to serve)
          │ (might not match JSON)
          │
          ├─────────────┬──────────────┬──────────────┐
          │             │              │              │
     ┌────┴───┐   ┌─────┴──┐   ┌──────┴───┐   ┌────┴────┐
     │ apps/api   │ apps/cli   │ web       │ challenge-runner
     └─────────┘   └──────────┘   └─────────┘   └─────────────┘

CONTENT SCATTERED IN 5 PLACES
├── 1. Filesystem (.md files): prompt.md, explanation.md, solution.md
├── 2. challenge.json: structure, metadata
├── 3. Database: minimal metadata
├── 4. lesson-content package: interactive slides
├── 5. Hardcoded in challenge-runner: path resolution logic
```

**Problems:**
- ❌ Same data read from filesystem multiple times
- ❌ No sync guarantee between filesystem and database
- ❌ Duplicate path resolution logic (3 places)
- ❌ No versioning
- ❌ Adding fields requires changes in 5+ places

---

## Proposed Architecture (Solution)

### Single Source of Truth - Database-Driven

```
┌─────────────────────────────────────────────────────────────────┐
│              SINGLE SOURCE OF TRUTH: DATABASE                    │
└─────────────────────────────────────────────────────────────────┘

FILESYSTEM (challenges/) - Deployment Artifacts
┌──────────────────────────────────┐
│ challenges/node-crud/            │
│  ├── challenge.json              │  ← Developer edits this
│  │    (metadata + structure)     │
│  └── steps/                      │
│      ├── 00-primer/              │
│      │   ├── prompt.md           │  ← Developer writes these
│      │   ├── explanation.md      │
│      │   ├── solution.md         │
│      │   └── tests/              │
│      │       ├── visible.js      │
│      │       └── hidden.js       │
│      └── 01-setup/               │
│          └── ...                 │
└──────────────────────────────────┘
          │
          │ pnpm db:seed (ONE-TIME)
          │ Builds ChallengeRegistry from JSON
          │ Creates immutable snapshot in DB
          ▼

DATABASE (Neon Postgres) - Source of Truth
┌────────────────────────────────────────┐
│ Table: challenge_versions              │
│ ├── id (UUID)                          │
│ ├── challenge_id: "node-crud"          │
│ ├── version: "1.0.0"                   │
│ ├── title, language, runtime           │
│ ├── capabilities: ["cli-runner", ...]  │
│ └── step_registry: {                   │ ← FULL SNAPSHOT
│     "id": "node-crud",                 │   - All step metadata
│     "version": "1.0.0",                │   - All paths
│     "steps": [{                        │   - All config
│       "id": "00-primer",               │
│       "promptPath": "steps/00-primer/prompt.md",
│       "visibleTestPath": "steps/00-primer/tests/visible.js",
│       "timeoutMs": 5000,               │
│       ...                              │
│     }]                                 │
│   }                                    │
│                                        │
│ Table: challenge_attempts              │
│ ├── challenge_version_id (FK)          │ ← Links to immutable
│ └── ...                                │
│                                        │
│ Versioning ✅                          │
│ Complete registry ✅                   │
│ Immutable snapshots ✅                 │
└────────────────────────────────────────┘
          ▲
          │ (all reads here)
          │
    ┌─────┴──────────┬──────────────┬──────────────┐
    │                │              │              │
    │            ┌───┴──────┐   ┌──┴──────┐  ┌────┴──────┐
    │            │ apps/api │   │apps/cli │  │web        │
    │            └──────────┘   └─────────┘  └───────────┘
    │                │
    │                ├─→ ContentWatcher (dev mode)
    │                │   Auto-syncs DB when challenge.json changes
    │                │
    │                └─→ StepContentManager
    │                    Loads .md, test files from disk
    │                    (metadata from DB registry)
    ▼
challenge-runner package
├── TesterRegistry (pluggable)
│   ├── NodeTester
│   ├── ServerTester
│   └── [New testers register here]
│
└── StepContentManager
    Loads step content from disk
```

**Benefits:**
- ✅ Single read point for all apps (no disagreement)
- ✅ Versioning built-in (old attempts linked to old version)
- ✅ Developer workflow: edit JSON → auto-sync in <1s
- ✅ Easy to add new fields (just update registry schema)
- ✅ Extensible via TesterRegistry
- ✅ Content immutable after publish

---

## Component Dependency Graph

### Current (Tight Coupling)

```
                    ┌─────────────┐
                    │  challenge  │
                    │   .json     │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌──────────────┐  ┌────────────┐
   │   db:seed   │  │   API reads  │  │  CLI reads │
   └──────┬──────┘  │   filesystem │  │ filesystem │
          │         └──────┬───────┘  └─────┬──────┘
          │                │                │
          ▼                ▼                ▼
    ┌─────────────┐  ┌──────────────┐  ┌────────────┐
    │ Database    │  │ API Service  │  │ CLI Parser │
    │ (partial)   │  │ duplicates   │  │ duplicates │
    └─────────────┘  │ path logic   │  │ path logic │
                     └──────────────┘  └────────────┘

Problem: Same logic in 3 places, same data read multiple ways
```

### Proposed (Clean Separation)

```
challenge.json (filesystem)
    │
    └──[db:seed]──→ ChallengeRegistry (JSON)
                       │
                       └──[DB]──→ challenge_versions table
                                  (immutable snapshot)
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │ API      │      │ CLI      │      │ Runner   │
              │ Service  │      │ Command  │      │ Engine   │
              └──────────┘      └──────────┘      └──────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────┐
                        │StepContentManager    │
                        │- Load registry       │
                        │- Read .md from disk  │
                        │- Resolve paths       │
                        │- Cache results       │
                        └──────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │ Prompt   │      │ Tests    │      │ Starter  │
              │ Content  │      │ Files    │      │ Code     │
              └──────────┘      └──────────┘      └──────────┘

Benefits: Single reader, reusable, testable, cacheable
```

---

## Data Model Evolution

### Current (Incomplete)

```sql
CREATE TABLE challenges (
  id VARCHAR PRIMARY KEY,
  title VARCHAR,
  language VARCHAR,
  runtime VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE challenge_steps (
  id UUID PRIMARY KEY,
  challenge_id VARCHAR,
  step_key VARCHAR,
  title VARCHAR,
  position INT,
  prompt_path VARCHAR,  -- Only this path, rest are in JSON
  created_at TIMESTAMP
);

-- Missing:
-- - versioning
-- - full registry
-- - estimated_minutes
-- - prerequisites
-- - interactive_lesson_id
-- - solution_path, explanation_path
-- - test paths
-- - workspace structure
```

### Proposed (Complete)

```sql
CREATE TABLE challenge_versions (
  id UUID PRIMARY KEY,
  challenge_id VARCHAR,
  version VARCHAR,
  title VARCHAR,
  language VARCHAR,
  runtime VARCHAR,
  capabilities JSONB,  -- ["cli-runner", "test-runner"]
  
  -- Full normalized step registry as JSON
  step_registry JSONB,  -- ChallengeRegistry object
  
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  
  UNIQUE(challenge_id, version)
);

CREATE TABLE challenges (
  id VARCHAR PRIMARY KEY,
  latest_version_id UUID REFERENCES challenge_versions(id),
  title VARCHAR,
  language VARCHAR,
  runtime VARCHAR,
  mode VARCHAR,
  is_published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY,
  user_id VARCHAR,
  challenge_id VARCHAR,
  challenge_version_id UUID,  -- NEW: immutable snapshot
  step_id VARCHAR,
  step_key VARCHAR,
  status VARCHAR,
  result_json JSONB,
  submitted_at TIMESTAMP,
  started_at TIMESTAMP,
  
  FOREIGN KEY (challenge_version_id) 
    REFERENCES challenge_versions(id)
);

-- Single JSON document: ChallengeRegistry
{
  "id": "node-crud",
  "version": "1.0.0",
  "title": "Pure Node.js CRUD API",
  "language": "javascript",
  "runtime": "node",
  "capabilities": ["cli-runner", "test-runner"],
  "steps": [
    {
      "id": "00-primer",
      "title": "Core Concepts",
      "position": 0,
      "free": true,
      "promptPath": "steps/00-primer/prompt.md",
      "explanationPath": "steps/00-primer/explanation.md",
      "visibleTestPath": "steps/00-primer/tests/visible.test.js",
      "workspaceRoot": "steps/00-primer/workspace",
      "starterPath": "steps/00-primer/workspace/starter",
      "entrypoint": "server.js",
      "timeoutMs": 5000,
      "difficulty": "beginner",
      "estimatedMinutes": 15,
      "prerequisites": [],
      "interactiveLessonId": null
    },
    ...
  ]
}
```

Benefits:
- Immutable snapshots
- Complete versioning
- All metadata in one place
- Easy to query relationships

---

## Execution Flow: Before vs After

### Current Flow (Problematic)

```
Developer edits challenge.json
        │
        ▼
developer runs: pnpm db:seed
        │
        ├──→ Parses challenge.json
        ├──→ Inserts into DB (incomplete)
        └──→ Manual process, easy to forget
        │
        ▼
Student starts CLI: stepwise test
        │
        ├──→ CLI reads challenge.json from disk
        ├──→ Parses manifest
        ├──→ Resolves step paths
        └──→ (might not match DB!)
        │
        ▼
[Could be out of sync with API]
        │
        ▼
Student runs: stepwise submit
        │
        └──→ API reads from DB
            (might differ from what CLI ran!)
```

### Proposed Flow (Automatic)

```
Developer edits challenges/node-crud/challenge.json
        │
        ▼
[Dev mode: ContentWatcher detects change]
        │
        ├──→ Auto-parses challenge.json
        ├──→ Builds ChallengeRegistry
        ├──→ Creates ChallengeVersion in DB
        ├──→ Invalidates cache
        └──→ ✅ Complete in <100ms
        │
        ▼
API/CLI both read from DB
        │
        ├──→ Same registry
        ├──→ Same paths
        ├──→ Same versioning
        └──→ ✅ Always in sync
```

---

## Tester Plugin System

### Current (Hardcoded)

```
apps/cli/src/commands/test.ts
│
└── if (manifest.type === "server")
    ├── YES: new ServerTester()
    └── NO:  new NodeTester()

Problem: Only 2 types. Adding Rust/Python/etc requires code change
```

### Proposed (Pluggable Registry)

```
challenge-runner/src/testerRegistry.ts

TesterRegistry
├── register(tester) → Add new tester
├── getTester(runtime, stepType) → Find by capability
└── [stores all registered testers]

Implementations:
├── NodeTester implements Tester
│   ├── name = "node"
│   ├── supportedRuntimes = ["node"]
│   └── canHandle(runtime, stepType) → true if runtime === "node"
│
├── ServerTester implements Tester
│   ├── name = "server"
│   ├── supportedRuntimes = ["node"]
│   └── canHandle(runtime, "server") → true
│
├── RustTester implements Tester [NEW]
│   ├── name = "rust"
│   ├── supportedRuntimes = ["rust"]
│   └── canHandle("rust", "function") → true
│
└── DockerTester [FUTURE]
    ├── name = "docker"
    └── canHandle("any", "containerized") → true

Usage:
const tester = testerRegistry.getTester(
  registry.runtime,
  registry.steps[0].type
);
const result = await tester.execute(input);

Benefits:
✅ No core code changes to add new testers
✅ Community can contribute testers
✅ Runtime discovery and validation
```

---

## Scaling Impact

### With Current Architecture (100 quests × 8 steps each = 800 steps)

```
Scaling Problem #1: Manual Sync
├── Add new challenge field → Update JSON
├── Re-run db:seed
├── Restart services
├── Wait for invalidation
└── ❌ 10+ minute cycle

Scaling Problem #2: Duplication
├── Each field in multiple files
├── Changes scattered across codebase
├── Risk of inconsistency
└── ❌ Error rate increases with scale

Scaling Problem #3: New Challenge Types
├── Need Kubernetes challenge type
├── Must edit CLI code
├── Must recompile binary
├── Must push to all users
└── ❌ High distribution burden

Result: Team velocity DECREASES as challenge count increases
```

### With Proposed Architecture (100 quests × 8 steps)

```
Scaling Solution #1: Auto-Sync
├── Add field to challenge.json
├── Save file
├── ✅ DB updates in <1s (ContentWatcher)
└── ✅ No manual steps

Scaling Solution #2: Single Definition
├── challenge.json → challenge_versions.step_registry
├── All code reads one place
├── Changes in one file
└── ✅ Minimal error surface

Scaling Solution #3: Pluggable Testers
├── Need Kubernetes support
├── Write KubernetesTester package
├── Register in startup
├── ✅ No recompilation
└── ✅ Instant availability

Result: Team velocity INCREASES or STAYS CONSTANT as scale grows
```

---

## Migration Timeline

```
Week 1: Database Foundation (PHASE 1)
├── Day 1-2: Prisma schema + ChallengeRegistry interface
├── Day 2-3: Registry service + seed script
├── Day 3-4: Update API + CLI to use DB
└── Result: ✅ API/CLI read from DB, versioning ready

Week 2: Content Management (PHASE 2)
├── Day 1-2: StepContentManager class
├── Day 2-3: Refactor API/CLI to use manager
├── Day 3-4: Add caching + tests
└── Result: ✅ Unified content loading, reduced duplication

Week 3: Extensibility (PHASE 3)
├── Day 1-2: TesterRegistry system
├── Day 2-3: Refactor CLI to use registry
├── Day 3-4: RustTester example + documentation
└── Result: ✅ Pluggable architecture, external testers possible

Week 4: Developer Experience (PHASE 4)
├── Day 1-2: Quest scaffold tool
├── Day 2-3: ContentWatcher for dev
├── Day 3-4: Docs + runbook updates
└── Result: ✅ New quests take <5min to scaffold

End State: ✅ Database-driven, versioned, scalable, extensible
```

---

## Reference: ChallengeRegistry JSON Example

```json
{
  "id": "node-crud",
  "version": "1.0.0",
  "title": "Pure Node.js CRUD API",
  "language": "javascript",
  "runtime": "node",
  "description": "Learn to build REST APIs...",
  "capabilities": ["cli-runner", "test-runner"],
  "mode": "local",
  "tags": ["node", "http", "rest", "crud", "backend"],
  "difficulty": "beginner",
  "systemRequirements": {
    "Operating System": "macOS, Linux, or Windows 10+",
    "Memory (RAM)": "1GB Minimum"
  },
  "steps": [
    {
      "id": "00-primer",
      "title": "Core Concepts & The Big Picture",
      "position": 0,
      "free": true,
      "promptPath": "steps/00-primer/prompt.md",
      "explanationPath": "steps/00-primer/explanation.md",
      "visibleTestPath": "steps/00-primer/tests/visible.test.js",
      "hiddenTestPath": "steps/00-primer/tests/hidden.test.js",
      "workspaceRoot": "steps/00-primer/workspace",
      "starterPath": "steps/00-primer/workspace/starter",
      "entrypoint": "server.js",
      "timeoutMs": 10000,
      "difficulty": "beginner",
      "estimatedMinutes": 15,
      "prerequisites": [],
      "interactiveLessonId": null
    },
    {
      "id": "01-setup",
      "title": "Boot the Server",
      "position": 1,
      "free": false,
      "promptPath": "steps/01-setup/prompt.md",
      "explanationPath": "steps/01-setup/explanation.md",
      "visibleTestPath": "steps/01-setup/tests/visible.test.js",
      "hiddenTestPath": "steps/01-setup/tests/hidden.test.js",
      "workspaceRoot": "steps/01-setup/workspace",
      "starterPath": "steps/01-setup/workspace/starter",
      "entrypoint": "server.js",
      "timeoutMs": 10000,
      "difficulty": "beginner",
      "estimatedMinutes": 20,
      "prerequisites": ["00-primer"],
      "interactiveLessonId": null
    }
  ]
}
```

This is what gets stored in `challenge_versions.step_registry` column as the immutable snapshot.
