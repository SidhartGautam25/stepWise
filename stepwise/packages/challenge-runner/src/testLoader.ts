import { TestCase } from "./types";
import { registerWorkspaceAliases } from "./workspaceAlias";

export function loadTests(testFilePath: string): TestCase[] {
  registerWorkspaceAliases();

  const tests = require(testFilePath);

  if (!Array.isArray(tests)) {
    throw new Error("Tests must export an array");
  }

  return tests;
}
