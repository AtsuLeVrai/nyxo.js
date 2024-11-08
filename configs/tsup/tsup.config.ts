import {defineConfig, Options} from "tsup";

export function createTsupConfig(entry: string[] = ["src/index.ts"], options: Options = {}) {
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

