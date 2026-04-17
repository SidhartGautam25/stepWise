import path from "path";

export function loadTests(challengePath: string) {
  const testFile = path.join(challengePath, "tests", "visible.test.js");

  const tests = require(testFile);

  if (!Array.isArray(tests)) {
    throw new Error("Tests must export an array");
  }

  return tests;
}
