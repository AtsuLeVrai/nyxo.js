import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: ['tests/**', 'node_modules/**', 'dist/**'],
            provider: "v8"
        },
        reporters: ['default', 'html'],
        silent: false,
        watch: false,
    },
});
