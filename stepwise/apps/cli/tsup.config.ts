import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  noExternal: [/^@repo\//],
  platform: "node",
  clean: true,
  sourcemap: true,
});
