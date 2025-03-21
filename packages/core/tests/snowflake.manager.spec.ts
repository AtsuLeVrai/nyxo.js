import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnowflakeManager, type SnowflakeOptions } from "../src/index.js";

describe("SnowflakeManager", () => {
  // Mock values for testing
  const validSnowflake = "175928847299117063";
  const futureSnowflake = "999999999999999999";
  const invalidSnowflake = "not-a-snowflake";
  const testTimestamp = 1500000000000; // Timestamp after Discord Epoch
  const discordEpoch = 1420070400000;

  // Mock Date.now() for consistent testing
  let originalDateNow: typeof Date.now;

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = vi.fn().mockReturnValue(1600000000000); // Fixed date for testing
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  // Static methods
  describe("static methods", () => {
    describe("from", () => {
      it("should create a SnowflakeManager from a string snowflake", () => {
        const manager = SnowflakeManager.from(validSnowflake);
        expect(manager.toString()).toBe(validSnowflake);
      });

      it("should create a SnowflakeManager from a timestamp", () => {
        const manager = SnowflakeManager.from(testTimestamp);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager from a Date object", () => {
        const date = new Date(testTimestamp);
        const manager = SnowflakeManager.from(date);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager with custom options", () => {
        // @ts-expect-error
        const options: SnowflakeOptions = {
          workerId: 5,
          processId: 10,
          increment: 100,
        };
        const manager = SnowflakeManager.from(testTimestamp, options);
        expect(manager.getWorkerId()).toBe(5);
        expect(manager.getProcessId()).toBe(10);
        expect(manager.getIncrement()).toBe(100);
      });

      it("should throw for invalid inputs", () => {
        expect(() => SnowflakeManager.from(invalidSnowflake)).toThrow();
      });
    });

    describe("fromTimestamp", () => {
      it("should create a SnowflakeManager from a timestamp number", () => {
        const manager = SnowflakeManager.fromTimestamp(testTimestamp);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager from a Date object", () => {
        const date = new Date(testTimestamp);
        const manager = SnowflakeManager.fromTimestamp(date);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager with custom options", () => {
        // @ts-expect-error
        const options: SnowflakeOptions = {
          workerId: 5,
          processId: 10,
          increment: 100,
        };
        const manager = SnowflakeManager.fromTimestamp(testTimestamp, options);
        expect(manager.getWorkerId()).toBe(5);
        expect(manager.getProcessId()).toBe(10);
        expect(manager.getIncrement()).toBe(100);
      });

      it("should throw for timestamps before Discord epoch", () => {
        expect(() =>
          SnowflakeManager.fromTimestamp(discordEpoch - 1),
        ).toThrow();
      });
    });

    describe("isValid", () => {
      it("should return true for valid snowflakes", () => {
        expect(SnowflakeManager.isValid(validSnowflake)).toBe(true);
      });

      it("should return false for invalid snowflakes", () => {
        expect(SnowflakeManager.isValid(invalidSnowflake)).toBe(false);
        expect(SnowflakeManager.isValid("")).toBe(false);
        expect(SnowflakeManager.isValid("12345")).toBe(false);
      });

      it("should return false for very future timestamps", () => {
        // Snowflakes with timestamps far in the future should be invalid
        expect(SnowflakeManager.isValid(futureSnowflake)).toBe(false);
      });
    });

    describe("resolve", () => {
      it("should resolve a string snowflake", () => {
        const resolved = SnowflakeManager.resolve(validSnowflake);
        expect(resolved).toBe(validSnowflake);
      });

      it("should resolve a timestamp to a snowflake", () => {
        const resolved = SnowflakeManager.resolve(testTimestamp);
        const manager = new SnowflakeManager(resolved);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should resolve a Date object to a snowflake", () => {
        const date = new Date(testTimestamp);
        const resolved = SnowflakeManager.resolve(date);
        const manager = new SnowflakeManager(resolved);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should apply provided options", () => {
        const options = { workerId: 5, processId: 10, increment: 100 };
        const resolved = SnowflakeManager.resolve(testTimestamp, options);
        const manager = new SnowflakeManager(resolved);
        expect(manager.getWorkerId()).toBe(5);
        expect(manager.getProcessId()).toBe(10);
        expect(manager.getIncrement()).toBe(100);
      });
    });
  });

  // Instance methods and properties
  describe("instance methods", () => {
    describe("constructor", () => {
      it("should create a SnowflakeManager instance from a string", () => {
        const manager = new SnowflakeManager(validSnowflake);
        expect(manager.toString()).toBe(validSnowflake);
      });

      it("should create a SnowflakeManager from a timestamp", () => {
        const manager = new SnowflakeManager(testTimestamp);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager from a Date", () => {
        const date = new Date(testTimestamp);
        const manager = new SnowflakeManager(date);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });

      it("should create a SnowflakeManager from a BigInt", () => {
        const bigint = BigInt(validSnowflake);
        const manager = new SnowflakeManager(bigint);
        expect(manager.toString()).toBe(validSnowflake);
      });

      it("should apply provided options", () => {
        const options = { workerId: 5, processId: 10, increment: 100 };
        const manager = new SnowflakeManager(testTimestamp, options);
        expect(manager.getWorkerId()).toBe(5);
        expect(manager.getProcessId()).toBe(10);
        expect(manager.getIncrement()).toBe(100);
      });

      it("should throw for invalid inputs", () => {
        expect(() => new SnowflakeManager(invalidSnowflake)).toThrow();
        expect(() => new SnowflakeManager(-1)).toThrow();
      });

      it("should throw for invalid options", () => {
        expect(
          () => new SnowflakeManager(testTimestamp, { workerId: -1 }),
        ).toThrow();
        expect(
          () => new SnowflakeManager(testTimestamp, { workerId: 32 }),
        ).toThrow();
        expect(
          () => new SnowflakeManager(testTimestamp, { processId: -1 }),
        ).toThrow();
        expect(
          () => new SnowflakeManager(testTimestamp, { processId: 32 }),
        ).toThrow();
        expect(
          () => new SnowflakeManager(testTimestamp, { increment: -1 }),
        ).toThrow();
        expect(
          () => new SnowflakeManager(testTimestamp, { increment: 4096 }),
        ).toThrow();
        expect(
          () =>
            new SnowflakeManager(testTimestamp, {
              // @ts-expect-error
              extraField: "value",
            }),
        ).toThrow();
      });
    });

    describe("toString", () => {
      it("should return the snowflake as a string", () => {
        const manager = new SnowflakeManager(validSnowflake);
        expect(manager.toString()).toBe(validSnowflake);
      });
    });

    describe("toBigInt", () => {
      it("should return the snowflake as a BigInt", () => {
        const manager = new SnowflakeManager(validSnowflake);
        expect(manager.toBigInt()).toBe(BigInt(validSnowflake));
      });
    });

    describe("toDate", () => {
      it("should return a Date object representing the snowflake timestamp", () => {
        const manager = new SnowflakeManager(testTimestamp);
        const date = manager.toDate();
        expect(date).toBeInstanceOf(Date);
        expect(date.getTime()).toBe(testTimestamp);
      });
    });

    describe("getTimestamp", () => {
      it("should extract the timestamp from the snowflake", () => {
        // Create a snowflake with a known timestamp
        const manager = new SnowflakeManager(testTimestamp);
        expect(manager.getTimestamp()).toBe(testTimestamp);
      });
    });

    describe("getWorkerId", () => {
      it("should extract the worker ID from the snowflake", () => {
        const options = { workerId: 5 };
        const manager = new SnowflakeManager(testTimestamp, options);
        expect(manager.getWorkerId()).toBe(5);
      });

      it("should default to 0 if not specified", () => {
        const manager = new SnowflakeManager(testTimestamp);
        expect(manager.getWorkerId()).toBe(0);
      });
    });

    describe("getProcessId", () => {
      it("should extract the process ID from the snowflake", () => {
        const options = { processId: 10 };
        const manager = new SnowflakeManager(testTimestamp, options);
        expect(manager.getProcessId()).toBe(10);
      });

      it("should default to 0 if not specified", () => {
        const manager = new SnowflakeManager(testTimestamp);
        expect(manager.getProcessId()).toBe(0);
      });
    });

    describe("getIncrement", () => {
      it("should extract the increment value from the snowflake", () => {
        const options = { increment: 100 };
        const manager = new SnowflakeManager(testTimestamp, options);
        expect(manager.getIncrement()).toBe(100);
      });

      it("should default to 0 if not specified", () => {
        const manager = new SnowflakeManager(testTimestamp);
        expect(manager.getIncrement()).toBe(0);
      });
    });

    describe("deconstruct", () => {
      it("should deconstruct the snowflake into its components", () => {
        const options = { workerId: 5, processId: 10, increment: 100 };
        const manager = new SnowflakeManager(testTimestamp, options);
        const deconstructed = manager.deconstruct();

        expect(deconstructed).toEqual({
          timestamp: testTimestamp,
          workerId: 5,
          processId: 10,
          increment: 100,
          date: new Date(testTimestamp),
        });
      });
    });

    describe("compare", () => {
      it("should return 1 if this snowflake is newer", () => {
        const newer = new SnowflakeManager(testTimestamp + 1000);
        const older = new SnowflakeManager(testTimestamp);
        expect(newer.compare(older)).toBe(1);
      });

      it("should return -1 if this snowflake is older", () => {
        const newer = new SnowflakeManager(testTimestamp + 1000);
        const older = new SnowflakeManager(testTimestamp);
        expect(older.compare(newer)).toBe(-1);
      });

      it("should return 0 if snowflakes are equal", () => {
        const manager1 = new SnowflakeManager(testTimestamp);
        const manager2 = new SnowflakeManager(testTimestamp);
        expect(manager1.compare(manager2)).toBe(0);
      });

      it("should compare with other snowflake types", () => {
        const manager = new SnowflakeManager(testTimestamp);

        // Create another snowflake with a different timestamp
        const otherTime = testTimestamp + 1000;
        const otherManager = new SnowflakeManager(otherTime);

        expect(manager.compare(otherTime)).toBe(-1);
        expect(manager.compare(new Date(otherTime))).toBe(-1);
        expect(manager.compare(otherManager.toString())).toBe(-1);
      });
    });

    describe("isNewerThan", () => {
      it("should return true if this snowflake is newer", () => {
        const newer = new SnowflakeManager(testTimestamp + 1000);
        const older = new SnowflakeManager(testTimestamp);
        // @ts-expect-error
        expect(newer.isNewerThan(older)).toBe(true);
        // @ts-expect-error
        expect(older.isNewerThan(newer)).toBe(false);
      });
    });

    describe("isOlderThan", () => {
      it("should return true if this snowflake is older", () => {
        const newer = new SnowflakeManager(testTimestamp + 1000);
        const older = new SnowflakeManager(testTimestamp);
        // @ts-expect-error
        expect(older.isOlderThan(newer)).toBe(true);
        // @ts-expect-error
        expect(newer.isOlderThan(older)).toBe(false);
      });
    });

    describe("equals", () => {
      it("should return true if snowflakes are equal", () => {
        const manager1 = new SnowflakeManager(testTimestamp);
        const manager2 = new SnowflakeManager(testTimestamp);
        // @ts-expect-error
        expect(manager1.equals(manager2)).toBe(true);
      });

      it("should return false if snowflakes are different", () => {
        const manager1 = new SnowflakeManager(testTimestamp);
        const manager2 = new SnowflakeManager(testTimestamp + 1000);
        // @ts-expect-error
        expect(manager1.equals(manager2)).toBe(false);
      });

      it("should compare with different types", () => {
        const manager = new SnowflakeManager(testTimestamp);
        const sameTimestamp = new SnowflakeManager(testTimestamp);

        expect(manager.equals(sameTimestamp.toString())).toBe(true);
      });
    });
  });

  // Integration tests
  describe("integration", () => {
    it("should generate consistent snowflakes", () => {
      // Generate a snowflake with a timestamp and specific options
      const options = { workerId: 5, processId: 10, increment: 100 };
      const manager = new SnowflakeManager(testTimestamp, options);
      const snowflake = manager.toString();

      // Parse the generated snowflake back
      const parsed = new SnowflakeManager(snowflake);

      // Verify components are preserved
      expect(parsed.getTimestamp()).toBe(testTimestamp);
      expect(parsed.getWorkerId()).toBe(5);
      expect(parsed.getProcessId()).toBe(10);
      expect(parsed.getIncrement()).toBe(100);
    });

    it("should preserve millisecond precision in timestamps", () => {
      // Use a timestamp with millisecond precision
      const preciseTime = 1500000000123;
      const manager = new SnowflakeManager(preciseTime);

      // The timestamp should be preserved exactly
      expect(manager.getTimestamp()).toBe(preciseTime);
      expect(manager.toDate().getTime()).toBe(preciseTime);
    });

    it("should handle edge cases for worker and process IDs", () => {
      // Test max values
      const maxOptions = { workerId: 31, processId: 31, increment: 4095 };
      const manager = new SnowflakeManager(testTimestamp, maxOptions);

      expect(manager.getWorkerId()).toBe(31);
      expect(manager.getProcessId()).toBe(31);
      expect(manager.getIncrement()).toBe(4095);

      // Parse back and check
      const parsed = new SnowflakeManager(manager.toString());
      expect(parsed.getWorkerId()).toBe(31);
      expect(parsed.getProcessId()).toBe(31);
      expect(parsed.getIncrement()).toBe(4095);
    });
  });
});
