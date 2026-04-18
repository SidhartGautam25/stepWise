import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export function runInSandbox(
  scriptPath: string,
  args: string[],
  timeout: number,
) {
  return new Promise<{
    results: Array<{
      name: string;
      status: "pass" | "fail" | "error" | "timeout";
      error?: string;
      duration: number;
      visibility?: "visible" | "hidden";
    }>;
    logs?: { stdout: string; stderr: string };
  }>((resolve, reject) => {
      const command = resolveSandboxCommand(scriptPath, args);
      const child = spawn(command.bin, command.args, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      let output = "";
      let error = "";

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("TIMEOUT"));
      }, timeout);

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        error += data.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer);

        if (code !== 0) {
          return reject(new Error(error || "Execution failed"));
        }

        try {
          const parsed = JSON.parse(output);
          resolve(parsed);
        } catch {
          reject(
            new Error(
              `Invalid JSON output. command="${command.bin} ${command.args.join(" ")}" stdout="${output.trim()}" stderr="${error.trim()}"`,
            ),
          );
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    },
  );
}

function resolveSandboxCommand(scriptPath: string, args: string[]) {
  if (path.extname(scriptPath) === ".ts") {
    return {
      bin: process.execPath,
      args: ["--import", resolveTsxLoaderPath(), scriptPath, ...args],
    };
  }

  return {
    bin: process.execPath,
    args: [scriptPath, ...args],
  };
}

function resolveTsxLoaderPath(): string {
  try {
    return require.resolve("tsx", { paths: [process.cwd(), __dirname] });
  } catch {
    const fallback = path.resolve(
      __dirname,
      "../../../../node_modules/.pnpm/node_modules/tsx/dist/loader.mjs",
    );

    if (fs.existsSync(fallback)) {
      return fallback;
    }

    throw new Error("Unable to resolve tsx loader for sandbox execution");
  }
}
