const fs = require("fs");
const path = require("path");

const binariesDir = path.resolve(__dirname, "..", "binaries");
const cliRoot = path.resolve(__dirname, "..");
const resolvedBinariesDir = path.resolve(binariesDir);

if (!resolvedBinariesDir.startsWith(cliRoot + path.sep)) {
  throw new Error(`Refusing to clean unexpected path: ${resolvedBinariesDir}`);
}

fs.rmSync(resolvedBinariesDir, { recursive: true, force: true });
fs.mkdirSync(resolvedBinariesDir, { recursive: true });

console.log(`Cleaned ${path.relative(cliRoot, resolvedBinariesDir)}`);
