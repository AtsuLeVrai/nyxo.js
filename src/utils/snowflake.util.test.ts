import { describe, expect, it } from "vitest";
import { DISCORD_EPOCH, SnowflakeUtil } from "./snowflake.util.js";

describe("Snowflake Utilities", () => {
  // Test data - real Discord snowflakes with known timestamps
  const testCases = {
    // Early Discord era (around 2016) - smaller snowflake
    earliest: "123456789012345678",
    // Mid Discord era (around 2018-2019) - medium snowflake
    recent: "456789012345678901",
    // Current era snowflake (2020+) - larger snowflake
    current: "789012345678901234",
  } as const;

  describe("Constants", () => {
    it("should have correct Discord epoch timestamp", () => {
      expect(DISCORD_EPOCH).toBe(1420070400000n);
      expect(new Date(Number(DISCORD_EPOCH)).toISOString()).toBe("2015-01-01T00:00:00.000Z");
    });
  });

  describe("isValid", () => {
    it("should validate correct snowflake formats", () => {
      // 17-digit snowflake
      expect(SnowflakeUtil.isValid("12345678901234567")).toBe(true);

      // 18-digit snowflake
      expect(SnowflakeUtil.isValid("123456789012345678")).toBe(true);

      // 19-digit snowflake
      expect(SnowflakeUtil.isValid("1234567890123456789")).toBe(true);

      // 20-digit snowflake
      expect(SnowflakeUtil.isValid("12345678901234567890")).toBe(true);
    });

    it("should reject invalid snowflake formats", () => {
      // Too short
      expect(SnowflakeUtil.isValid("1234567890123456")).toBe(false);

      // Too long
      expect(SnowflakeUtil.isValid("123456789012345678901")).toBe(false);

      // Contains non-digits
      expect(SnowflakeUtil.isValid("12345678901234567a")).toBe(false);
      expect(SnowflakeUtil.isValid("12345678901234567-")).toBe(false);
      expect(SnowflakeUtil.isValid("12345678901234567.")).toBe(false);

      // Empty string
      expect(SnowflakeUtil.isValid("")).toBe(false);

      // Only letters
      expect(SnowflakeUtil.isValid("abcdefghijklmnopq")).toBe(false);

      // Mixed valid length but invalid characters
      expect(SnowflakeUtil.isValid("123456789012345abc")).toBe(false);
    });
  });

  describe("toTimestamp", () => {
    it("should convert snowflake to correct timestamp", () => {
      const snowflake = "175928847299117063";
      const expectedTimestamp = 1420070400000; // Discord epoch

      const result = SnowflakeUtil.toTimestamp(snowflake);
      expect(result).toBeGreaterThanOrEqual(expectedTimestamp);
      expect(typeof result).toBe("number");
    });

    it("should handle large snowflakes correctly", () => {
      const largeSnowflake = "1234567890123456789";
      const result = SnowflakeUtil.toTimestamp(largeSnowflake);

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(Number(DISCORD_EPOCH));
    });

    it("should throw Error for invalid BigInt conversion", () => {
      expect(() => SnowflakeUtil.toTimestamp("invalid")).toThrow(Error);
      expect(() => SnowflakeUtil.toTimestamp("abc123")).toThrow(Error);
    });

    it("should produce consistent results for same snowflake", () => {
      const snowflake = testCases.recent;
      const result1 = SnowflakeUtil.toTimestamp(snowflake);
      const result2 = SnowflakeUtil.toTimestamp(snowflake);

      expect(result1).toBe(result2);
    });
  });

  describe("toDate", () => {
    it("should convert snowflake to valid Date object", () => {
      const snowflake = testCases.recent;
      const result = SnowflakeUtil.toDate(snowflake);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(Number(DISCORD_EPOCH));
      expect(Number.isNaN(result.getTime())).toBe(false);
    });

    it("should create Date matching timestamp conversion", () => {
      const snowflake = testCases.current;
      const timestamp = SnowflakeUtil.toTimestamp(snowflake);
      const dateFromSnowflake = SnowflakeUtil.toDate(snowflake);
      const dateFromTimestamp = new Date(timestamp);

      expect(dateFromSnowflake.getTime()).toBe(dateFromTimestamp.getTime());
    });

    it("should throw Error for invalid snowflakes", () => {
      expect(() => SnowflakeUtil.toDate("invalid")).toThrow(Error);
      expect(() => SnowflakeUtil.toDate("not_a_number")).toThrow(Error);
    });
  });

  describe("age", () => {
    it("should calculate positive age for old snowflakes", () => {
      const snowflake = testCases.earliest;
      const result = SnowflakeUtil.age(snowflake);

      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
    });

    it("should return age in milliseconds", () => {
      const snowflake = testCases.recent;
      const snowflakeTime = SnowflakeUtil.toTimestamp(snowflake);
      const expectedAge = Date.now() - snowflakeTime;
      const actualAge = SnowflakeUtil.age(snowflake);

      // Allow small time difference due to execution time
      expect(Math.abs(actualAge - expectedAge)).toBeLessThan(100);
    });

    it("should handle recent snowflakes", () => {
      const snowflake = testCases.current;
      const result = SnowflakeUtil.age(snowflake);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should throw Error for invalid snowflakes", () => {
      expect(() => SnowflakeUtil.age("invalid")).toThrow(Error);
      expect(() => SnowflakeUtil.age("abc")).toThrow(Error);
    });
  });

  describe("isOlderThan", () => {
    it("should correctly identify old snowflakes", () => {
      const snowflake = testCases.earliest;
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      expect(SnowflakeUtil.isOlderThan(snowflake, oneHour)).toBe(true);
    });

    it("should correctly identify recent snowflakes", () => {
      const snowflake = testCases.current;
      const tenYears = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years

      expect(SnowflakeUtil.isOlderThan(snowflake, tenYears)).toBe(false);
    });

    it("should handle edge cases with zero threshold", () => {
      const snowflake = testCases.recent;
      const result = SnowflakeUtil.isOlderThan(snowflake, 0);

      expect(typeof result).toBe("boolean");
      expect(result).toBe(true); // Any snowflake should be older than 0ms
    });

    it("should handle negative thresholds", () => {
      const snowflake = testCases.recent;
      const result = SnowflakeUtil.isOlderThan(snowflake, -1000);

      expect(result).toBe(true);
    });

    it("should throw Error for invalid snowflakes", () => {
      expect(() => SnowflakeUtil.isOlderThan("invalid", 1000)).toThrow(Error);
    });
  });

  describe("compare", () => {
    it("should return negative when first snowflake is older", () => {
      const snowflakeA = testCases.earliest;
      const snowflakeB = testCases.current;

      // Determine which is actually older by timestamp
      const timestampA = SnowflakeUtil.toTimestamp(snowflakeA);
      const timestampB = SnowflakeUtil.toTimestamp(snowflakeB);

      const [older, newer] =
        timestampA < timestampB ? [snowflakeA, snowflakeB] : [snowflakeB, snowflakeA];

      const result = SnowflakeUtil.compare(older, newer);
      expect(result).toBeLessThan(0);
    });

    it("should return positive when first snowflake is newer", () => {
      const snowflakeA = testCases.earliest;
      const snowflakeB = testCases.current;

      // Determine which is actually older by timestamp
      const timestampA = SnowflakeUtil.toTimestamp(snowflakeA);
      const timestampB = SnowflakeUtil.toTimestamp(snowflakeB);

      const [older, newer] =
        timestampA < timestampB ? [snowflakeA, snowflakeB] : [snowflakeB, snowflakeA];

      const result = SnowflakeUtil.compare(newer, older);
      expect(result).toBeGreaterThan(0);
    });

    it("should return zero for identical snowflakes", () => {
      const snowflake = testCases.recent;

      const result = SnowflakeUtil.compare(snowflake, snowflake);
      expect(result).toBe(0);
    });

    it("should be consistent with timestamp comparison", () => {
      const snowflakeA = testCases.earliest;
      const snowflakeB = testCases.recent;

      const timestampA = SnowflakeUtil.toTimestamp(snowflakeA);
      const timestampB = SnowflakeUtil.toTimestamp(snowflakeB);

      const snowflakeComparison = SnowflakeUtil.compare(snowflakeA, snowflakeB);
      const timestampComparison = timestampA - timestampB;

      expect(Math.sign(snowflakeComparison)).toBe(Math.sign(timestampComparison));
    });

    it("should work with snowflakes of different lengths", () => {
      const shorter = "12345678901234567"; // 17 digits
      const longer = "1234567890123456789"; // 19 digits

      const result = SnowflakeUtil.compare(shorter, longer);
      expect(typeof result).toBe("number");
    });

    it("should throw Error for invalid snowflakes", () => {
      const validSnowflake = testCases.recent;

      expect(() => SnowflakeUtil.compare("invalid", validSnowflake)).toThrow(Error);
      expect(() => SnowflakeUtil.compare(validSnowflake, "invalid")).toThrow(Error);
      expect(() => SnowflakeUtil.compare("invalid1", "invalid2")).toThrow(Error);
    });
  });

  describe("Integration tests", () => {
    it("should work with real Discord snowflake workflow", () => {
      const messageId = "123456789012345678";

      // Validate the snowflake
      expect(SnowflakeUtil.isValid(messageId)).toBe(true);

      // Get creation timestamp
      const timestamp = SnowflakeUtil.toTimestamp(messageId);
      expect(timestamp).toBeGreaterThan(Number(DISCORD_EPOCH));

      // Convert to Date
      const date = SnowflakeUtil.toDate(messageId);
      expect(date.getTime()).toBe(timestamp);

      // Check age
      const age = SnowflakeUtil.age(messageId);
      expect(age).toBeGreaterThan(0);

      // Check if older than 1 minute
      const oneMinute = 60 * 1000;
      const isOld = SnowflakeUtil.isOlderThan(messageId, oneMinute);
      expect(typeof isOld).toBe("boolean");
    });

    it("should handle sorting multiple snowflakes", () => {
      const snowflakes = [testCases.current, testCases.earliest, testCases.recent];

      const sorted = [...snowflakes].sort(SnowflakeUtil.compare);

      // Verify chronological order
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (current && next) {
          expect(SnowflakeUtil.compare(current, next)).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});
