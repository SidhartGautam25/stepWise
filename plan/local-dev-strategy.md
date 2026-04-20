# Architectural Comparison: Bring Your Own Binary (BYOB) vs WASI

Because you are building a platform that teaches **Backend Architecture** (HTTP servers, database connections, pure socket streaming), we must evaluate the execution environments against real-world networking capabilities. 

Both of these options are **100% Free** and completely open-source.

---

## 1. WebAssembly Integration (WASI)
WASI allows you to embed a tiny WebAssembly engine inside your CLI. Instead of downloading Python normally, the CLI boots up a WASM-compiled version of Python.

- **Cost:** Free.
- **Pros:** Massively secure. Very fast to boot. Incredibly lightweight (a WASM engine is ~5MB total).
- **Cons (The Dealbreaker):** WASM is primarily designed for pure CPU calculation. **WASI does not natively support robust TCP/HTTP Networking or complex File Systems yet.** If a user writes a Node.js script using the native `http` and `fs` modules (like the Node CRUD app we just built), the WASM sandbox will crash because it doesn't have access to the operating system's network adapter. 
- **Languages Supported:** JS/Python/Rust work decently for *logic*. Java and Go are extremely experimental. 

## 2. Bring Your Own Binary (BYOB) - The "Installer" Approach
This approach turns the `stepwise` CLI into a silent package manager. The first time a user tries a Python challenge, `stepwise` fetches the official Python executable from `python.org` and caches it silently in a hidden folder on their machine.

- **Cost:** Free (You simply ping official download endpoints like `nodejs.org` or `golang.org`).
- **Ease of Use:** 100% Invisible to the user. They just type `stepwise test`. If they don't have the language, it says *"Downloading Node.js v20..."* and 8 seconds later, the test runs.
- **Pros:** 
  - **Full Native Power**: The code runs directly on the OS. They can boot HTTP servers, write to databases, and manipulate real files exactly as they would in production.
  - **Identical Fidelity**: The tests run exactly how they will run on AWS or Vercel.
- **Cons:** You have to write logic inside the CLI to download `.tar.gz` and `.zip` files based on the user's OS architecture (Mac M1 vs Windows x64 vs Linux).

---

## Verdict: The BYOB Path
Because StepWise challenges explicitly require building robust **Backend Servers** (running on ports, connecting to networks), **WASI is intrinsically incapable of supporting your platform right now.**

We must pursue **Bring Your Own Binary (BYOB)**. 

### How to Engineer it for Massive Scale (Reusability):
To prevent coding a new downloader from scratch for every challenge, we will build a modular `RuntimeManager` inside the `@repo/challenge-runner`.

1. We define a JSON dictionary of official mirrors:
```json
{
  "node": {
    "v20": "https://nodejs.org/dist/v20.11.1/node-v20.11.1-{OS}-{ARCH}.tar.gz"
  },
  "go": {
    "1.22": "https://go.dev/dl/go1.22.1.{OS}-{ARCH}.tar.gz"
  }
}
```
2. When `@repo/tester-server` attempts to run a test, it dynamically checks the `challenge.json` language parameter.
3. It asks the `RuntimeManager` for the path to the executable. 
4. If missing, the `RuntimeManager` downloads the generic `.tar.gz` payload, extracts it into `~/.config/stepwise/runtimes/`, and caches it permanently map.

This guarantees you only write the "Download and Extract" generic utility ONCE. Every new language just requires adding a single URL mapping string to the dictionary!
