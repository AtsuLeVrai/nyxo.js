import {defineConfig, Options} from 'tsup'
import {esbuildPluginVersionInjector} from "esbuild-plugin-version-injector";

export function createTsupConfig(options?: Options) {
    return defineConfig({
        plugins: [esbuildPluginVersionInjector()],
        entry: ['src/index.ts'],
        format: ['cjs', 'esm', 'iife'],
        platform: 'node',
        target: "esnext",
        outDir: 'dist',
        tsconfig: 'tsconfig.json',
        dts: false,
        sourcemap: true,
        clean: true,
        legacyOutput: true,
        cjsInterop: true,
        minify: false,
        skipNodeModulesBundle: true,
        splitting: false,
        treeshake: false,
        terserOptions: {
            mangle: false,
            keep_classnames: true,
            keep_fnames: true,
        },
        ...options,
    })
}