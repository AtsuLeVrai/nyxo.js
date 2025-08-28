import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ImportFailure,
  type ImportResult,
  type ImportSuccess,
  safeModuleImport,
} from "./import.util.js";

describe("Import Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Type Definitions", () => {
    it("should have correct ImportSuccess type structure", () => {
      const successResult: ImportSuccess<string> = {
        success: true,
        module: "test-module",
      };

      expect(successResult.success).toBe(true);
      expect(successResult.module).toBe("test-module");
      expect("error" in successResult).toBe(false);
      expect("moduleName" in successResult).toBe(false);
    });

    it("should have correct ImportFailure type structure", () => {
      const failureResult: ImportFailure = {
        success: false,
        error: new Error("Test error"),
        moduleName: "failed-module",
      };

      expect(failureResult.success).toBe(false);
      expect(failureResult.error).toBeInstanceOf(Error);
      expect(failureResult.moduleName).toBe("failed-module");
      expect("module" in failureResult).toBe(false);
    });

    it("should have correct ImportResult union type", () => {
      const successResult: ImportResult<number> = {
        success: true,
        module: 42,
      };

      const failureResult: ImportResult<number> = {
        success: false,
        error: new Error("Import failed"),
        moduleName: "test-module",
      };

      expect(successResult.success).toBe(true);
      expect(failureResult.success).toBe(false);
    });
  });

  describe("safeModuleImport", () => {
    describe("Import failures (real behavior)", () => {
      it("should handle module not found error", async () => {
        const result = await safeModuleImport("non-existent-module-xyz-123");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.moduleName).toBe("non-existent-module-xyz-123");
          expect(result.error.message).toBeTruthy();
        }
      });

      it("should handle invalid module names", async () => {
        const result = await safeModuleImport("");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.moduleName).toBe("");
        }
      });

      it("should handle very long module names", async () => {
        const longModuleName = `very-long-module-name-${"a".repeat(200)}`;

        const result = await safeModuleImport(longModuleName);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.moduleName).toBe(longModuleName);
          expect(result.error.message.length).toBeGreaterThan(0);
        }
      });

      it("should handle module names with special characters", async () => {
        const specialModuleName = "@scope/package-name_with.special-chars";

        const result = await safeModuleImport(specialModuleName);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.moduleName).toBe(specialModuleName);
        }
      });

      it("should handle relative path imports", async () => {
        const relativePath = "./non-existent/relative/path/to/module";

        const result = await safeModuleImport(relativePath);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.moduleName).toBe(relativePath);
        }
      });

      it("should provide descriptive error messages", async () => {
        const result = await safeModuleImport("definitely-does-not-exist-12345");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toBeTruthy();
          expect(result.error.message.length).toBeGreaterThan(10);
          expect(typeof result.error.message).toBe("string");
        }
      });
    });

    describe("ESM/CommonJS behavior (integration tests)", () => {
      it("should handle real ESM modules if available", async () => {
        // Test with a real module that might exist in the environment
        // This is more of an integration test
        const result = await safeModuleImport("crypto");

        // We don't know if crypto exists in the test environment
        // So we test both success and failure paths
        if (result.success) {
          expect(result.module).toBeDefined();
          expect("error" in result).toBe(false);
        } else {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.moduleName).toBe("crypto");
        }
      });

      it("should handle import() resolution correctly", async () => {
        // Test the actual behavior without mocking
        // This verifies that our function structure is correct
        const result = await safeModuleImport("non-existent-test-module-123");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.moduleName).toBe("non-existent-test-module-123");
          // Verify the error normalization works
          expect(result.error.message).toContain("non-existent-test-module-123");
        }
      });

      it("should preserve error information structure", async () => {
        const result = await safeModuleImport("invalid-module-path-###");

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBeTruthy();
          expect(result.error.stack).toBeTruthy();
          expect(result.moduleName).toBe("invalid-module-path-###");
        }
      });
    });

    describe("Type safety validation", () => {
      it("should maintain type safety with generic parameter", async () => {
        interface CustomInterface {
          id: number;
          name: string;
          active: boolean;
        }

        // This tests compile-time type safety
        const result = await safeModuleImport<CustomInterface>("non-existent-typed-module");

        // Since module doesn't exist, we expect failure
        expect(result.success).toBe(false);

        // Type safety test: if it succeeded, module would be typed correctly
        if (result.success) {
          // These lines test that TypeScript inference works
          const id: number = result.module.id;
          const name: string = result.module.name;
          const active: boolean = result.module.active;

          // This should compile without TypeScript errors
          expect(typeof id).toBe("number");
          expect(typeof name).toBe("string");
          expect(typeof active).toBe("boolean");
        }
      });

      it("should handle unknown type parameter", async () => {
        // Test without generic parameter (defaults to unknown)
        const result = await safeModuleImport("unknown-module");

        expect(result.success).toBe(false);
        if (result.success) {
          // Module would be of type unknown, requiring type assertion
          expect(result.module).toBeDefined();
        }
      });

      it("should work with complex nested types", async () => {
        interface NestedConfig {
          database: {
            host: string;
            port: number;
            credentials: {
              username: string;
              password: string;
            };
          };
          features: {
            [key: string]: boolean;
          };
          handlers: Array<{
            name: string;
            callback: () => void;
          }>;
        }

        const result = await safeModuleImport<NestedConfig>("nested-config-module");

        expect(result.success).toBe(false);
        if (result.success) {
          // Type safety verification - should compile without errors
          expect(result.module.database.host).toBeDefined();
          expect(result.module.database.port).toBeDefined();
          expect(result.module.features).toBeDefined();
          expect(result.module.handlers).toBeDefined();
        }
      });
    });

    describe("Error normalization behavior", () => {
      it("should handle function behavior with invalid inputs", async () => {
        // Test various invalid inputs to verify error handling
        const testCases = [
          "",
          "   ",
          "invalid//module//path",
          "module with spaces",
          "module\nwith\nnewlines",
          "module\twith\ttabs",
        ];

        for (const moduleName of testCases) {
          const result = await safeModuleImport(moduleName);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.moduleName).toBe(moduleName);
            expect(result.error.message).toBeTruthy();
          }
        }
      });

      it("should handle concurrent import attempts", async () => {
        // Test multiple simultaneous import attempts
        const promises = [
          safeModuleImport("concurrent-test-1"),
          safeModuleImport("concurrent-test-2"),
          safeModuleImport("concurrent-test-3"),
        ];

        const results = await Promise.all(promises);

        results.forEach((result, index) => {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.moduleName).toBe(`concurrent-test-${index + 1}`);
          }
        });
      });
    });

    describe("Real-world usage patterns", () => {
      it("should handle common module patterns", async () => {
        const commonModules = [
          "lodash",
          "moment",
          "express",
          "react",
          "@types/node",
          "chalk",
          "axios",
        ];

        // Test with modules that may or may not exist
        for (const moduleName of commonModules) {
          const result = await safeModuleImport(moduleName);

          // We don't know if these modules exist in test environment
          // But we can verify the structure is correct
          if (result.success) {
            expect(result.module).toBeDefined();
            expect("error" in result).toBe(false);
          } else {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.moduleName).toBe(moduleName);
          }
        }
      });

      it("should handle scoped package names", async () => {
        const scopedPackages = [
          "@babel/core",
          "@typescript-eslint/parser",
          "@testing-library/react",
          "@vue/compiler-sfc",
        ];

        for (const packageName of scopedPackages) {
          const result = await safeModuleImport(packageName);

          // Test structure regardless of success/failure
          if (result.success) {
            expect(result.module).toBeDefined();
          } else {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.moduleName).toBe(packageName);
          }
        }
      });
    });
  });

  describe("Function behavior verification", () => {
    it("should return consistent results for same module", async () => {
      const moduleName = "consistency-test-module";

      const result1 = await safeModuleImport(moduleName);
      const result2 = await safeModuleImport(moduleName);

      // Results should be structurally equivalent
      expect(result1.success).toBe(result2.success);

      if (!result1.success && !result2.success) {
        expect(result1.moduleName).toBe(result2.moduleName);
        expect(result1.error).toBeInstanceOf(Error);
        expect(result2.error).toBeInstanceOf(Error);
      }
    });

    it("should handle different module names differently", async () => {
      const result1 = await safeModuleImport("module-a");
      const result2 = await safeModuleImport("module-b");

      if (!result1.success && !result2.success) {
        expect(result1.moduleName).not.toBe(result2.moduleName);
        expect(result1.moduleName).toBe("module-a");
        expect(result2.moduleName).toBe("module-b");
      }
    });

    it("should be performance-reasonable for multiple calls", async () => {
      const start = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) => safeModuleImport(`perf-test-${i}`));

      const results = await Promise.all(promises);

      const duration = Date.now() - start;

      // Should complete within reasonable time (5 seconds for 10 calls)
      expect(duration).toBeLessThan(5000);
      expect(results).toHaveLength(10);

      results.forEach((result, index) => {
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.moduleName).toBe(`perf-test-${index}`);
        }
      });
    });
  });
});
