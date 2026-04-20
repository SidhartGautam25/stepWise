# StepWise 🚀

**StepWise** is a local-first, interactive learning platform designed to teach software engineering through practical project building. Rather than solving isolated algorithm puzzles in a constrained browser window, StepWise guides you through building fully-functional, real-world applications directly in your own IDE.

## 🌟 How StepWise is Different

- **Your Tools, Your Environment:** Unlike LeetCode or Codecademy where you type into a restricted web-browser sandbox, StepWise operates entirely over a powerful CLI. You use your own version of VS Code, your own extensions, and your own terminal setup.
- **Project-Based Learning:** You don't build generic algorithmic functions like "Reverse a Linked List." You build real-world systems (like a complete vanilla Node.js REST API or a robust backend).
- **Instant Local Feedback:** The `stepwise` CLI continuously runs comprehensive test suites—ranging from syntax validation to end-to-end integration tests—against your local repository, giving you immediate feedback on what's missing at each iterative step of learning.
- **Concept Deep Dives:** For every single step of a project you encounter, the Web Dashboard unlocks theoretical guides explaining the *“Why this matters”*, teaching you standard engineering practices under the hood.

---

## 🛠️ Clone the Repository

If you are just getting started, grab the robust monorepo:

```bash
git clone https://github.com/SidharthGautam25/stepWise.git
cd stepWise
```

---

## 💻 Developer Setup (Contributing)

StepWise is built as a **Turborepo** full-stack typescript application. It consists of a Fastify backend API (`apps/api`), a Next.js web application (`apps/web`), and the NodeJS command-line tool (`apps/cli`).

### 1. Installation
Navigate into the core application folder and install dependencies:
```bash
cd stepwise
pnpm install
```

### 2. Environment Variables
You will need a PostgreSQL database (e.g., [Neon DB](https://neon.tech/)). Create a `.env` file inside the root of the `stepwise` monorepo based on `.env.example`:

```env
DATABASE_URL="postgres://<user>:<password>@<host>/stepwise?sslmode=require&connect_timeout=20"
NEXT_PUBLIC_API_URL="http://127.0.0.1:4000"
JWT_SECRET="super-secret-local-dev-key"
```

### 3. Setup the Database
Sync your Prisma schema with your local/remote Postgres instance and seed the initial interactive challenges:
```bash
pnpm --filter @repo/db db:push --accept-data-loss
pnpm --filter @repo/db db:seed
```

### 4. Start the Environment
Boot up the complete backend, frontend, and worker infrastructure concurrently:
```bash
pnpm dev
```
- **Web Dashboard:** `http://localhost:3000`
- **Fastify API:** `http://localhost:4000`

---

## 🧑‍🎓 Real User Guide (Student Workflow)

When StepWise is deployed to NPM, students use it by simply pulling challenges and proving their solutions.

1. **Authentication:**
   A student registers an account on the Web application, and then runs local authentication via the terminal:
   ```bash
   stepwise login
   ```
   *This securely prompts for email & password and stores a persistent JWT token via `~/.config/stepwise/credentials.json`.*

2. **Testing Your Code:**
   While editing files for an active StepWise project locally (e.g., writing API routes inside `01-setup/`), the user simply types:
   ```bash
   stepwise test
   ```
   The CLI parses their solution against the specific stage requirement, streams the test outputs securely, and tracks their successful achievements centrally on the Web Dashboard!

---

## 🧪 Testing the CLI Locally (Dev as a Student)

If you are actively developing StepWise and want to simulate being a "Student" locally without deploying the CLI:

1. **Create an Account:** 
   While `pnpm dev` is running, open `http://localhost:3000/register` and sign up for a local account. Ensure the dashboard renders.

2. **Create a Test Workspace:** 
   Navigate into the parent workspace and create an empty project folder acting as your homework sandbox.
   ```bash
   cd ..
   mkdir -p tmp/my-challenge
   cd tmp/my-challenge
   ```

3. **Log In Temporarily via Development CLI:**
   You can trigger your local, uncompiled version of the CLI directly to authenticate your testing shell:
   ```bash
   # Make sure your StepWise CLI is globally linked during local testing
   stepwise login
   ```

4. **Verify the Challenge Engine:**
   Inside your workspace, try executing test suites against your local challenge implementations relying on the data you recently seeded into the database!
