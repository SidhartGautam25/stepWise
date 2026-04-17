import { spawn } from "child_process";

export function runInSandbox(
  scriptPath: string,
  args: string[],
  timeout: number,
) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath, ...args], {
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
        reject(new Error("Invalid JSON output"));
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
