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

StepWise uses a **compile-to-native-binary** CLI pipeline. For end-to-end testing, prefer the installed `stepwise` binary over running `node dist/index.js`, because that matches what students run on their machines.

### CLI Command Flow

From the repository root:

```bash
# Transpile apps/cli/src into apps/cli/dist/index.js
pnpm --filter cli run build

# Clean old binaries, rebuild dist, package native binaries, and create stepwise-* release names
pnpm --filter cli run compile

# Replace any old local install with the current OS binary as the `stepwise` command
pnpm --filter cli run install:local
```

`compile` already runs `build`, so for normal CLI changes you can usually run only:

```bash
pnpm --filter cli run compile
pnpm --filter cli run install:local
```

The generated release binaries live in `apps/cli/binaries/`:

```text
stepwise-linux-x64
stepwise-linux-arm64
stepwise-macos-x64
stepwise-macos-arm64
stepwise-win-x64.exe
```

The raw `cli-*` files may also be present because `pkg` names outputs from the package name. The `stepwise-*` files are the canonical binaries used by the web download/install flow.

`compile` starts by deleting `apps/cli/binaries/`, so stale binaries from older builds do not hang around. `install:local` also replaces the previous local `stepwise` executable before installing the new one.

### Local Install by OS

`pnpm --filter cli run install:local` installs the binary for the OS you are currently using.

You can run the local installer repeatedly. It removes the old executable/shim first, then installs the current binary, so multiple installs should not leave conflicting versions behind.

Windows:

```powershell
pnpm --filter cli run compile
pnpm --filter cli run install:local
stepwise --help
```

The Windows local installer copies the binary to:

```text
%LOCALAPPDATA%\StepWise\stepwise.exe
```

It also creates a command shim at:

```text
%APPDATA%\npm\stepwise.cmd
```

If PowerShell still cannot find `stepwise`, open a new terminal and run:

```powershell
Get-Command stepwise
```

macOS and Linux:

```bash
pnpm --filter cli run compile
pnpm --filter cli run install:local
stepwise --help
```

The macOS/Linux local installer copies the binary to:

```text
~/.local/bin/stepwise
```

If your current shell cannot find `stepwise`, either open a new terminal or run:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

You can override the install directory on macOS/Linux:

```bash
STEPWISE_INSTALL_DIR="$HOME/bin" pnpm --filter cli run install:local
```

### Testing the Web Installer Flow

Because binaries are intentionally excluded from Git, compile them before testing the web download installer:

```bash
pnpm --filter cli run compile
pnpm turbo run dev
```

Then move outside the monorepo to simulate a student workspace:

```bash
cd ~
mkdir stepwise-cli-test
cd stepwise-cli-test
```

Install from the local web app.

The web installers are also idempotent. If a developer or real user runs the installer twice, the script downloads the new binary to a temporary file, deletes the old `stepwise` executable, and then moves the fresh binary into place.

macOS/Linux:

```bash
curl -fsSL http://localhost:3000/api/cli/install/linux | bash
stepwise --help
```

Windows PowerShell:

```powershell
iwr http://localhost:3000/api/cli/install/windows -useb | iex
stepwise --help
```

### Point the CLI at the Local API

Before using the CLI against your local backend, set `STEPWISE_API_URL` to the local API.

You can also pass the local API explicitly on a single command:

```bash
stepwise login --api http://127.0.0.1:4000
```

macOS/Linux:

```bash
export STEPWISE_API_URL=http://127.0.0.1:4000
stepwise login
stepwise init node-crud
cd node-crud
stepwise test
```

Windows PowerShell:

```powershell
$env:STEPWISE_API_URL="http://127.0.0.1:4000"
stepwise login
stepwise init node-crud
cd node-crud
stepwise test
```

Whenever you change files under `apps/cli/src`, rerun:

```bash
pnpm --filter cli run compile
pnpm --filter cli run install:local
```

## Summary
You just successfully `git clone`'d the monolithic Architecture, booted up the Turborepo instances, compiled the Typescript natively into an executable, curled that executable out of your local Next.js Web App seamlessly, securely authenticated, and triggered a native runner process securely outside the repository! Happy coding!
