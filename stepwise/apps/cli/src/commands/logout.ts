import pc from "picocolors";
import { clearCredentials, getStoredCredentials } from "../credentials";

const email = getStoredCredentials()?.email ?? "unknown";
clearCredentials();
console.log(`\n${pc.bold(pc.green("✓ Logged out"))} (was ${pc.cyan(email)})\n`);
