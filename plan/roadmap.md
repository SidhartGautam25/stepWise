# StepWise Product Roadmap

## Product Direction

StepWise is a guided coding practice platform for college students.

It supports two execution modes:

1. Local mode
   Students run each challenge step on their own machine through a CLI or editor integration.
   The local runner executes tests, sends structured results to the server, and the server decides whether to unlock the next step.

2. Server mode
   Students push code to GitHub or submit code to the platform.
   The platform fetches the code, runs it in an isolated server-side environment, stores the result, and decides progression.

The first version should optimize for simple backend and JavaScript systems challenges such as:

- build a REST API
- build a Promise implementation
- build streams
- build a tiny Express-like framework

## What Is Already Done

The repo already has the beginnings of the execution core:

- monorepo setup with `apps/*` and `packages/*`
- `@repo/challenge-runner` package with basic challenge orchestration
- `@repo/tester-node` package with sandboxed child-process execution
- a sample challenge at `challenges/promise-basic`
- a tiny challenge SDK with `test`, `assert`, and `getTests`
- a CLI command that can trigger a local challenge run
- a minimal Fastify API app with a health route

## What Is Partially Done

- `challenge-runner` has both an older per-test interface and a newer bulk `runAllTests` path
- sandboxing exists, but it is process-level only and not yet a hardened isolation layer
- test loading works for one JS challenge layout, but challenge metadata and versioning do not exist yet

## What Is Still Missing

### Core platform

- challenge definition model
- step unlocking and progression rules
- result persistence
- authentication and student identity
- challenge authoring workflow

### Local execution mode

- CLI authentication
- secure result upload to API
- local run attempt lifecycle
- retries, offline handling, and resumability
- editor integration or better CLI UX

### Server execution mode

- GitHub repo linking
- webhook ingestion
- job queue and worker orchestration
- containerized execution
- server-side artifact storage
- execution logs and replay

### Reliability and security

- stronger sandboxing
- resource limits for CPU, memory, disk, and network
- deterministic test protocol
- hidden tests support
- anti-cheat and tamper detection

### Product and scale

- challenge catalog and discovery
- analytics on student progress
- admin tooling for challenge authors
- observability, tracing, and audit trails

## Gaps In The Current Architecture

1. The current `Tester` interface and the `runAllTests` shortcut are pulling in two different directions.
   We should settle on one execution contract so challenge-runner stays clean.

2. The current challenge format is code-first but not metadata-first.
   We need explicit challenge manifests for title, slug, language, step order, visible tests, hidden tests, timeouts, and progression rules.

3. Local execution is not yet trusted by the server.
   If local runs decide progression, the server needs signed attempts, replayable evidence, and challenge-version-aware validation.

4. Server execution is not designed yet beyond placeholders.
   Worker, queue, GitHub ingestion, and container lifecycle still need first-class design.

5. Persistence does not exist.
   Without a DB schema for attempts, challenge steps, submissions, and results, the rest of the platform cannot mature.

## Architecture Improvements For Scalability

### 1. Standardize around an execution protocol

Define a single execution contract:

- `challenge-runner` should orchestrate
- `tester` should adapt to a language/runtime
- `sandbox` should isolate
- challenge files should define tests and metadata only

Recommended result contract:

- attempt id
- challenge id and version
- step id
- execution mode (`local` or `server`)
- per-test result
- logs
- timings
- resource usage
- final verdict

### 2. Add challenge manifests

Each challenge should have a manifest, for example:

- `challenge.json`
- supported language/runtime
- ordered steps
- starter files
- visible and hidden tests
- timeout and memory budget
- pass criteria
- scoring or partial completion rules

This makes the platform versionable and easier to scale across many challenges.

### 3. Separate execution artifacts from challenge definitions

Recommended structure:

```text
challenges/
  promise-basic/
    challenge.json
    steps/
      01-return-42/
        prompt.md
        starter/
        tests/
      02-then-chain/
        prompt.md
        starter/
        tests/

packages/
  challenge-runner/
  challenge-sdk/
  testers/
    tester-node/
    tester-go/
  execution-protocol/
  validators/
  types/
  db/
```

### 4. Design the worker system early

For server mode:

- API receives webhook or submission
- API creates execution job
- queue dispatches to worker
- worker provisions sandbox/container
- runner executes challenge
- results are stored and streamed back

This should be event-driven from the beginning, even if the first version uses a single worker.

### 5. Treat observability as a core feature

Store and expose:

- stdout/stderr
- structured test events
- sandbox exit reason
- timeout reason
- challenge version
- runner version
- execution duration by phase

This will matter for debugging student submissions and platform reliability.

## Performance And Reliability Additions To The Plan

- prebuild challenge test bundles so each run does less work
- cache challenge metadata and immutable assets
- reuse warm worker images for common runtimes
- keep challenge manifests versioned and content-addressed
- separate visible-test feedback from hidden-test verification
- add rate limits and concurrency caps per user and per challenge
- use append-only attempt logs for auditability
- make result ingestion idempotent
- store runner and challenge version on every attempt
- support dead-letter queues for failed server runs

## Suggested Data Model

At minimum, add these entities:

- `User`
- `Challenge`
- `ChallengeVersion`
- `ChallengeStep`
- `Enrollment` or `UserChallengeState`
- `Attempt`
- `AttemptTestResult`
- `Submission`
- `RepositoryConnection`
- `ExecutionJob`

## Phased Build Order

### Phase 1: solid local runner foundation

- finalize challenge manifest format
- clean up `challenge-runner` interface
- make Node tester return structured per-test results with durations and errors
- support step-based challenges, not only a single file challenge
- add hidden tests and visible tests separation
- add stable CLI input/output contract

### Phase 2: API and persistence

- add database package and schema
- model users, challenges, steps, attempts, and progression
- add auth
- add API endpoints for challenge catalog, start attempt, submit local result, and fetch next step
- validate local attempt payloads against challenge version

### Phase 3: trustworthy local mode

- CLI login and token handling
- signed attempt sessions from server
- upload structured result bundles
- verify that results belong to an issued attempt
- support retries and resuming interrupted runs

### Phase 4: server execution mode

- GitHub app or OAuth repo connection
- webhook receiver for push events
- BullMQ queue and worker app
- containerized execution for each job
- log capture and stored execution artifacts

### Phase 5: student experience

- real web dashboard instead of starter page
- challenge browser and progress UI
- per-step instructions and feedback
- attempt history and execution logs

### Phase 6: scale and authoring

- challenge author tooling
- challenge versioning and publishing workflow
- multiple runtime support
- analytics and observability dashboards
- queue autoscaling and execution cost controls

## Immediate Next Engineering Priorities

1. Replace the starter README and starter web page with StepWise-specific docs and product framing.
2. Formalize a challenge manifest and step directory format.
3. Refactor `challenge-runner` so there is one clear execution interface instead of mixed legacy and bulk modes.
4. Define the result payload schema used by CLI, API, and worker.
5. Add a database package and persistence model for attempts and progression.
6. Implement local-mode API flow before starting GitHub/server mode.
7. After local mode is stable, add queue-backed server execution.

## Decision Principles

- prioritize one runtime and one challenge family first
- keep challenge definitions declarative
- keep execution protocol versioned
- never let local execution be the only source of truth without server-issued attempt tracking
- make every execution replayable enough to debug
- optimize for clarity and deterministic behavior before adding more challenge types
