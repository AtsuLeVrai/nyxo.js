import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        isolate: true,
        watch: false,
        silent: true,
        environment: "node",
        pool: "forks",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "coverage/**",
                "dist/**",
                "**/[.]**",
                "packages/*/test{,s}/**",
                "**/*.d.ts",
                "cypress/**",
                "test{,s}/**",
                "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
                "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
                "**/__tests__/**",
                "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc}.config.*",
                "**/jest.setup.{js,cjs,mjs,ts}",
                "**/*.{spec,test}.{js,cjs,mjs,ts,tsx,jsx}",
            ],
        },
    },
});
