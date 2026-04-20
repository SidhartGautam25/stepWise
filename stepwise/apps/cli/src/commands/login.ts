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

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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

async function promptPassword(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    let muted = false;

    // We hook the private internal writer
    (rl as any)._writeToOutput = function _writeToOutput(stringToWrite: string) {
      if (!muted) {
        // Just print normally if we aren't mutating keystrokes yet
        (rl as any).output.write(stringToWrite);
        return;
      }

      if (stringToWrite === "\r\n" || stringToWrite === "\n") {
        (rl as any).output.write(stringToWrite);
      } else if (stringToWrite !== "\x1B[2K\x1B[200D") { 
        // Mask with asterisk and prevent line clear
        (rl as any).output.write("*");
      }
    };

    // Ask the question — _writeToOutput will print it unmuted
    rl.question(question).then((answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
    
    // Now mute all subsequent keystrokes
    muted = true;
  });
}

export async function main() {
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
    
    // Close initial readline so we can cleanly open password prompt
    rl.close();

    const password = await promptPassword(pc.bold("Password: "));
    if (!password) {
      console.error(pc.red("\n✗ Password is required\n"));
      process.exit(1);
    }

    console.log(pc.dim(`\n  Authenticating ${email}...`));

    const verifyRes = await fetch(`${config.apiBaseUrl}/auth/login/password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const verifyData = (await verifyRes.json()) as Record<string, unknown>;

    if (!verifyRes.ok) {
      console.error(pc.red(`\n✗ ${String(verifyData.error ?? "Authentication failed")}\n`));
      process.exit(1);
    }

    saveAndPrint(verifyData, email);
  } finally {
    // Just in case
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


