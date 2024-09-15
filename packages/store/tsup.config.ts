import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    tsconfig: "tsconfig.json",
    splitting: false,
    sourcemap: true,
    clean: true,
    legacyOutput: true,
    experimentalDts: {
        entry: "src/index.ts",
    },
});
