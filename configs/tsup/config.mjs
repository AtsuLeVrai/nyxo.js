import {defineConfig} from "tsup";

export function createTsupConfig(entry = ["src/index.ts"], options = {}) {
    return defineConfig({
        entry,
        format: ["cjs", "esm"],
        target: "esnext",
        platform: "node",
        treeshake: true,
        legacyOutput: false,
        splitting: false,
        sourcemap: process.env.NODE_ENV === "development",
        clean: true,
        tsconfig: "tsconfig.json",
        outDir: "dist",
        skipNodeModulesBundle: true,
        noExternal: options.noExternal ?? [],
        external: options.external ?? [],
        experimentalDts: {
            entry: entry,
        },
        ...options,
    });
}
