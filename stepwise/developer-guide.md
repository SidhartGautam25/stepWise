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

### Step 1: Build & Compile the Local Binaries
Since raw executable binaries are massive, they are intentionally **excluded** from Git. Before a student can install the CLI locally, you must natively compile it so your local Web App has files to serve them!

Open a **new terminal tab**:
```bash
# 1. First, transpile the Typescript into Javascript (dist/index.js)
pnpm --filter cli run build

# 2. Wrap the Javascript into Native OS Executables (Windows, Mac, Linux)
pnpm --filter cli run compile
```
*Note: This utilizes `tsup` and Vercel `pkg`. It will successfully generate raw `stepwise-linux-x64`, `stepwise-win-x64.exe`, and `stepwise-macos-x64` binaries inside the `apps/cli/binaries/` folder.*

> [!WARNING]
> If you make any code changes to the Typescript files inside `apps/cli/src`, you **must routinely rerun both** the `build` AND `compile` commands above to generate a newly updated executable file!

### Step 2: Test as a Real Student
Since you have successfully generated the local binaries, you can now test the student installation flow! 

Navigate anywhere on your physically machine **outside** of the StepWise monolithic repository (e.g. your Desktop) to accurately simulate a student's machine:
```bash
cd ~/Desktop
mkdir my-dummy-student-folder
cd my-dummy-student-folder
```

**Install the CLI connecting to your Localhost:**
If you are on Linux / Mac:
```bash
curl -fsSL http://localhost:3000/api/cli/install/linux | bash
```

If you are on Windows (PowerShell):
```powershell
iwr http://localhost:3000/api/cli/install/windows -useb | iex
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
