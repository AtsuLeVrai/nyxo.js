import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "dist/"],
            provider: "v8",
        },
        isolate: false,
        passWithNoTests: true,
    },
});
