# StepWise Architecture Review & Improvement Recommendations

**Date:** April 2026  
**Scope:** Code review of `stepwise/` monorepo for scalability improvements

---

## Executive Summary

Your StepWise platform has a **solid foundation** with good separation of concerns via Turborepo and clear app/package boundaries. However, there are **3 critical architectural friction points** that will compound as you add more quests and steps:

1. **Dual Source of Truth** — Challenge metadata lives in both `challenge.json` files AND the database, causing sync issues
2. **Scattered Content Definition** — Steps, prompts, tests, and interactive content are split across 5+ different systems with unclear ownership
3. **Tight Coupling in Challenge Resolution** — The resolver logic is duplicated across CLI, API, and runner, making it hard to add new challenge types
4. **Missing Abstraction for Step Handling** — Direct filesystem access scattered across services; no unified Step interface

---

## Current Architecture

### ✅ What's Working Well

```
apps/
├── cli              → Compile-to-binary standalone student CLI
├── api              → Fastify HTTP router (catalog, auth, attempts)
└── web              → Next.js dashboard (UI, progress tracking)

packages/
├── db               → Prisma schema + seeding
├── challenge-runner → Challenge execution orchestrator
├── challenge-schema → Shared manifest types
├── tester-node      → Node.js test executor
├── tester-server    → HTTP server test executor
├── lesson-content   → Interactive slides & configs
├── terminal-engine  → Terminal simulator
├── interactive-engine → Visual world renderer
└── auth, types, ui  → Shared utilities
```

**Strengths:**
- ✅ Clean monorepo with Turborepo task orchestration
- ✅ Isolated packages with clear dependencies
- ✅ Type safety via shared `@repo/types` and `@repo/challenge-schema`
- ✅ Database schema normalizes challenges + steps
- ✅ CLI compiles to native binaries (excellent UX)
- ✅ Execution logic properly sandboxed in `challenge-runner`

---

## 🔴 Critical Issues

### 1. **Dual Source of Truth: Challenge Metadata**

**Problem:**
```
challenge.json (filesystem)          Database (Neon Postgres)
├── steps[0].id: "00-primer"    →   challenge_steps table
├── steps[0].prompt: "prompt.md"     (step_key, position, etc.)
├── steps[0].tests.visible           
└── steps[0].workspace
```

**Current Flow:**
1. Developer writes `challenges/node-crud/challenge.json`
2. `db:seed` script parses JSON and inserts into `Challenge` + `ChallengeStep` tables
3. API reads database (`challengeService.getChallengeInfo()`)
4. CLI reads filesystem (`challengeRunner.loadChallengeManifest()`)
5. **If JSON changes, must re-seed database** ← Manual sync burden

**Pain Points:**
- ❌ New steps require: edit JSON → re-seed → validate DB → restart services
- ❌ Adding new challenge metadata fields (e.g., "videoUrl", "prerequisites") requires DB migration + seed script update
- ❌ API and CLI can disagree on step order, visibility, or unlock logic
- ❌ No versioning mechanism for challenges if you need to roll back

**Why This Matters:**
When you have 100 quests × 8 steps each = 800 steps, a single seed mistake breaks the platform for all users.

---

### 2. **Scattered Content Definition**

Content lives in **5 different locations** with unclear ownership:

```
challenges/node-crud/steps/00-primer/
├── prompt.md                      ← API reads this, CLI reads this
├── explanation.md                 ← UI renders from API response
└── workspace/
    ├── starter/                   ← Provisioned to student
    ├── tests/visible.test.js      ← @repo/challenge-runner executes
    └── tests/hidden.test.js       ← Anti-cheat tests

packages/lesson-content/src/
├── linux-aethera/slide-configs    ← Interactive slides (only some quests)
└── illustrations/                 ← Non-serializable React logic

database/
├── challenges table               ← Metadata
└── challenge_steps table          ← Step lookup

apps/web/lib/api.ts
└── fetchChallenge()               ← API marshals everything

apps/api/src/services/
└── challengeService.ts            ← Logic to read everything above
```

**The Result:**
- 🔴 **No single place** to understand "what is a Step?"
- 🔴 Prompt/explanation updates: edit `.md` file → API re-reads disk (if cached expires) → web refreshes
- 🔴 If you add a field to `challenge.json` (e.g., "estimatedMinutes"), must update:
  - `@repo/challenge-schema` (types)
  - `db/prisma/schema.prisma` (DB field)
  - `db/seed.ts` (parser)
  - `challengeService.ts` (response builder)
  - `@repo/types` (DTO types)
  - API endpoint response
- 🔴 Interactive content (lessons, slides) only attached to specific challenges via hardcoded imports in `lesson-content`

---

### 3. **Tight Coupling in Challenge Resolution**

Three places attempt to resolve "which file is the test?" and "where's the starter code?":

```typescript
// apps/cli/src/commands/test.ts
const manifest = loadChallengeManifest(challengePath);
const resolvedStep = resolveChallengeStep(challengePath, stepId);

// apps/api/src/services/challengeService.ts  
const manifest = loadChallengeManifestFromFile(manifestPath);
const workspaceConfig = s.workspace;

// packages/challenge-runner/src/challengeManifest.ts
export function resolveChallengeStep(challengePath, stepId, timeout) {
  const manifest = loadChallengeManifest(resolvedChallengePath);
  const step = manifest.steps.find(s => s.id === stepId);
  // Compute paths: testFilePath, starterPath, defaultUserCodePath
}
```

**Problems:**
- ❌ Logic duplication → bugs in one place don't get fixed in all 3
- ❌ Adding a new challenge type (e.g., "Kubernetes challenge") requires changes in 3+ places
- ❌ Hard to add "step variant" concept (e.g., "this step has 2 variants; student picks which to attempt")
- ❌ No abstraction for "describe how to find tests for a step" → hardcoded `steps/[stepId]/tests/visible.test.js`

---

### 4. **Missing Step Registry / Plugin System**

There's no way to say "I have a new type of step" without modifying core code.

Current testers are hardcoded:
```typescript
// apps/cli/src/commands/test.ts
const isServerChallenge = manifest.type === "server";
const tester = isServerChallenge ? new ServerTester() : new NodeTester();
```

What if you want:
- Rust challenges? (needs `RustTester`)
- Docker/Kubernetes challenges? (needs container runner)
- AI challenges with LLM evaluation?
- ML challenges with metric validation?

You must edit core CLI code → recompile → distribute new binary. ❌

---

### 5. **Database Schema Doesn't Capture Full Challenge State**

```sql
-- Current schema (partial)
CREATE TABLE challenge_steps (
  id UUID,
  challenge_id VARCHAR,
  step_key VARCHAR,           -- Matches challenge.json step.id
  title VARCHAR,
  position INT,
  prompt_path VARCHAR,        -- Relative path to prompt.md
  created_at TIMESTAMP
);
```

**Missing:**
- No `explanation_path`, `solution_path`, `workspace_root`, `entrypoint` columns
- No versioning; if you revise a step, old attempts still reference it
- No link to visible/hidden tests metadata
- No way to track "which interactive lesson config?" for this step
- No `estimated_minutes`, `difficulty_override`, `prerequisites` (for unlocking logic)

So `challengeService` **must** re-read the filesystem constantly to get complete step info.

---

## 🏗️ Recommended Improvements

### Improvement #1: **Single Source of Truth — Shift to Database-Driven Architecture**

**Goal:** Challenge JSON becomes a **deployment artifact**, not the source of truth.

**New Flow:**

```
1. [Developer Mode]
   challenges/node-crud/challenge.json
        ↓
   pnpm db:seed              (one-time: import & validate)
        ↓
   Database row created + immutable version tag created

2. [Runtime]
   API/CLI/Runner ALL read from Database
   
3. [Versioning]
   When you update challenge.json:
   → Increment version in JSON → db:seed creates NEW challenge version row
   → Old attempts remain linked to old version (immutable)
   → New attempts use new version
```

**Implementation Steps:**

1. **Create a `ChallengeRegistry` interface in `@repo/types`:**

```typescript
// @repo/types/src/challengeRegistry.ts
export interface ChallengeStepRegistry {
  id: string;
  challengeId: string;
  stepKey: string;
  title: string;
  version: string;
  
  // Content paths (all relative to challenge root)
  promptPath: string;
  explanationPath?: string;
  solutionPath?: string;
  
  // Test metadata
  visibleTestPath: string;
  hiddenTestPath?: string;
  
  // Workspace structure
  workspaceRoot: string;
  starterPath?: string;
  entrypoint: string;
  
  // Execution config
  timeoutMs: number;
  
  // Metadata
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
  position: number;
  free: boolean;
  
  // Unlocking rules
  prerequisites?: string[];  // array of step IDs
  
  // Interactive content
  interactiveLessonId?: string;
}

export interface ChallengeRegistry {
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  description?: string;
  steps: ChallengeStepRegistry[];
  
  // Capabilities: "cli-runner" | "test-runner" | "quest-evaluator"
  capabilities: string[];
}
```

2. **Extend Prisma schema to capture everything:**

```prisma
// Add to schema.prisma
model ChallengeVersion {
  id              String    @id @default(cuid())
  challengeId     String    @map("challenge_id")
  version         String    // semver: "1.0.0", "1.0.1", etc.
  title           String
  language        String
  runtime         String
  description     String?
  capabilities    Json      // ["cli-runner", "test-runner"]
  
  // Full normalized step registry (JSON blob or separate table)
  stepRegistry    Json      @map("step_registry") // Entire ChallengeRegistry structure
  
  // When was this version published?
  publishedAt     DateTime  @default(now()) @map("published_at")
  
  challenges      Challenge[] // FK relationship
  
  @@unique([challengeId, version])
  @@map("challenge_versions")
}

model Challenge {
  id              String    @id
  latestVersionId String    @map("latest_version_id")
  
  latestVersion   ChallengeVersion @relation(fields: [latestVersionId], references: [id])
  versions        ChallengeVersion[]
  
  @@map("challenges")
}

model ChallengeAttempt {
  id                    String    @id @default(cuid())
  userId                String    @map("user_id")
  challengeId           String    @map("challenge_id")
  challengeVersionId    String    @map("challenge_version_id")  // ← NEW: immutable snapshot
  stepId                String    @map("step_id")               // ← References ChallengeVersion.stepRegistry[i].id
  
  // ... rest of attempt fields
  
  challengeVersion      ChallengeVersion @relation(fields: [challengeVersionId], references: [id])
  
  @@map("challenge_attempts")
}
```

3. **Create a `ChallengeRegistry` service in `apps/api`:**

```typescript
// apps/api/src/services/challengeRegistryService.ts
import { db } from "@repo/db";

export async function getChallengeRegistry(
  challengeId: string,
  version?: string
): Promise<ChallengeRegistry> {
  const challengeVersion = await db.challengeVersion.findFirst({
    where: {
      challengeId,
      version: version || undefined, // Latest if not specified
    },
    orderBy: { publishedAt: "desc" },
    take: 1,
  });
  
  if (!challengeVersion) {
    throw new Error(`Challenge "${challengeId}" not found`);
  }
  
  return challengeVersion.stepRegistry as ChallengeRegistry;
}

export async function getStepFromRegistry(
  registry: ChallengeRegistry,
  stepKey: string
): Promise<ChallengeStepRegistry> {
  const step = registry.steps.find(s => s.stepKey === stepKey);
  if (!step) throw new Error(`Step "${stepKey}" not found`);
  return step;
}
```

4. **Refactor `challengeService.ts` to use registry:**

```typescript
// apps/api/src/services/challengeService.ts
export async function getChallengeInfo(challengeId: string): Promise<ChallengeInfo> {
  const registry = await getChallengeRegistry(challengeId);
  const stepsOnDisk = registry.steps.map((stepRegistry) => {
    // Read prompt.md, explanation.md from disk using registry paths
    const promptContent = fs.readFileSync(
      path.join(CHALLENGES_ROOT, challengeId, stepRegistry.promptPath),
      "utf-8"
    );
    return {
      id: stepRegistry.stepKey,
      title: stepRegistry.title,
      prompt: promptContent,
      // ... map other fields from registry
    };
  });
  
  return {
    id: registry.id,
    version: registry.version,
    steps: stepsOnDisk,
    // ...
  };
}
```

5. **Update `db:seed` to create `ChallengeVersion` rows:**

```typescript
// packages/db/src/seed.ts
async function seed() {
  for (const challengeDir of fs.readdirSync(CHALLENGES_ROOT)) {
    const manifest = loadChallengeManifestFromFile(
      path.join(challengeDir, "challenge.json")
    );
    
    // Convert manifest into ChallengeRegistry
    const registry: ChallengeRegistry = buildRegistry(manifest);
    
    // Create/update ChallengeVersion
    const version = await db.challengeVersion.upsert({
      where: { challengeId_version: { challengeId: manifest.id, version: manifest.version } },
      create: {
        challengeId: manifest.id,
        version: manifest.version,
        title: manifest.title,
        stepRegistry: registry,
        // ...
      },
      update: { stepRegistry: registry },
    });
    
    // Update Challenge.latestVersionId if this is newer
    await db.challenge.upsert({
      where: { id: manifest.id },
      create: { id: manifest.id, latestVersionId: version.id },
      update: { latestVersionId: version.id },
    });
  }
}
```

**Benefits:**
- ✅ Single source of truth: database
- ✅ Versioning is built in
- ✅ Old attempts stay linked to old challenge versions
- ✅ CLI/API/Runner all read same data
- ✅ Easy to add new step fields without breaking existing code
- ✅ No re-seeding required if JSON hasn't changed

---

### Improvement #2: **Unified Step Interface & Content Manager**

**Goal:** Define "what is a Step?" once and reuse everywhere.

**Create a `StepContentManager` in `@repo/challenge-runner`:**

```typescript
// @repo/challenge-runner/src/stepContentManager.ts

export interface StepContent {
  id: string;
  title: string;
  prompt: string;
  explanation?: string;
  solution?: string;
  
  // Execution
  testFilePath: string;
  hiddenTestFilePath?: string;
  defaultUserCodePath: string;
  
  // Workspace
  workspaceRoot: string;
  starterPath?: string;
  
  // Config
  timeoutMs: number;
  stepType: "function" | "server" | "interactive" | "free-form";
  
  // Metadata
  position: number;
  estimatedMinutes?: number;
  difficulty?: string;
  prerequisites?: string[];
}

export interface ChallengeContent {
  id: string;
  version: string;
  title: string;
  language: string;
  runtime: string;
  steps: StepContent[];
}

export class StepContentManager {
  constructor(
    private challengeId: string,
    private registry: ChallengeRegistry,
    private challengeRootPath: string
  ) {}
  
  /**
   * Load all step content (metadata + text files from disk)
   */
  async loadAllSteps(): Promise<StepContent[]> {
    return Promise.all(
      this.registry.steps.map(stepReg => this.loadStep(stepReg.stepKey))
    );
  }
  
  /**
   * Load a specific step by key
   */
  async loadStep(stepKey: string): Promise<StepContent> {
    const stepReg = this.registry.steps.find(s => s.stepKey === stepKey);
    if (!stepReg) throw new Error(`Step "${stepKey}" not found`);
    
    const promptPath = path.join(this.challengeRootPath, stepReg.promptPath);
    const explanationPath = stepReg.explanationPath
      ? path.join(this.challengeRootPath, stepReg.explanationPath)
      : undefined;
    
    return {
      id: stepReg.stepKey,
      title: stepReg.title,
      prompt: await fs.promises.readFile(promptPath, "utf-8"),
      explanation: explanationPath ? await fs.promises.readFile(explanationPath, "utf-8") : undefined,
      testFilePath: path.join(this.challengeRootPath, stepReg.visibleTestPath),
      defaultUserCodePath: path.join(
        this.challengeRootPath,
        stepReg.workspaceRoot,
        stepReg.entrypoint
      ),
      workspaceRoot: path.join(this.challengeRootPath, stepReg.workspaceRoot),
      starterPath: stepReg.starterPath
        ? path.join(this.challengeRootPath, stepReg.starterPath)
        : undefined,
      timeoutMs: stepReg.timeoutMs,
      stepType: this.inferStepType(stepReg),
      position: stepReg.position,
      estimatedMinutes: stepReg.estimatedMinutes,
      difficulty: stepReg.difficulty,
      prerequisites: stepReg.prerequisites,
    };
  }
  
  private inferStepType(stepReg: ChallengeStepRegistry): StepContent["stepType"] {
    // Use challenge registry capability flags to infer type
    if (this.registry.capabilities.includes("server")) return "server";
    if (stepReg.interactiveLessonId) return "interactive";
    return "function";
  }
}
```

**Benefits:**
- ✅ Single definition of "what is a step content?"
- ✅ Reusable across CLI, API, runner
- ✅ Easy to cache or lazy-load
- ✅ Clear contract for new step types

---

### Improvement #3: **Pluggable Tester Architecture**

**Goal:** Add new challenge types (Rust, Docker, AI) without modifying core code.

**Create a `TesterRegistry`:**

```typescript
// @repo/challenge-runner/src/testerRegistry.ts

export interface Tester {
  readonly name: string;
  readonly supportedRuntimes: string[];
  
  canHandle(runtime: string, stepType: string): boolean;
  execute(input: RunChallengeInput): Promise<RunChallengeResult>;
}

export class TesterRegistry {
  private testers: Tester[] = [];
  
  register(tester: Tester): void {
    this.testers.push(tester);
  }
  
  getTester(runtime: string, stepType: string): Tester {
    const tester = this.testers.find(t => t.canHandle(runtime, stepType));
    if (!tester) {
      throw new Error(`No tester found for runtime="${runtime}", stepType="${stepType}"`);
    }
    return tester;
  }
}

// Initialize globally
export const DEFAULT_TESTER_REGISTRY = new TesterRegistry();
DEFAULT_TESTER_REGISTRY.register(new NodeTester());
DEFAULT_TESTER_REGISTRY.register(new ServerTester());
// Future: register(new RustTester()), register(new DockerTester()), etc.
```

**Refactor CLI to use registry:**

```typescript
// apps/cli/src/commands/test.ts
import { DEFAULT_TESTER_REGISTRY } from "@repo/challenge-runner";

export async function main() {
  const manifest = loadChallengeManifest(challengePath);
  
  // Lookup tester dynamically instead of hardcoding
  const tester = DEFAULT_TESTER_REGISTRY.getTester(
    manifest.runtime,
    manifest.type
  );
  
  const result = await runChallenge({
    tester,
    challengePath,
    userCodePath,
    // ...
  });
}
```

**To add Rust support:**

```typescript
// packages/tester-rust/src/index.ts
export class RustTester implements Tester {
  name = "rust";
  supportedRuntimes = ["rust"];
  
  canHandle(runtime: string, stepType: string): boolean {
    return runtime === "rust" && stepType === "function";
  }
  
  async execute(input: RunChallengeInput): Promise<RunChallengeResult> {
    // Rust-specific execution logic
  }
}

// Then in app startup: register(new RustTester())
```

**Benefits:**
- ✅ New challenge types added without editing core CLI
- ✅ Binary doesn't need to recompile if only adding a tester package
- ✅ Better testability (mock testers)
- ✅ Community can contribute testers as packages

---

### Improvement #4: **Unified Step Creation & Discovery**

**Goal:** Make it dead simple to add a new step or quest.

**Create a guided scaffold tool:**

```bash
# Run interactive setup
pnpm create-quest

# Prompts:
# ? Quest ID (e.g., "react-hooks"): react-hooks
# ? Quest Title: Learn React Hooks
# ? Language: typescript
# ? Runtime: node
# ? How many steps? 5
#
# ? Step 1 ID: 01-useState
# ? Step 1 Title: Intro to useState
# ? Step 1 Type: function / server / interactive
# ? Has starter code? (y/n)
# ? Test framework: vitest / jest / custom
#
# Generated:
# challenges/react-hooks/
# ├── challenge.json (pre-filled)
# ├── steps/
# │   ├── 01-useState/
# │   │   ├── prompt.md
# │   │   ├── explanation.md
# │   │   ├── workspace/
# │   │   │   └── starter/
# │   │   └── tests/
# │   │       └── visible.test.ts
# │   └── 02-useEffect/
# │       └── ...
# └── .questignore (git ignore for solutions)

pnpm db:seed  # Auto-imports new quest
pnpm turbo run dev  # Visible on http://localhost:3000/challenges
```

**Implementation:**

```typescript
// packages/quest-generator/src/scaffolder.ts
export async function scaffoldQuest(config: QuestScaffoldConfig): Promise<void> {
  const questPath = path.join(CHALLENGES_ROOT, config.questId);
  
  // Create directories
  for (const step of config.steps) {
    const stepPath = path.join(questPath, "steps", step.id);
    fs.mkdirSync(stepPath, { recursive: true });
    
    // Generate prompt.md template
    fs.writeFileSync(
      path.join(stepPath, "prompt.md"),
      generatePromptTemplate(step)
    );
    
    // Generate test template
    fs.writeFileSync(
      path.join(stepPath, "tests", "visible.test.ts"),
      generateTestTemplate(step, config.testFramework)
    );
    
    // Copy starter files if applicable
    if (step.hasStarter) {
      copyStarterTemplate(stepPath, step.type);
    }
  }
  
  // Generate challenge.json
  const challengeManifest = buildChallengeManifest(config);
  fs.writeFileSync(
    path.join(questPath, "challenge.json"),
    JSON.stringify(challengeManifest, null, 2)
  );
  
  console.log(`✅ Quest scaffolded at ${questPath}`);
  console.log(`Next: cd ${questPath} && pnpm db:seed`);
}
```

**Benefits:**
- ✅ Consistent structure for every quest
- ✅ First-time authors don't get lost
- ✅ Fewer mistakes in manifest files
- ✅ Faster time-to-first-quest

---

### Improvement #5: **Content Sync & Caching Strategy**

**Goal:** Eliminate manual seeding and improve performance.

**Implement a `ContentWatcher` in API startup:**

```typescript
// apps/api/src/contentWatcher.ts
import { watch } from "fs";
import { db } from "@repo/db";

export async function startContentWatcher() {
  const challengesRoot = path.resolve(__dirname, "../../../../challenges");
  
  watch(challengesRoot, { recursive: true }, async (event, filename) => {
    if (!filename?.endsWith("challenge.json")) return;
    
    console.log(`[ContentWatcher] Detected change: ${filename}`);
    
    try {
      // Reload the challenge
      const challengeId = path.basename(path.dirname(filename));
      const manifest = loadChallengeManifestFromFile(filename);
      
      // Update DB
      const registry = buildRegistry(manifest);
      await db.challengeVersion.upsert({
        where: { challengeId_version: { challengeId: manifest.id, version: manifest.version } },
        create: { /* ... */ },
        update: { stepRegistry: registry },
      });
      
      // Clear caches
      challengeCache.invalidate(challengeId);
      
      console.log(`[ContentWatcher] ✅ Updated ${challengeId}`);
    } catch (err) {
      console.error(`[ContentWatcher] ❌ Error:`, err);
    }
  });
}

// Call in apps/api startup:
// if (process.env.NODE_ENV === "development") {
//   startContentWatcher();
// }
```

**Add caching layer:**

```typescript
// @repo/challenge-runner/src/contentCache.ts
export class ContentCache {
  private cache = new Map<string, CacheEntry>();
  private ttlMs = 5 * 60 * 1000; // 5 min TTL
  
  get(key: string): ChallengeRegistry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: ChallengeRegistry): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

export const contentCache = new ContentCache();
```

**Benefits:**
- ✅ Zero manual seeding in development
- ✅ Changes to `challenge.json` auto-propagate in <1s
- ✅ Production still uses explicit versioning
- ✅ Reduced database queries via caching

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Add `ChallengeRegistry` interface to `@repo/types`
2. Extend Prisma schema with `ChallengeVersion` table
3. Migrate `db:seed` to create version rows
4. Update `challengeService.ts` to read from DB

### Phase 2: Consolidation (Week 2)
1. Create `StepContentManager` in `@repo/challenge-runner`
2. Refactor CLI to use manager
3. Refactor API to use manager
4. Add comprehensive tests

### Phase 3: Extensibility (Week 3)
1. Build `TesterRegistry` system
2. Refactor CLI test command to use registry
3. Document how to add new tester
4. Create `RustTester` as example

### Phase 4: Developer Experience (Week 4)
1. Create `@repo/quest-generator` package
2. Build CLI scaffolding tool
3. Add watcher for dev auto-sync
4. Update documentation

---

## 🚨 Quick Wins (Do First)

If full refactor is too large, start with these:

### 1. Extract `StepContentManager` (1 day)
Move all step loading logic into a single class. Reduces duplication immediately.

### 2. Add `ChallengeRegistry` Version Table (2 days)
Keeps challenge history. No rush to migrate all code, but new challenges use versioning.

### 3. Create Quest Scaffold Tool (1 day)
Use template files in a `packages/quest-scaffolder` directory.

### 4. Document the "Adding a New Quest" SOP (1 day)
Right now, developers reverse-engineer from existing quests. A clear guide prevents mistakes.

---

## 🎯 End State: What You Want

```typescript
// ✅ ALL code reads from ONE place
const registry = await challengeRegistry.get("node-crud");
const step = await stepContentManager.load(registry, "01-setup");

// ✅ Adding new challenge type is JUST:
testerRegistry.register(new RustTester());

// ✅ Adding new quest is JUST:
pnpm create-quest && answer prompts && pnpm db:seed

// ✅ Versioning and rollback is built-in
const v1 = await challengeRegistry.getVersion("node-crud", "1.0.0");
const v2 = await challengeRegistry.getVersion("node-crud", "1.1.0");

// ✅ No sync issues between CLI/API/Runner
// They all read the same database snapshot
```

---

## Summary of Benefits

| Problem | Current State | After Changes |
|---------|---------------|----------------|
| **Add new step** | Edit JSON → re-seed → restart | Edit JSON → auto-sync in <1s |
| **Add new challenge type** | Edit core CLI code | Register tester in registry |
| **Sync issues** | API ≠ CLI ≠ Runner | All read DB (SoT) |
| **Versioning** | Not present | Built-in with ChallengeVersion |
| **Content fields** | Scattered in 5 places | Unified StepContentManager |
| **Scaling to 100 quests** | High manual burden | Mostly automated + scaffolded |

---

## Questions to Consider

1. **Should content (`.md` files) move into DB?** 
   - Pro: True single source of truth
   - Con: Harder for git diffs, harder for local editing
   - **Recommendation:** Keep files, but DB stores metadata + relative paths

2. **Should `test-runner` output be schema-enforced?**
   - Currently loose JSON blobs in attempts table
   - Could enforce: `{ passed: 3, failed: 1, duration: 245, results: [{name, status, duration}] }`
   - **Recommendation:** Yes, add `@repo/test-result-schema` package

3. **How to handle "interactive lessons"?**
   - Currently hardcoded imports in `@repo/lesson-content`
   - Should be: DB field `interactiveLessonId` → dynamic import or API endpoint
   - **Recommendation:** Create `lessonRegistry` similar to `challengeRegistry`

4. **When to version challenges?**
   - Every edit? Only breaking changes?
   - **Recommendation:** Explicit versioning (developer chooses), SemVer in `challenge.json`

---

**This review provides a clear path to a 10x more scalable architecture. Start with Phase 1 this week!**
