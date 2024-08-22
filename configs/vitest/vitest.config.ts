import {defineConfig} from 'vitest/config';

export function createVitestConfig() {
    return defineConfig({
        test: {
            environment: 'node',
            coverage: {
                reporter: ['text', 'json', 'html'],
                reportsDirectory: './coverage',
                include: ['src/**/*.ts'],
                exclude: ['tests/**', 'node_modules/**', 'dist/**'],
                provider: "v8"
            },
            reporters: ['default', 'html'],
            globals: true,
            silent: false,
            watch: false,
        },
    })
}
