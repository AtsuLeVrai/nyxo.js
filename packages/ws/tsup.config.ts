import { defineConfig } from "tsup";
import { terserOptions } from "./terser.config";

export default defineConfig({
    splitting: false,
    sourcemap: true,
    clean: true,
    skipNodeModulesBundle: true,
    legacyOutput: true,
    minify: false,
    tsconfig: "tsconfig.json",
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    target: "esnext",
    terserOptions: terserOptions,
    experimentalDts: {
        entry: ["src/index.ts"],
    },
});
