import { defineConfig } from "vitest/config";

export function createVitestConfig(config = {}) {
  return defineConfig({
    test: {
      environment: "node",
      globals: true,
      isolate: true,
      testTimeout: 10000,
      hookTimeout: 10000,
      teardownTimeout: 5000,
      maxConcurrency: 10,
      coverage: {
        provider: "v8",
        enabled: true,
        reporter: ["text", "json", "html", "lcov"],
        exclude: [
          "coverage/**",
          "dist/**",
          "**/node_modules/**",
          "**/*.d.ts",
          "**/*.test.ts",
          "**/*.spec.ts",
          "**/types/**",
          "vitest.config.ts",
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
      reporters: ["default", "html"],
      outputFile: {
        html: "./coverage/html/index.html",
      },
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache,output,temp}/**"],
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
    ...config,
  });
}
