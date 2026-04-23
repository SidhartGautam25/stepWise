const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const binariesDir = path.resolve(__dirname, "..", "binaries");

function binaryPlatform() {
  if (process.platform === "win32") return "win";
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  throw new Error(`Unsupported platform: ${process.platform}`);
}

function binaryArch() {
  if (process.arch === "x64") return "x64";
  if (process.arch === "arm64") return "arm64";
  throw new Error(`Unsupported architecture: ${process.arch}`);
}

function findSource() {
  const platform = binaryPlatform();
  const arch = binaryArch();
  const extension = platform === "win" ? ".exe" : "";
  const candidates = [
    path.join(binariesDir, `stepwise-${platform}-${arch}${extension}`),
    path.join(binariesDir, `cli-${platform}-${arch}${extension}`),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function runPowerShell(command) {
  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || `PowerShell command failed: ${command}`);
  }

  return result.stdout.trim();
}

function pathContains(pathValue, directory, separator) {
  return pathValue
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => part.toLowerCase() === directory.toLowerCase());
}

function installWindows(source) {
  const installDir = path.join(os.homedir(), "AppData", "Local", "StepWise");
  const destination = path.join(installDir, "stepwise.exe");
  const npmBinDir = path.join(
    process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
    "npm",
  );
  const shimPath = path.join(npmBinDir, "stepwise.cmd");

  fs.mkdirSync(installDir, { recursive: true });
  fs.copyFileSync(source, destination);

  fs.mkdirSync(npmBinDir, { recursive: true });
  fs.writeFileSync(shimPath, `@echo off\r\n"${destination}" %*\r\n`);

  const currentUserPath = runPowerShell(
    "[Environment]::GetEnvironmentVariable('PATH', 'User')",
  );

  if (!pathContains(currentUserPath, installDir, ";")) {
    const newPath = currentUserPath ? `${currentUserPath};${installDir}` : installDir;
    runPowerShell(
      `[Environment]::SetEnvironmentVariable('PATH', ${JSON.stringify(newPath)}, 'User')`,
    );
    console.log("Added StepWise install directory to your user PATH.");
  } else {
    console.log("StepWise install directory is already on your user PATH.");
  }

  console.log(`Installed ${destination}`);
  console.log(`Created command shim ${shimPath}`);
  console.log("Open a new terminal if this shell cannot resolve `stepwise`.");
}

function preferredUnixInstallDir() {
  if (process.env.STEPWISE_INSTALL_DIR) {
    return path.resolve(process.env.STEPWISE_INSTALL_DIR);
  }

  return path.join(os.homedir(), ".local", "bin");
}

function shellProfileCandidates() {
  const home = os.homedir();
  const shell = process.env.SHELL || "";

  if (shell.endsWith("zsh")) {
    return [path.join(home, ".zshrc")];
  }

  if (shell.endsWith("fish")) {
    return [path.join(home, ".config", "fish", "config.fish")];
  }

  return [path.join(home, ".bashrc"), path.join(home, ".profile")];
}

function ensureUnixPath(installDir) {
  const currentPath = process.env.PATH || "";

  if (pathContains(currentPath, installDir, path.delimiter)) {
    console.log("StepWise install directory is already on PATH.");
    return;
  }

  const profiles = shellProfileCandidates();
  const profile = profiles.find((candidate) => fs.existsSync(candidate)) || profiles[0];
  fs.mkdirSync(path.dirname(profile), { recursive: true });

  const line = process.env.SHELL?.endsWith("fish")
    ? `set -gx PATH ${installDir} $PATH`
    : `export PATH="${installDir}:$PATH"`;

  const existing = fs.existsSync(profile) ? fs.readFileSync(profile, "utf8") : "";
  if (!existing.includes(installDir)) {
    fs.appendFileSync(profile, `${existing.endsWith("\n") || existing.length === 0 ? "" : "\n"}# StepWise CLI\n${line}\n`);
  }

  console.log(`Added StepWise install directory to ${profile}.`);
  console.log(`Run this now or open a new terminal: export PATH="${installDir}:$PATH"`);
}

function installUnix(source) {
  const installDir = preferredUnixInstallDir();
  const destination = path.join(installDir, "stepwise");

  fs.mkdirSync(installDir, { recursive: true });
  fs.copyFileSync(source, destination);
  fs.chmodSync(destination, 0o755);

  console.log(`Installed ${destination}`);
  ensureUnixPath(installDir);
}

const source = findSource();

if (!source) {
  throw new Error(
    `No local binary found for ${binaryPlatform()}-${binaryArch()}. Run "pnpm --filter cli run compile" first.`,
  );
}

if (process.platform === "win32") {
  installWindows(source);
} else {
  installUnix(source);
}
