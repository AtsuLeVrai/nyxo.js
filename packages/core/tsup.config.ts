import { defineConfig } from "tsup";

export default defineConfig({
    splitting: false,
    sourcemap: true,
    clean: true,
    keepNames: true,
    skipNodeModulesBundle: true,
    legacyOutput: true,
    tsconfig: "tsconfig.json",
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    experimentalDts: {
        entry: ["src/index.ts"],
    },
});
