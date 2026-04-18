/**
 * stepwise login
 *
 * Interactive email + OTP login flow:
 *   1. Prompt for email (or take --email flag)
 *   2. POST /auth/login/request → server sends OTP (printed to console in dev)
 *   3. Prompt for OTP code (or auto-filled from response in dev mode)
 *   4. POST /auth/login/verify → receive JWT
 *   5. Write JWT to ~/.config/stepwise/credentials.json
 *
 * Also supports:
 *   --dev   Skip OTP, issue token immediately (dev only, fails in prod)
 */

import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import pc from "picocolors";
import { storeCredentials } from "../credentials";
import { decodeToken } from "@repo/auth";

interface LoginConfig {
  email?: string;
  devMode: boolean;
  apiBaseUrl: string;
  helpRequested: boolean;
}

const HELP = `
Usage:
  stepwise login [options]

Options:
  --email <email>   Your email address (prompted if not provided)
  --api <url>       API base URL (default: http://127.0.0.1:4000)
  --dev             Skip OTP and get a token immediately (dev mode only)
  --help            Show this help
`.trim();

function parseArgs(): LoginConfig {
  const argv = process.argv.slice(
    ((process as unknown as Record<string, number>).__stepwiseCommandIndex ?? 2) + 1,
  );

  const parsed: Record<string, string> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help") return { devMode: false, apiBaseUrl: "", helpRequested: true };
    if (arg === "--dev") { parsed.dev = "true"; continue; }
    if (arg?.startsWith("--")) {
      const key = arg.slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith("--")) throw new Error(`Missing value for "${arg}"`);
      parsed[key] = val;
      i++;
    }
  }

  return {
    email: parsed.email,
    devMode: parsed.dev === "true",
    apiBaseUrl: parsed.api ?? "http://127.0.0.1:4000",
    helpRequested: false,
  };
}

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  const answer = await rl.question(question);
  return answer.trim();
}

async function main() {
  let config: LoginConfig;

  try {
    config = parseArgs();
  } catch (err) {
    console.error(pc.red(`\n✗ ${err instanceof Error ? err.message : String(err)}\n`));
    process.exit(1);
  }

  if (config.helpRequested) {
    console.log(HELP);
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const email =
      config.email ??
      (await prompt(rl, pc.bold("Email: ")));

    if (!email || !email.includes("@")) {
      console.error(pc.red("\n✗ A valid email is required\n"));
      process.exit(1);
    }

    // ── Dev mode: skip OTP ─────────────────────────────────────────────────
    if (config.devMode) {
      console.log(pc.dim("\n  Requesting dev token (no OTP required)..."));

      const res = await fetch(`${config.apiBaseUrl}/auth/login/dev`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        console.error(pc.red(`\n✗ ${String(data.error ?? "Dev login failed")}\n`));
        process.exit(1);
      }

      saveAndPrint(data, email);
      return;
    }

    // ── Step 1: Request OTP ────────────────────────────────────────────────
    console.log(pc.dim(`\n  Sending code to ${email}...`));

    const requestRes = await fetch(`${config.apiBaseUrl}/auth/login/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const requestData = (await requestRes.json()) as Record<string, unknown>;

    if (!requestRes.ok) {
      console.error(pc.red(`\n✗ ${String(requestData.error ?? "Failed to send code")}\n`));
      process.exit(1);
    }

    // In dev mode the server returns the code in the response
    const devCode = typeof requestData.devCode === "string" ? requestData.devCode : null;

    if (devCode) {
      console.log(pc.yellow(`\n  [DEV] Your code: ${pc.bold(devCode)}\n`));
    } else {
      console.log(pc.dim(`\n  Code sent! Check your email. It expires in 10 minutes.\n`));
    }

    // ── Step 2: Verify OTP ─────────────────────────────────────────────────
    const code =
      devCode ??
      (await prompt(rl, pc.bold("Enter 6-digit code: ")));

    const verifyRes = await fetch(`${config.apiBaseUrl}/auth/login/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const verifyData = (await verifyRes.json()) as Record<string, unknown>;

    if (!verifyRes.ok) {
      console.error(pc.red(`\n✗ ${String(verifyData.error ?? "Verification failed")}\n`));
      process.exit(1);
    }

    saveAndPrint(verifyData, email);
  } finally {
    rl.close();
  }
}

function saveAndPrint(data: Record<string, unknown>, email: string) {
  const token = data.token as string;
  const decoded = decodeToken(token);
  const expiresAt =
    typeof decoded.exp === "number"
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  storeCredentials({
    token,
    email: (data.email as string | undefined) ?? email,
    userId: data.userId as string,
    username: (data.username as string | undefined) ?? undefined,
    expiresAt,
  });

  console.log(`\n${pc.bold(pc.green("✓ Logged in"))} as ${pc.cyan(email)}`);
  console.log(pc.dim(`  Session expires: ${new Date(expiresAt).toLocaleString()}`));
  console.log(pc.dim(`  Token stored in ~/.config/stepwise/credentials.json\n`));
}

main().catch((err) => {
  console.error(pc.red(`\n✗ Unexpected error: ${err instanceof Error ? err.message : String(err)}\n`));
  process.exit(1);
});
