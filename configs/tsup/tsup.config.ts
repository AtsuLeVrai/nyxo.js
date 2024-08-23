import {defineConfig, Options} from 'tsup'

export function createTsupConfig(options?: Options) {
    return defineConfig({
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
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