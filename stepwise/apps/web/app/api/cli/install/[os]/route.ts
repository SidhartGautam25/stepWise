import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ os: string }> }
) {
  const resolvedParams = await params;
  const os = resolvedParams.os; // "linux" or "windows"
  const fileName = os === "windows" ? "install.ps1" : "install.sh";
  
  // Resolve path to the raw shell scripts located natively in the CLI
  const scriptPath = path.resolve(process.cwd(), "..", "cli", "scripts", fileName);
  
  if (!fs.existsSync(scriptPath)) {
    return new NextResponse("Install script not found", { status: 404 });
  }

  // Load the raw original script
  let content = fs.readFileSync(scriptPath, "utf-8");

  // Determine the dynamic URL for binaries
  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
  const defaultUrl = host ? `${protocol}://${host}` : "https://stepwise.run";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || defaultUrl;
  
  const binaryEndpoint = `${appUrl}/api/cli/binary`;

  // Dynamically rewrite the hardcoded GitHub URL so it points specifically to our Binary Streamer!
  content = content.replace(
    /https:\/\/github\.com\/your-org\/stepwise\/releases\/latest\/download/g,
    binaryEndpoint
  );

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store", // Stop caching the generated injection
    },
  });
}
