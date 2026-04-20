import os from "os";
import path from "path";
import fs from "fs";
import https from "https";
import { execSync } from "child_process";

// ─── Constants & Paths ────────────────────────────────────────────────────────
const STEPWISE_CONFIG_DIR = path.join(os.homedir(), ".config", "stepwise");
const RUNTIMES_DIR = path.join(STEPWISE_CONFIG_DIR, "runtimes");

// ─── Registry Mapping ─────────────────────────────────────────────────────────

// Map of support versions to their exact download structures
const NODE_MIRROR = "https://nodejs.org/dist";

function getNodeArchiveInfo(version: string) {
  const platform = os.platform();
  let arch = os.arch();
  
  // Node uses specific nomenclature
  if (arch === "x64") arch = "x64";
  else if (arch === "arm64") arch = "arm64";
  else throw new Error(`Unsupported architecture: ${arch}`);

  let osName: string = platform;
  let ext = "tar.gz";

  if (platform === "win32") {
    osName = "win";
    ext = "zip";
  } else if (platform === "darwin") {
    osName = "darwin";
  } else if (platform === "linux") {
    osName = "linux";
  } else {
    throw new Error(`Unsupported OS platform: ${platform}`);
  }

  // Example: node-v20.12.0-linux-x64
  const folderName = `node-${version}-${osName}-${arch}`;
  const filename = `${folderName}.${ext}`;
  const url = `${NODE_MIRROR}/${version}/${filename}`;

  return { url, folderName, ext };
}

// ─── Network Downloader ───────────────────────────────────────────────────────

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirect
          if (response.headers.location) {
            downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          fs.unlink(dest, () => {});
          return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(); // close() is async, resolve after close completes.
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

// ─── Archive Extraction ───────────────────────────────────────────────────────

function extractArchive(sourcePath: string, destDir: string, ext: string) {
  if (ext === "tar.gz") {
    // Standard on all modern Unix (Mac + Linux) and Windows 10+
    execSync(`tar -xzf "${sourcePath}" -C "${destDir}"`, { stdio: "ignore" });
  } else if (ext === "zip") {
    // Windows modern OS (using PowerShell native Expand-Archive or tar)
    try {
      execSync(`tar -xf "${sourcePath}" -C "${destDir}"`, { stdio: "ignore" });
    } catch {
      // Fallback for older windows powershell
      execSync(`powershell -command "Expand-Archive -Force '${sourcePath}' '${destDir}'"`, { stdio: "ignore" });
    }
  } else {
    throw new Error(`Unsupported archive extension: ${ext}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ensures the specified language and version is downloaded natively to the isolated cache.
 * Returns the absolute path to the executable binary.
 */
export async function installRuntime(language: string, version: string): Promise<string> {
  if (language !== "node" && language !== "javascript" && language !== "typescript") {
    throw new Error(`Runtime isolation for language '${language}' is not yet supported in CLI.`);
  }

  // Force standardize version string
  if (!version.startsWith("v")) {
    version = "v" + version;
  }

  // 1. Prepare target cache directories
  const langDir = path.join(RUNTIMES_DIR, "node");
  const versionDir = path.join(langDir, version);
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }

  // 2. Resolve manifest mapping
  const { url, folderName, ext } = getNodeArchiveInfo(version);
  const runtimeFolderPath = path.join(versionDir, folderName);
  
  const platform = os.platform();
  const binarySubPath = platform === "win32" ? "node.exe" : ["bin", "node"].join(path.sep);
  const finalExecutablePath = path.join(runtimeFolderPath, binarySubPath);

  // 3. Cache HIT: Is the executable already extracted natively?
  if (fs.existsSync(finalExecutablePath)) {
    return finalExecutablePath;
  }

  // 4. Cache MISS: Proceed to perform heavy network execution
  const archiveDest = path.join(versionDir, `${folderName}.${ext}`);

  process.stdout.write(`\n⏳ Isolating ${language} ${version} environment (First time only)...\n`);
  process.stdout.write(`   Downloading: ${url}\n`);

  try {
    await downloadFile(url, archiveDest);
    
    process.stdout.write(`   Extracting environment securely...\n`);
    extractArchive(archiveDest, versionDir, ext);
  } catch (error) {
    if (fs.existsSync(archiveDest)) fs.unlinkSync(archiveDest);
    throw new Error(`Runtime isolation failed: ${error}`);
  }

  // 5. Cleanup compressed archive footprint
  if (fs.existsSync(archiveDest)) {
    fs.unlinkSync(archiveDest);
  }

  // 6. Verify success natively
  if (!fs.existsSync(finalExecutablePath)) {
    throw new Error("Critical error: Extracted environment, but executable binary could not be found.");
  }
  
  return finalExecutablePath;
}
