import path from "path";
import pc from "picocolors";
import { ChallengeInfoResponse, ChallengeStepInfo } from "@repo/types";
import { ProvisionedWorkspace } from "./workspace";

/**
 * Renders the student-facing output after `stepwise init` completes.
 */
export function renderInitResult(
  challenge: ChallengeInfoResponse,
  provisioned: ProvisionedWorkspace,
  displayPrompt: boolean,
): string {
  const lines: string[] = [];
  const relativeStepDir = path.relative(process.cwd(), provisioned.stepDir);

  lines.push("");
  lines.push(pc.bold(pc.green("✓ Workspace ready")));
  lines.push("");
  lines.push(`  ${pc.bold("Challenge:")} ${challenge.title}`);
  lines.push(`  ${pc.bold("Step:")}      ${provisioned.step.title} (${provisioned.step.id})`);
  lines.push(`  ${pc.bold("Folder:")}    ${relativeStepDir}/`);
  lines.push("");

  if (provisioned.hadStarter) {
    lines.push(
      pc.dim("  Starter files have been copied into your workspace folder."),
    );
  } else {
    lines.push(
      pc.dim("  A placeholder index.js has been created in your workspace folder."),
    );
  }

  lines.push("");

  if (displayPrompt && provisioned.step.prompt) {
    lines.push(pc.bold("  What to build:"));
    lines.push("");
    // Indent each line of the prompt
    for (const line of provisioned.step.prompt.split("\n")) {
      lines.push(`  ${line}`);
    }
    lines.push("");
  }

  lines.push(pc.bold("  Next steps:"));
  lines.push("");
  lines.push(`  1. Open ${pc.cyan(relativeStepDir + "/")}`);
  lines.push(`  2. Edit your code`);
  lines.push(`  3. Run ${pc.cyan("npx stepwise test")} from inside that folder`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Renders an error in a clean, student-friendly format.
 */
export function renderInitError(message: string): string {
  return `\n${pc.bold(pc.red("✗ Init failed"))}\n\n  ${message}\n`;
}

/**
 * Renders when the workspace already exists for this step.
 */
export function renderAlreadyInitialized(
  step: ChallengeStepInfo,
  stepDir: string,
): string {
  const rel = path.relative(process.cwd(), stepDir);
  return [
    "",
    `${pc.bold(pc.yellow("⚠ Already initialized"))}`,
    "",
    `  Step ${pc.bold(step.id)} already has a workspace at ${pc.cyan(rel + "/")}`,
    "",
    `  To start fresh, delete the folder and run ${pc.cyan("stepwise init")} again.`,
    `  To test your current code, run ${pc.cyan("npx stepwise test")} from ${pc.cyan(rel + "/")}`,
    "",
  ].join("\n");
}
