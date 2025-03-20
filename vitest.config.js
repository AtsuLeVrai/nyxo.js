import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: [
      "packages/*",
      {
        environment: "node",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: ["**/node_modules/**", "**/dist/**"],
        testTimeout: 10000,
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          exclude: ["**/node_modules/**", "**/*.d.ts", "**/*.test.ts"],
        },
        watchExclude: ["**/node_modules/**", "**/dist/**"],
        globals: true,
      },
    ],
  },
});
