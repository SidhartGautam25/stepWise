# StepWise Platform: Developer Guide 🚀

Welcome to the StepWise core platform! This guide covers exactly how to clone the repository, spin up the entire application architecture locally (Postgres, Web App, Cloud API), and test the Native CLI natively as if you were an end-user.

---

## 1. Environment Setup

### Clone the Repository
Pull the ecosystem down to your local machine:
```bash
git clone git@github.com:SidhartGautam25/stepWise.git
cd stepWise/stepwise
```

### Install Dependencies
Because we use **Turborepo** and **PNPM Workspace** features to string the cloud environment together (since we have multiple packages like web, api, cli, and db inside one repository), you must use `pnpm`. If you only have `npm` installed, install `pnpm` first:
```bash
# Install pnpm globally via npm
npm install -g pnpm

# This installs all packages across /apps and /packages simultaneously
pnpm install
```

---

## 2. Booting the Cloud Services

Before the API or the CLI works, we need to spin up the local development database and populate it with challenge definitions.

### Configure and Seed the Database
We use a Postgres database. Ensure you have your connection string ready or Docker running.
Before seeding or running the API, you MUST generate the Prisma Database client bindings!

```bash
# 1. Generate the Prisma Client code (IMPORTANT: Fixes "@prisma/client did not initialize" error)
pnpm --filter @repo/db db:generate

# 2. Start the local database and run the `db:seed` logic
pnpm --filter @repo/db db:seed
```
*Behind the scenes: This parses all `challenge.json` payloads inside `/packages/challenges` and securely injects them into Postgres.*

### Start to Develop!
Boot up the `api`, `web`, and `worker` node instances concurrently:
```bash
pnpm turbo run dev
```

You should now see:
- Web App running on: `http://localhost:3000`
- Developer API running on: `http://localhost:4000`

---

## 3. Developing and Testing the Native CLI

StepWise utilizes a **Compile-to-Native-Binary** pipeline. We NEVER execute raw Javascript (`node index.js`) when testing the CLI locally, because we want developers to rigorously experience exactly what the end-student experiences.

### Step 1: Compile the CLI
Whenever you alter code inside `apps/cli/src`, you must re-wrap the package into a native OS executable. Open a **new terminal tab**:
```bash
pnpm turbo run compile --filter cli
```
*Note: This utilizes Vercel `pkg` combined with `tsup`. It will generate massive `stepwise-linux`, `stepwise-win.exe`, and `stepwise-macos` binaries natively inside `apps/cli/binaries/`.*

### Step 2: Test as a Real User
Since we compiled the raw binaries, let's install them from our purely local Web server explicitly to ensure the system handles dynamic downloads gracefully. 

Navigate anywhere on your completely physical machine, outside of the monolithic repository!
```bash
cd ~/Desktop
mkdir my-dummy-student-folder
cd my-dummy-student-folder

# Explicitly download the Native Linux/Mac binary from YOUR LOCAL Turborepo Instance!
curl -fsSL http://localhost:3000/api/cli/install/linux | bash
```

### Step 3: Map the CLI to your Local API
Before interacting with the CLI, tell it to talk to `localhost:4000` instead of the production API.
```bash
export STEPWISE_API_URL=http://localhost:4000

# 1. Login the student natively
stepwise login

# 2. Download the 'node-crud' workspace from the API
stepwise init node-crud

# 3. Enter the challenge & Execute tests!
cd node-crud
stepwise test
```

## Summary
You just successfully `git clone`'d the monolithic Architecture, booted up the Turborepo instances, compiled the Typescript natively into an executable, curled that executable out of your local Next.js Web App seamlessly, securely authenticated, and triggered a native runner process securely outside the repository! Happy coding!
