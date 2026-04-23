const fs = require("fs");
const path = require("path");

const binariesDir = path.resolve(__dirname, "..", "binaries");
const releaseNames = new Map([
  ["cli-linux-arm64", "stepwise-linux-arm64"],
  ["cli-linux-x64", "stepwise-linux-x64"],
  ["cli-macos-arm64", "stepwise-macos-arm64"],
  ["cli-macos-x64", "stepwise-macos-x64"],
  ["cli-win-x64.exe", "stepwise-win-x64.exe"],
]);

if (!fs.existsSync(binariesDir)) {
  throw new Error(`Binaries directory not found: ${binariesDir}`);
}

for (const [sourceName, targetName] of releaseNames) {
  const source = path.join(binariesDir, sourceName);
  const target = path.join(binariesDir, targetName);

  if (!fs.existsSync(source)) {
    console.warn(`Skipped missing ${sourceName}`);
    continue;
  }

  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o755);
  console.log(`Created ${path.relative(binariesDir, target)}`);
}
