import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  noExternal: [/.*/],
  platform: "node",
  clean: true,
  sourcemap: true,
});
