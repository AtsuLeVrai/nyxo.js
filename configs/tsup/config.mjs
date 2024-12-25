import {defineConfig} from "tsup";

export function createTsupConfig(entry = ["src/index.ts"], options = {}) {
    return defineConfig({
        entry,
        format: ["cjs", "esm"],
        target: "esnext",
        platform: "node",
        treeshake: true,
        legacyOutput: true,
        splitting: false,
        sourcemap: process.env.NODE_ENV === "development",
        clean: true,
        tsconfig: "tsconfig.json",
        experimentalDts: {
            entry: entry,
        },
        outDir: "dist",
        skipNodeModulesBundle: true,
        noExternal: options.noExternal ?? [],
        external: options.external ?? [],
        ...options,
    });
}