import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  format: "esm",
  target: "esnext",
  platform: "node",
  clean: true,
  treeshake: true,
  minify: false,
  sourcemap: false,
  tsconfig: "./tsconfig.json",
  dts: {
    sourcemap: false,
  },
});
