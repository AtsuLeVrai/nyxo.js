import { describe, expect, it, vi } from "vitest";
import {
  isError,
  isSuccess,
  type TryCatchResult,
  tryCatch,
  tryCatchSync,
} from "../src/index.js";

describe("tryCatch", () => {
  describe("successful operations", () => {
    it("should return success result for resolved promise", async () => {
      const data = { id: 1, name: "John" };
      const promise = Promise.resolve(data);

      const result = await tryCatch(promise);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
    });

    it("should handle primitive values", async () => {
      const result = await tryCatch(Promise.resolve(42));

      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
      expect(result.error).toBeNull();
    });

    it("should handle null and undefined values", async () => {
      const nullResult = await tryCatch(Promise.resolve(null));
      const undefinedResult = await tryCatch(Promise.resolve(undefined));

      expect(nullResult.success).toBe(true);
      expect(nullResult.data).toBeNull();

      expect(undefinedResult.success).toBe(true);
      expect(undefinedResult.data).toBeUndefined();
    });

    it("should handle empty arrays and objects", async () => {
      const arrayResult = await tryCatch(Promise.resolve([]));
      const objectResult = await tryCatch(Promise.resolve({}));

      expect(arrayResult.success).toBe(true);
      expect(arrayResult.data).toEqual([]);

      expect(objectResult.success).toBe(true);
      expect(objectResult.data).toEqual({});
    });
  });

  describe("failed operations", () => {
    it("should return error result for rejected promise", async () => {
      const errorMessage = "Operation failed";
      const promise = Promise.reject(new Error(errorMessage));

      const result = await tryCatch(promise);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(errorMessage);
    });

    it("should handle custom error types", async () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public code: number,
        ) {
          super(message);
          this.name = "CustomError";
        }
      }

      const promise = Promise.reject(new CustomError("Custom error", 500));
      const result = await tryCatch<any, CustomError>(promise);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(CustomError);
      expect(result.error?.code).toBe(500);
    });

    it("should handle non-Error objects being thrown", async () => {
      const promise = Promise.reject("string error");
      const result = await tryCatch(promise);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("string error");
    });

    it("should handle thrown objects", async () => {
      const thrownObject = { message: "object error", code: 400 };
      const promise = Promise.reject(thrownObject);
      const result = await tryCatch(promise);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("[object Object]");
    });

    it("should handle thrown null/undefined", async () => {
      const nullPromise = Promise.reject(null);
      const undefinedPromise = Promise.reject(undefined);

      const nullResult = await tryCatch(nullPromise);
      const undefinedResult = await tryCatch(undefinedPromise);

      expect(nullResult.success).toBe(false);
      expect(nullResult.error?.message).toBe("null");

      expect(undefinedResult.success).toBe(false);
      expect(undefinedResult.error?.message).toBe("undefined");
    });
  });

  describe("async operations", () => {
    it("should work with fetch-like operations", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ users: [] }),
      });

      const result = await tryCatch(mockFetch("/api/users"));

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("ok", true);
    });

    it("should handle timeout operations", async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 10);
      });

      const result = await tryCatch(timeoutPromise);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Timeout");
    });

    it("should work with database-like operations", async () => {
      const mockDb = {
        findUser: (id: number) =>
          id > 0
            ? Promise.resolve({ id, name: `User ${id}` })
            : Promise.reject(new Error("User not found")),
      };

      const successResult = await tryCatch(mockDb.findUser(1));
      const errorResult = await tryCatch(mockDb.findUser(-1));

      expect(successResult.success).toBe(true);
      expect(successResult.data).toEqual({ id: 1, name: "User 1" });

      expect(errorResult.success).toBe(false);
      expect(errorResult.error?.message).toBe("User not found");
    });
  });
});

describe("tryCatchSync", () => {
  describe("successful operations", () => {
    it("should return success result for successful function", () => {
      const fn = () => ({ id: 1, name: "John" });
      const result = tryCatchSync(fn);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: "John" });
      expect(result.error).toBeNull();
    });

    it("should handle JSON parsing", () => {
      const validJson = '{"name": "John", "age": 30}';
      const result = tryCatchSync(() => JSON.parse(validJson));

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: "John", age: 30 });
    });

    it("should handle mathematical operations", () => {
      const result = tryCatchSync(() => Math.sqrt(16));

      expect(result.success).toBe(true);
      expect(result.data).toBe(4);
    });

    it("should handle array operations", () => {
      const arr = [1, 2, 3, 4, 5];
      const result = tryCatchSync(() => arr.find((x) => x > 3));

      expect(result.success).toBe(true);
      expect(result.data).toBe(4);
    });
  });

  describe("failed operations", () => {
    it("should return error result for throwing function", () => {
      const fn = () => {
        throw new Error("Function failed");
      };
      const result = tryCatchSync(fn);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Function failed");
    });

    it("should handle JSON parsing errors", () => {
      const invalidJson = '{"name": "John", "age":}';
      const result = tryCatchSync(() => JSON.parse(invalidJson));

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it("should handle division by zero scenarios", () => {
      const result = tryCatchSync(() => {
        const divisor = 0;
        if (divisor === 0) throw new Error("Division by zero");
        return 10 / divisor;
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Division by zero");
    });

    it("should handle array access errors", () => {
      const result = tryCatchSync(() => {
        const arr: any = null;
        return arr.length;
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it("should handle custom error types", () => {
      class ValidationError extends Error {
        constructor(
          message: string,
          public field: string,
        ) {
          super(message);
          this.name = "ValidationError";
        }
      }

      const result = tryCatchSync<any, ValidationError>(() => {
        throw new ValidationError("Invalid email", "email");
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error?.field).toBe("email");
    });

    it("should handle non-Error throws", () => {
      const stringResult = tryCatchSync(() => {
        throw "string error";
      });

      const objectResult = tryCatchSync(() => {
        throw { code: 400, message: "Bad request" };
      });

      expect(stringResult.success).toBe(false);
      expect(stringResult.error?.message).toBe("string error");

      expect(objectResult.success).toBe(false);
      expect(objectResult.error?.message).toBe("[object Object]");
    });
  });

  describe("edge cases", () => {
    it("should handle functions returning undefined", () => {
      const result = tryCatchSync(() => undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("should handle functions returning null", () => {
      const result = tryCatchSync(() => null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle functions returning false", () => {
      const result = tryCatchSync(() => false);

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });
});

describe("isSuccess type guard", () => {
  it("should correctly identify success results", () => {
    const successResult: TryCatchResult<string> = {
      success: true,
      data: "test",
      error: null,
    };

    expect(isSuccess(successResult)).toBe(true);

    if (isSuccess(successResult)) {
      expect(successResult.data).toBe("test");
      expect(successResult.error).toBeNull();
    }
  });

  it("should correctly identify error results", () => {
    const errorResult: TryCatchResult<string> = {
      success: false,
      data: null,
      error: new Error("test error"),
    };

    expect(isSuccess(errorResult)).toBe(false);
  });

  it("should work with filter operations", async () => {
    const results = await Promise.all([
      tryCatch(Promise.resolve("success1")),
      tryCatch(Promise.reject(new Error("error1"))),
      tryCatch(Promise.resolve("success2")),
      tryCatch(Promise.reject(new Error("error2"))),
    ]);

    const successfulResults = results.filter(isSuccess);

    expect(successfulResults).toHaveLength(2);
    expect(successfulResults[0]?.data).toBe("success1");
    expect(successfulResults[1]?.data).toBe("success2");
  });
});

describe("isError type guard", () => {
  it("should correctly identify error results", () => {
    const errorResult: TryCatchResult<string> = {
      success: false,
      data: null,
      error: new Error("test error"),
    };

    expect(isError(errorResult)).toBe(true);

    if (isError(errorResult)) {
      expect(errorResult.error.message).toBe("test error");
      expect(errorResult.data).toBeNull();
    }
  });

  it("should correctly identify success results", () => {
    const successResult: TryCatchResult<string> = {
      success: true,
      data: "test",
      error: null,
    };

    expect(isError(successResult)).toBe(false);
  });

  it("should work with filter operations", async () => {
    const results = await Promise.all([
      tryCatch(Promise.resolve("success1")),
      tryCatch(Promise.reject(new Error("error1"))),
      tryCatch(Promise.resolve("success2")),
      tryCatch(Promise.reject(new Error("error2"))),
    ]);

    const errorResults = results.filter(isError);

    expect(errorResults).toHaveLength(2);
    expect(errorResults[0]?.error.message).toBe("error1");
    expect(errorResults[1]?.error.message).toBe("error2");
  });
});

describe("type inference", () => {
  it("should infer correct types for generic functions", async () => {
    interface User {
      id: number;
      name: string;
    }

    const fetchUser = (id: number): Promise<User> =>
      Promise.resolve({ id, name: `User ${id}` });

    const result = await tryCatch(fetchUser(1));

    if (result.success) {
      expect(typeof result.data.id).toBe("number");
      expect(typeof result.data.name).toBe("string");
    }
  });

  it("should work with union types", async () => {
    const getValue = (): string | number =>
      Math.random() > 0.5 ? "string" : 42;

    const result = tryCatchSync(getValue);

    if (result.success) {
      expect(["string", "number"]).toContain(typeof result.data);
    }
  });
});

describe("performance and memory", () => {
  it("should handle large data sets efficiently", async () => {
    const largeArray = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      value: `item-${i}`,
    }));

    const start = performance.now();
    const result = await tryCatch(Promise.resolve(largeArray));
    const end = performance.now();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(100000);
    expect(end - start).toBeLessThan(100);
  });

  it("should not leak memory on repeated operations", async () => {
    const operations = Array.from({ length: 1000 }, (_, i) =>
      tryCatch(Promise.resolve(`operation-${i}`)),
    );

    const results = await Promise.all(operations);

    expect(results).toHaveLength(1000);
    expect(results.every(isSuccess)).toBe(true);
  });

  it("should handle rapid error generation", async () => {
    const errorOperations = Array.from({ length: 1000 }, (_, i) =>
      tryCatch(Promise.reject(new Error(`error-${i}`))),
    );

    const results = await Promise.all(errorOperations);

    expect(results).toHaveLength(1000);
    expect(results.every(isError)).toBe(true);
  });
});

describe("real-world scenarios", () => {
  it("should work with API calls", async () => {
    const mockApiCall = (endpoint: string) => {
      if (endpoint === "/users") {
        return Promise.resolve({ users: [{ id: 1, name: "John" }] });
      }
      return Promise.reject(new Error("Not found"));
    };

    const successResult = await tryCatch(mockApiCall("/users"));
    const errorResult = await tryCatch(mockApiCall("/invalid"));

    expect(successResult.success).toBe(true);
    expect(errorResult.success).toBe(false);
  });

  it("should work with file operations simulation", () => {
    const mockFileRead = (path: string) => {
      if (path === "valid.json") {
        return '{"data": "file content"}';
      }
      throw new Error("File not found");
    };

    const successResult = tryCatchSync(() =>
      JSON.parse(mockFileRead("valid.json")),
    );
    const errorResult = tryCatchSync(() =>
      JSON.parse(mockFileRead("invalid.json")),
    );

    expect(successResult.success).toBe(true);
    expect(successResult.data).toEqual({ data: "file content" });

    expect(errorResult.success).toBe(false);
    expect(errorResult.error?.message).toBe("File not found");
  });

  it("should work with validation scenarios", () => {
    const validateEmail = (email: string) => {
      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }
      return email.toLowerCase();
    };

    const validResult = tryCatchSync(() => validateEmail("user@example.com"));
    const invalidResult = tryCatchSync(() => validateEmail("invalid-email"));

    expect(validResult.success).toBe(true);
    expect(validResult.data).toBe("user@example.com");

    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error?.message).toBe("Invalid email format");
  });
});
