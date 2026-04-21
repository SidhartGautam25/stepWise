# Challenge Creation Playbook

Welcome to the StepWise Content Team! Designing beautifully formatted, technically robust curriculum challenges is the core of our educational engine!

## 1. The Filesystem Map
Every new challenge lives in its own isolated directory inside the root `challenges/` folder (e.g. `challenges/python-data-science/`).

The directory strictly maps exactly to this fundamental blueprint:
```text
challenges/<challenge-id>/
├── challenge.json           # The Master Manifest (Config + Metadata)
└── steps/
    ├── 00-primer/           # Textual Reading material
    │   ├── prompt.md        # Top-level short UI description 
    │   └── explanation.md   # The detailed deep dive concepts 
    └── 01-write-a-loop/
        ├── prompt.md
        ├── workspace/
        │   └── starter/     # Files provisioned directly to student
        │       └── script.py 
        └── tests/
            ├── visible.test.js  # Sandbox runner logic!
            └── hidden.test.js   # Anti-cheat hidden tests
```

---

## 2. Writing `challenge.json` (The Master Config)
The entire system depends linearly on this file. 
- You specify `id`, `title`, and `language` (e.g. `python`, `javascript`).
- `type`: Define `"function"` (standard module export testing) or `"server"` (spins up a web server and probes API endpoints).
- `steps`: An intricately ordered Array routing the student perfectly sequentially through the process! You explicitly point `workspace.starter` to subdirectories so the CLI knows what folders to copy into the student's local laptop during `stepwise init`.

---

## 3. Designing Educational Analogies (`explanation.md`)
Because StepWise specializes in zero-setup accessibility, we heavily rely on real-world analogies to simplify complex technical topics.
Do not write boring MDN-style technical references. Write beautiful, engaging analogies using standard Markdown formatting. Keep it conversational! (e.g., using "The Restaurant Kitchen" analog).

---

## 4. Writing Tests (The Integration Layer)
When a student types `stepwise test`, the StepWise `cli` spawns `@repo/challenge-runner`, which seamlessly targets your `tests/visible.test.js`.

**Test Returns:**
You must natively export an Async execution loop returning an array of strict Objects:
```javascript
module.exports = async function runTests() {
  // Execute student logic
  return [
    { name: 'Check Loop Logic', status: 'pass', duration: 12 },
    { name: 'Memory limit', status: 'fail', error: 'Overflow!', duration: 900 }
  ]
}
```
The CLI automatically intercepts that Array, parses it spectacularly into the terminal UI, and blindly forwards the payload straight up to `apps/api` to mark the step completed in Postgres!

---

## 5. Integrating with the Monorepo Database Loop
Once your `challenge/<id>` folder is perfectly curated locally on your disk, the StepWise Web Dashboard won't magically know it exists.
You have to manually seed it into the database!

Simply drop down into the central monorepo root and execute:

```bash
pnpm turbo run db:seed --filter @repo/db
# OR
cd packages/db && pnpm run db:seed
```

### What actually happens? 
The `@repo/db` package natively scans over your customized `challenges/` folder, dynamically injects your JSON manifest into raw Neon Postgres tables, and globally syncs the timeline! 
The Web Dashboard (`apps/web`) seamlessly reads from that database immediately and paints the curriculum pipeline dynamically!
