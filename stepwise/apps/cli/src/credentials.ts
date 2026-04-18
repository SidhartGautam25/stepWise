/**
 * Credential storage for the StepWise CLI.
 *
 * Stores JWT + user info in ~/.config/stepwise/credentials.json
 * (XDG-compliant, same pattern used by GitHub CLI, Vercel CLI).
 *
 * Never stores the raw OTP code or any password — only the JWT.
 */

import fs from "fs";
import path from "path";
import os from "os";
import type { StoredCredentials } from "@repo/auth";

const CONFIG_DIR = path.resolve(os.homedir(), ".config", "stepwise");
const CREDENTIALS_FILE = path.resolve(CONFIG_DIR, "credentials.json");

export function getStoredCredentials(): StoredCredentials | undefined {
  if (!fs.existsSync(CREDENTIALS_FILE)) return undefined;

  try {
    const raw = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8")) as unknown;

    if (
      typeof raw === "object" &&
      raw !== null &&
      "token" in raw &&
      typeof (raw as Record<string, unknown>).token === "string"
    ) {
      return raw as StoredCredentials;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function storeCredentials(creds: StoredCredentials): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), {
    encoding: "utf-8",
    mode: 0o600, // owner-only read/write (like SSH keys)
  });
}

export function clearCredentials(): void {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
}

/**
 * Returns the Bearer token for API requests.
 * Throws if not logged in, with a clear message pointing to `stepwise login`.
 */
export function requireCredentials(): StoredCredentials {
  const creds = getStoredCredentials();

  if (!creds) {
    throw new Error(
      "Not logged in. Run `stepwise login` first.",
    );
  }

  // Warn if the token expires in < 24 hours (but don't block — let the API 401 do that)
  const expiresAt = new Date(creds.expiresAt).getTime();
  const hoursLeft = (expiresAt - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    throw new Error(
      "Your session has expired. Run `stepwise login` to get a new one.",
    );
  }

  if (hoursLeft < 24) {
    process.stderr.write(
      `\n⚠ Your StepWise session expires in ${Math.ceil(hoursLeft)}h. Run stepwise login to refresh it.\n\n`,
    );
  }

  return creds;
}

export { type StoredCredentials };
