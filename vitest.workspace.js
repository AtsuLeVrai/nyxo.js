import tsconfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    plugins: [tsconfigPaths()],
    test: {
      name: "packages",
      include: ["packages/**/*.{spec,test}.{js,mjs,ts,tsx}"],
      globals: true,
      environment: "node",
      pool: "threads",
      testTimeout: 10000,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "**/test/setup.ts",
          "**/*.d.ts",
          "**/*.test.{js,ts}",
          "**/*.spec.{js,ts}",
          "**/types/**",
          "coverage/**",
          "dist/**",
        ],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        all: true,
        include: ["packages/**/*.{js,ts}"],
        reportOnFailure: true,
      },
    },
  },
]);
