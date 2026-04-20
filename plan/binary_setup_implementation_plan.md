# BYOB RuntimeManager Architecture

This plan establishes a fully isolated "Bring Your Own Binary" testing paradigm entirely bypassing the user's local operating system.

## Proposed Changes

### `packages/challenge-runner/src/runtimeManager.ts`
#### [NEW] `runtimeManager.ts`
Build a highly scalable module that:
- Reads `os.platform()` and `os.arch()`.
- Maps generic requests (e.g. `installRuntime("node", "v20.12.0")`) to absolute download endpoints natively.
- Verifies if the executable already exists inside `~/.config/stepwise/runtimes/<lang>/`
- Utilizes purely native Node streams (`node:https` and `fs.createWriteStream`) to download compressed archives without introducing heavy NPM blob dependencies.
- Safely spawns extraction (`tar -xf` inherently bound in all modern OSs).
- Elegantly returns the absolute path mapping to the executable inside the unwrapped folder.

---
### Interfaces
#### [MODIFY] `packages/challenge-runner/src/types.ts`
- Inject `executablePath?: string` inside `RunChallengeInput`.
- Inject `executablePath?: string` inside `BulkRunInput`.

#### [MODIFY] `packages/challenge-runner/src/index.ts`
- Export `installRuntime` so the CLI can orchestrate downloads!

---
### CLI Orchestration
#### [MODIFY] `apps/cli/src/commands/test.ts`
- Immediately following `loadChallengeManifest()`, parse `manifest.runtime`.
- Emit a sleek loader `⧗ Isolating Environment (Node v20.12.0)...`
- Feed the request sequentially into `await installRuntime()`.
- Pass the natively resolved `executablePath` straight into `runChallenge({ executablePath, ... })`.

---
### Runtime Execution Isolation
#### [MODIFY] `packages/challenge-runner/src/runner.ts`
- Pass `input.executablePath` linearly downward into the tester's parameter blocks (`runAllTests`).

#### [MODIFY] `packages/tester/tester-server/src/index.ts`
- Accept `executablePath` functionally across `BulkRunInput`.
- Architecturally pivot the `spawnServer()` module from hardcoded `"node"` to gracefully consume `executablePath || "node"`.

## Open Questions

> [!CAUTION]
> **Performance Caveat:** Downloading a 40MB Node tarball natively takes ~5-15 seconds the very first time. We will cache it forever instantly afterwards. Is it acceptable to briefly pause the user with a download message during their very first run?

## Verification Plan
1. Completely uninstall Native Node from my PATH mentally (or spoof it).
2. Execute `npx stepwise test` upon `node-crud/01-setup`.
3. Verify the CLI physically requests the `.tar.gz` and writes to `~/.config/stepwise`!
4. Monitor the child process seamlessly routing exclusively through the sandbox runtime!
