import { cpus } from "node:os";
import codspeedPlugin from "@codspeed/vitest-plugin";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    projects: ["packages/*"],
    environment: "node",
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: [
      ...configDefaults.exclude,
      "**/migrations/**",
      "**/seeds/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.next/**",
    ],
    testTimeout: 10000,
    hookTimeout: 15000,
    maxConcurrency: Math.max(4, cpus().length),
    coverage: {
      provider: "v8",
      enabled: false, // Enable via CLI with --coverage
      reporter: [
        "text",
        "html",
        "clover",
        "json",
        "json-summary",
        "lcov",
        "teamcity",
        "text-summary",
        "cobertura",
      ],
      reportsDirectory: "./coverage",
      exclude: [
        "**/*.d.ts",
        "**/*.test.{js,ts}",
        "**/*.spec.{js,ts}",
        "**/node_modules/**",
        "**/dist/**",
        "**/.turbo/**",
        "**/.next/**",
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    bail: 0,
    retry: 1,
    sequence: {
      hooks: "stack",
      setupFiles: "parallel",
    },
    expect: {
      requireAssertions: true,
    },
  },
});
