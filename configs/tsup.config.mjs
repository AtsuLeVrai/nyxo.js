import { defineConfig } from "tsup";

export function createTsupConfig(entry = ["src/index.ts"], options = {}) {
  return defineConfig({
    splitting: false,
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    legacyOutput: true,
    tsconfig: "tsconfig.json",
    entry: entry,
    format: ["cjs", "esm"],
    target: "esnext",
    experimentalDts: {
      entry: entry,
    },
    ...options,
  });
}
