import fs from "fs";
import path from "path";
import {
  ChallengeInfoResponse,
  ChallengeStepInfo,
  LOCAL_WORKSPACE_CONFIG_FILENAME,
  LocalWorkspaceConfig,
  parseLocalWorkspaceConfig,
} from "@repo/types";

/**
 * Provisions a student workspace for a given challenge step.
 *
 * This is the core of the "zero-setup" product promise:
 * - Copies the challenge's starter/ files into the student's local folder
 * - Writes a .stepwise.json config so `stepwise test` needs no extra flags
 *
 * Directory layout created:
 *   <targetDir>/
 *     <stepId>/
 *       <starter files copied here>
 *       .stepwise.json
 */
export interface ProvisionedWorkspace {
  /** Absolute path to the step folder the student should edit */
  stepDir: string;
  /** The step that was provisioned */
  step: ChallengeStepInfo;
  /** Whether starter files were copied (false when no starter exists) */
  hadStarter: boolean;
}

export function provisionWorkspace(
  challenge: ChallengeInfoResponse,
  step: ChallengeStepInfo,
  targetDir: string,
  userId: string,
  apiBaseUrl: string,
): ProvisionedWorkspace {
  const stepDir = path.resolve(targetDir, step.id);

  // Create the step directory
  fs.mkdirSync(stepDir, { recursive: true });

  // Copy starter files from the step manifest rather than assuming a fixed folder shape
  const starterSrc = step.starterRoot
    ? path.resolve(challenge.challengePath, step.starterRoot)
    : undefined;
  let hadStarter = false;

  if (starterSrc && fs.existsSync(starterSrc)) {
    copyDirRecursive(starterSrc, stepDir);
    hadStarter = true;
  } else {
    // No starter — write a minimal placeholder at the declared entrypoint if available
    const entrypoint = step.entrypoint ?? "index.js";
    const placeholderPath = path.resolve(stepDir, entrypoint);
    fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
    if (!fs.existsSync(placeholderPath)) {
      fs.writeFileSync(
        placeholderPath,
        `// Step: ${step.title}\n// Write your solution here.\n\nmodule.exports = function solution() {\n  // TODO\n};\n`,
        "utf-8",
      );
    }
  }

  // Write .stepwise.json
  const config: LocalWorkspaceConfig = {
    schemaVersion: 1,
    challengeId: challenge.id,
    challengeVersion: challenge.version,
    currentStepId: step.id,
    userId,
    apiBaseUrl,
    initializedAt: new Date().toISOString(),
  };

  const configPath = path.resolve(stepDir, LOCAL_WORKSPACE_CONFIG_FILENAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  return { stepDir, step, hadStarter };
}

/**
 * Advances a provisioned workspace to the next step.
 * Copies the next step's starter files and updates .stepwise.json.
 */
export function advanceWorkspace(
  challenge: ChallengeInfoResponse,
  nextStep: ChallengeStepInfo,
  currentStepDir: string,
  existingConfig: LocalWorkspaceConfig,
): ProvisionedWorkspace {
  // The parent directory of the current step folder becomes the target for the next
  const targetDir = path.dirname(currentStepDir);
  return provisionWorkspace(
    challenge,
    nextStep,
    targetDir,
    existingConfig.userId,
    existingConfig.apiBaseUrl,
  );
}

/** Recursively copies src directory into dest, skipping existing files */
function copyDirRecursive(src: string, dest: string): void {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.resolve(src, entry.name);
    const destPath = path.resolve(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      // Never overwrite files the student may have already edited
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

/**
 * Reads the .stepwise.json from a step directory.
 * Returns undefined if not found (not a stepwise workspace).
 */
export function readWorkspaceConfig(stepDir: string): LocalWorkspaceConfig | undefined {
  const configPath = path.resolve(stepDir, LOCAL_WORKSPACE_CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) return undefined;

  try {
    return parseLocalWorkspaceConfig(JSON.parse(fs.readFileSync(configPath, "utf-8")));
  } catch {
    return undefined;
  }
}

/**
 * Writes an updated .stepwise.json into the given step directory.
 */
export function writeWorkspaceConfig(stepDir: string, config: LocalWorkspaceConfig): void {
  const configPath = path.resolve(stepDir, LOCAL_WORKSPACE_CONFIG_FILENAME);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
