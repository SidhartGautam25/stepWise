#!/usr/bin/env node

/**
 * StepWise CLI entry point.
 *
 * Command dispatch:
 *   stepwise init <challenge-id> [options]  → provision a local workspace
 *   stepwise test [options]                 → run tests and submit result
 */

// Find the command by scanning argv for a known command word after index 1.
// This is robust across: `node index.js test`, `tsx src/index.ts test`, compiled binaries.
const KNOWN_COMMANDS = ["init", "test", "login", "logout", "whoami", "--help", "-h"];
const commandIndex = process.argv.findIndex((arg, i) => i >= 2 && KNOWN_COMMANDS.includes(arg));
const command = commandIndex >= 2 ? process.argv[commandIndex] : undefined;

// Store the index so subcommands can slice correctly to get their own flags
(process as any).__stepwiseCommandIndex = commandIndex;

if (!command || command === "--help" || command === "-h") {
  console.log(`
StepWise CLI

Usage:
  stepwise <command> [options]

Commands:
  login                 Sign in with your email (OTP-based)
  logout                Sign out and clear your local session
  whoami                Show current logged-in user
  init <challenge-id>   Set up a local workspace for a challenge step
  test                  Run tests for your current step and submit the result

Run "stepwise <command> --help" for command-specific options.
`.trim());
  process.exit(0);
}

if (command === "init") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./commands/init");
} else if (command === "test") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./commands/test");
} else if (command === "login") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./commands/login");
} else if (command === "logout") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./commands/logout");
} else if (command === "whoami") {
  const { getStoredCredentials } = require("./credentials") as typeof import("./credentials");
  const pc = require("picocolors") as typeof import("picocolors");
  const creds = getStoredCredentials();
  if (!creds) {
    console.log(pc.yellow("\nNot logged in. Run `stepwise login` first.\n"));
  } else {
    const exp = new Date(creds.expiresAt);
    console.log(`\n${pc.bold("Logged in as:")} ${pc.cyan(creds.email)}`);
    if (creds.username) console.log(`${pc.bold("Username:")}    ${creds.username}`);
    console.log(`${pc.bold("User ID:")}     ${creds.userId}`);
    console.log(`${pc.bold("Expires:")}     ${exp.toLocaleString()}\n`);
  }
} else {
  console.error(
    `Unknown command "${command}". Run "stepwise --help" for available commands.`,
  );
  process.exit(1);
}

