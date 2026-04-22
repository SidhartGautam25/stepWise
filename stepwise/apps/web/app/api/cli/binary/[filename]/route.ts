import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename; // e.g. "stepwise-macos-x64"
  
  // Resolve path to the compiled payload executables
  const binaryPath = path.resolve(process.cwd(), "..", "cli", "binaries", filename);
  
  if (!fs.existsSync(binaryPath)) {
    return new NextResponse("Binary executable not found on server", { status: 404 });
  }

  // Strictly enforce binary payload streams! We read via streaming so we don't blow up Node.js RAM!
  const fileStream = fs.createReadStream(binaryPath) as any;

  return new NextResponse(fileStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`
    },
  });
}
