import {defineWorkspace} from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.js",
    test: {
      name: "packages",
      include: ["packages/**/*.{test,spec}.{ts,tsx}"],
      environment: "node",
      threads: true,
      globals: true,
      coverage: {
        provider: "v8",
        enabled: true,
        reporter: ["text", "json", "html"],
        exclude: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
      },
    },
  },
]);
