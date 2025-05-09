import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISCORD_EPOCH, SnowflakeUtil } from "../src/index.js";

describe("SnowflakeUtil", () => {
  // We need to mock Date.now() to make the tests deterministic
  let originalDateNow: typeof Date.now;

  // Fixed timestamp for testing (May 2, 2021 @ 12:00:00 UTC)
  const fixedTimestamp = 1619957200000;

  beforeEach(() => {
    // Save the original Date.now
    originalDateNow = Date.now;

    // Mock Date.now to return our fixed timestamp
    Date.now = vi.fn(() => fixedTimestamp);
  });

  afterEach(() => {
    // Restore the original Date.now
    Date.now = originalDateNow;
  });

  describe("isValid", () => {
    it("returns true for valid snowflakes", () => {
      expect(SnowflakeUtil.isValid("730029344193249310")).toBe(true);
      expect(SnowflakeUtil.isValid("730029344193249310")).toBe(true);
      expect(SnowflakeUtil.isValid("730029344193249310")).toBe(true);
    });

    it("returns false for invalid snowflakes", () => {
      expect(SnowflakeUtil.isValid("not-a-snowflake")).toBe(false);
      expect(SnowflakeUtil.isValid("12345")).toBe(false); // Too short
      expect(SnowflakeUtil.isValid("123abc456789012345")).toBe(false); // Contains non-digits
      expect(SnowflakeUtil.isValid("")).toBe(false); // Empty string
    });

    it("returns false for undefined or null", () => {
      expect(SnowflakeUtil.isValid(undefined as unknown as string)).toBe(false);
      expect(SnowflakeUtil.isValid(null as unknown as string)).toBe(false);
    });
  });

  describe("deconstruct", () => {
    it("correctly deconstructs a known snowflake", () => {
      // This is a known snowflake with specific values
      const snowflake = "730029344193249310";
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.timestamp).toBe(1594122958945);
      expect(deconstructed.workerId).toBe(0);
      expect(deconstructed.processId).toBe(0);
      expect(deconstructed.increment).toBe(30);
      expect(deconstructed.date).toBeInstanceOf(Date);
      expect(deconstructed.date.getTime()).toBe(1594122958945);
    });

    it("handles different snowflakes with different internal values", () => {
      const snowflake1 = "730029344193249310"; // Known values from earlier test
      const snowflake2 = "730029344193249311"; // Increment is 1 higher

      const deconstructed1 = SnowflakeUtil.deconstruct(snowflake1);
      const deconstructed2 = SnowflakeUtil.deconstruct(snowflake2);

      expect(deconstructed1.increment).toBe(30);
      expect(deconstructed2.increment).toBe(31);
      expect(deconstructed1.timestamp).toBe(deconstructed2.timestamp);
    });

    it("correctly handles snowflakes at the limits of the bit ranges", () => {
      // All bits in each field set to 1
      // 42 timestamp bits, 5 worker bits, 5 process bits, 12 increment bits

      // First, create a bigint with all bits set to 1
      const allOnes = 0xffffffffffffn; // 2^48 - 1

      // Then extract the values we need
      const timestampBits = (allOnes >> 22n) * BigInt(1);
      const workerIdBits = ((allOnes & 0x3e0000n) >> 17n) * BigInt(1);
      const processIdBits = ((allOnes & 0x1f000n) >> 12n) * BigInt(1);
      const incrementBits = (allOnes & 0xfffn) * BigInt(1);

      // Construct our extreme snowflake and convert to string
      const extremeSnowflake = allOnes.toString();

      // Deconstruct and check values
      const deconstructed = SnowflakeUtil.deconstruct(extremeSnowflake);

      // Calculate expected timestamp (DISCORD_EPOCH + timestampBits)
      const expectedTimestamp = Number(timestampBits) + DISCORD_EPOCH;

      expect(deconstructed.timestamp).toBe(expectedTimestamp);
      expect(deconstructed.workerId).toBe(Number(workerIdBits));
      expect(deconstructed.processId).toBe(Number(processIdBits));
      expect(deconstructed.increment).toBe(Number(incrementBits));
    });
  });

  describe("getTimestamp", () => {
    it("returns the correct timestamp for a known snowflake", () => {
      const snowflake = "730029344193249310";
      const timestamp = SnowflakeUtil.getTimestamp(snowflake);

      expect(timestamp).toBe(1594122958945);
    });

    it("returns timestamp consistent with deconstruct method", () => {
      const snowflake = "730029344193249310";
      const timestamp = SnowflakeUtil.getTimestamp(snowflake);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(timestamp).toBe(deconstructed.timestamp);
    });
  });

  describe("getDate", () => {
    it("returns a Date object with the correct timestamp", () => {
      const snowflake = "730029344193249310";
      const date = SnowflakeUtil.getDate(snowflake);

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(1594122958945);
    });

    it("returns a date consistent with deconstruct method", () => {
      const snowflake = "730029344193249310";
      const date = SnowflakeUtil.getDate(snowflake);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(date.getTime()).toBe(deconstructed.date.getTime());
    });
  });

  describe("generate", () => {
    it("generates a snowflake with the current timestamp when no arguments are provided", () => {
      const snowflake = SnowflakeUtil.generate();
      const timestamp = SnowflakeUtil.getTimestamp(snowflake);

      // Should be close to our mocked Date.now()
      expect(timestamp).toBe(fixedTimestamp);
    });

    it("generates a snowflake with a custom timestamp", () => {
      const customTimestamp = 1500000000000; // 2017-07-14T02:40:00.000Z
      const snowflake = SnowflakeUtil.generate(customTimestamp);
      const extractedTimestamp = SnowflakeUtil.getTimestamp(snowflake);

      expect(extractedTimestamp).toBe(customTimestamp);
    });

    it("generates a snowflake with a Date object", () => {
      const customDate = new Date("2017-07-14T02:40:00.000Z");
      const snowflake = SnowflakeUtil.generate(customDate);
      const extractedTimestamp = SnowflakeUtil.getTimestamp(snowflake);

      expect(extractedTimestamp).toBe(customDate.getTime());
    });

    it("generates a snowflake with custom increment", () => {
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 42);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.increment).toBe(42);
    });

    it("generates a snowflake with custom worker ID", () => {
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 0, 5);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.workerId).toBe(5);
    });

    it("generates a snowflake with custom process ID", () => {
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 0, 1, 7);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.processId).toBe(7);
    });

    it("masks worker ID to 5 bits (0-31)", () => {
      // Value 33 should be masked to 1 (33 & 0x1f = 1)
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 0, 33);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.workerId).toBe(1);
    });

    it("masks process ID to 5 bits (0-31)", () => {
      // Value 33 should be masked to 1 (33 & 0x1f = 1)
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 0, 1, 33);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.processId).toBe(1);
    });

    it("masks increment to 12 bits (0-4095)", () => {
      // Value 5000 should be masked to 904 (5000 & 0xfff = 904)
      const snowflake = SnowflakeUtil.generate(fixedTimestamp, 5000);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      expect(deconstructed.increment).toBe(5000 & 0xfff);
    });

    it("adjusts timestamp to be relative to Discord epoch", () => {
      // Use a timestamp before the Discord epoch
      const preEpochTimestamp = DISCORD_EPOCH - 1000; // 1 second before Discord epoch
      const snowflake = SnowflakeUtil.generate(preEpochTimestamp);
      const deconstructed = SnowflakeUtil.deconstruct(snowflake);

      // Timestamp should be adjusted to be relative to Discord epoch
      expect(deconstructed.timestamp).toBe(preEpochTimestamp);

      // The timestamp bits in the snowflake should be very small
      // (almost 0, but not exactly because of the 1 second difference)
      const timestampBits = BigInt(snowflake) >> 22n;
      expect(Number(timestampBits)).toBe(-1000); // -1 second in ms = -1000, which is -1 in the snowflake
    });
  });

  describe("generateFromReference", () => {
    it("generates a snowflake 1 hour after the reference", () => {
      const referenceId = "730029344193249310"; // timestamp: 1594122958945
      const oneHourInMs = 3600000;

      const afterId = SnowflakeUtil.generateFromReference(
        referenceId,
        oneHourInMs,
      );
      const afterTimestamp = SnowflakeUtil.getTimestamp(afterId);

      expect(afterTimestamp).toBe(1594122958945 + oneHourInMs);
    });

    it("generates a snowflake 1 hour before the reference", () => {
      const referenceId = "730029344193249310"; // timestamp: 1462886490875
      const oneHourInMs = -3600000; // Negative for "before"

      const beforeId = SnowflakeUtil.generateFromReference(
        referenceId,
        oneHourInMs,
      );
      const beforeTimestamp = SnowflakeUtil.getTimestamp(beforeId);

      expect(beforeTimestamp).toBe(1594122958945 + oneHourInMs);
    });
  });

  describe("compare", () => {
    it("returns a negative number when the first snowflake is older", () => {
      const older = SnowflakeUtil.generate(1500000000000); // 2017-07-14
      const newer = SnowflakeUtil.generate(1600000000000); // 2020-09-13

      const result = SnowflakeUtil.compare(older, newer);
      expect(result).toBeLessThan(0);
    });

    it("returns a positive number when the first snowflake is newer", () => {
      const older = SnowflakeUtil.generate(1500000000000); // 2017-07-14
      const newer = SnowflakeUtil.generate(1600000000000); // 2020-09-13

      const result = SnowflakeUtil.compare(newer, older);
      expect(result).toBeGreaterThan(0);
    });

    it("returns zero when the snowflakes have the same timestamp", () => {
      // Same timestamp but different increment/worker/process IDs
      const first = SnowflakeUtil.generate(1500000000000, 1);
      const second = SnowflakeUtil.generate(1500000000000, 2);

      const result = SnowflakeUtil.compare(first, second);
      expect(result).toBe(0);
    });
  });

  describe("timeBetween", () => {
    it("returns the time difference between two snowflakes", () => {
      const oneHourInMs = 3600000;
      const first = SnowflakeUtil.generate(1500000000000); // Base timestamp
      const second = SnowflakeUtil.generate(1500000000000 + oneHourInMs); // 1 hour later

      const difference = SnowflakeUtil.timeBetween(first, second);
      expect(difference).toBe(oneHourInMs);
    });

    it("returns a positive value regardless of snowflake order", () => {
      const oneHourInMs = 3600000;
      const first = SnowflakeUtil.generate(1500000000000);
      const second = SnowflakeUtil.generate(1500000000000 + oneHourInMs);

      // Order shouldn't matter
      const difference1 = SnowflakeUtil.timeBetween(first, second);
      const difference2 = SnowflakeUtil.timeBetween(second, first);

      expect(difference1).toBe(oneHourInMs);
      expect(difference2).toBe(oneHourInMs);
    });
  });

  describe("isOlderThan", () => {
    it("returns true when the snowflake is older than the date", () => {
      const snowflake = SnowflakeUtil.generate(1500000000000); // 2017-07-14
      const laterDate = new Date(1600000000000); // 2020-09-13

      expect(SnowflakeUtil.isOlderThan(snowflake, laterDate)).toBe(true);
    });

    it("returns false when the snowflake is newer than the date", () => {
      const snowflake = SnowflakeUtil.generate(1600000000000); // 2020-09-13
      const earlierDate = new Date(1500000000000); // 2017-07-14

      expect(SnowflakeUtil.isOlderThan(snowflake, earlierDate)).toBe(false);
    });
  });

  describe("isNewerThan", () => {
    it("returns true when the snowflake is newer than the date", () => {
      const snowflake = SnowflakeUtil.generate(1600000000000); // 2020-09-13
      const earlierDate = new Date(1500000000000); // 2017-07-14

      expect(SnowflakeUtil.isNewerThan(snowflake, earlierDate)).toBe(true);
    });

    it("returns false when the snowflake is older than the date", () => {
      const snowflake = SnowflakeUtil.generate(1500000000000); // 2017-07-14
      const laterDate = new Date(1600000000000); // 2020-09-13

      expect(SnowflakeUtil.isNewerThan(snowflake, laterDate)).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("formats in short format", () => {
      // Create a snowflake for a specific date: Jan 5, 2020
      const snowflake = SnowflakeUtil.generate(new Date(2020, 0, 5).getTime());

      const formatted = SnowflakeUtil.formatDate(snowflake, "short");
      expect(formatted).toBe("1/5/2020");
    });

    it("formats in long format", () => {
      // Mock toLocaleDateString to ensure consistent test results regardless of locale
      const originalToLocaleDate = Date.prototype.toLocaleDateString;
      Date.prototype.toLocaleDateString = () => "January 5, 2020";

      const snowflake = SnowflakeUtil.generate(new Date(2020, 0, 5).getTime());

      const formatted = SnowflakeUtil.formatDate(snowflake, "long");
      expect(formatted).toBe("January 5, 2020");

      // Restore original method
      Date.prototype.toLocaleDateString = originalToLocaleDate;
    });

    it("formats in relative format", () => {
      // Set Date.now() to a fixed point in time (May 2, 2021)
      // Our snowflake will be from Jan 1, 2021, so it should be "4 months ago"

      const snowflake = SnowflakeUtil.generate(new Date(2021, 0, 1).getTime());

      const formatted = SnowflakeUtil.formatDate(snowflake, "relative");
      expect(formatted).toBe("4 months ago");
    });

    it("formats in ISO format", () => {
      const specificDate = new Date(2020, 0, 5, 12, 30, 45, 500);
      const snowflake = SnowflakeUtil.generate(specificDate.getTime());

      const formatted = SnowflakeUtil.formatDate(snowflake, "iso");
      expect(formatted).toBe(specificDate.toISOString());
    });

    it("uses long format by default", () => {
      // Mock toLocaleDateString again
      const originalToLocaleDate = Date.prototype.toLocaleDateString;
      Date.prototype.toLocaleDateString = () => "January 5, 2020";

      const snowflake = SnowflakeUtil.generate(new Date(2020, 0, 5).getTime());

      const formatted = SnowflakeUtil.formatDate(snowflake);
      expect(formatted).toBe("January 5, 2020");

      // Restore original method
      Date.prototype.toLocaleDateString = originalToLocaleDate;
    });

    it("handles different relative time ranges properly", () => {
      // Mock Date.now() to return a fixed date for testing relative times
      const now = new Date(2021, 4, 2, 12, 0, 0).getTime(); // May 2, 2021 @ 12:00:00
      Date.now = vi.fn(() => now);

      // Test seconds ago
      const secondsAgo = SnowflakeUtil.generate(now - 30 * 1000); // 30 seconds ago
      expect(SnowflakeUtil.formatDate(secondsAgo, "relative")).toBe(
        "30 seconds ago",
      );

      // Test 1 second ago (singular)
      const oneSecondAgo = SnowflakeUtil.generate(now - 1 * 1000);
      expect(SnowflakeUtil.formatDate(oneSecondAgo, "relative")).toBe(
        "1 second ago",
      );

      // Test minutes ago
      const minutesAgo = SnowflakeUtil.generate(now - 5 * 60 * 1000); // 5 minutes ago
      expect(SnowflakeUtil.formatDate(minutesAgo, "relative")).toBe(
        "5 minutes ago",
      );

      // Test 1 minute ago (singular)
      const oneMinuteAgo = SnowflakeUtil.generate(now - 1 * 60 * 1000);
      expect(SnowflakeUtil.formatDate(oneMinuteAgo, "relative")).toBe(
        "1 minute ago",
      );

      // Test hours ago
      const hoursAgo = SnowflakeUtil.generate(now - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(SnowflakeUtil.formatDate(hoursAgo, "relative")).toBe(
        "3 hours ago",
      );

      // Test 1 hour ago (singular)
      const oneHourAgo = SnowflakeUtil.generate(now - 1 * 60 * 60 * 1000);
      expect(SnowflakeUtil.formatDate(oneHourAgo, "relative")).toBe(
        "1 hour ago",
      );

      // Test days ago
      const daysAgo = SnowflakeUtil.generate(now - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      expect(SnowflakeUtil.formatDate(daysAgo, "relative")).toBe("2 days ago");

      // Test 1 day ago (singular)
      const oneDayAgo = SnowflakeUtil.generate(now - 1 * 24 * 60 * 60 * 1000);
      expect(SnowflakeUtil.formatDate(oneDayAgo, "relative")).toBe("1 day ago");

      // Test years ago
      const yearsAgo = SnowflakeUtil.generate(
        now - 2 * 365 * 24 * 60 * 60 * 1000,
      ); // ~2 years ago
      expect(SnowflakeUtil.formatDate(yearsAgo, "relative")).toBe(
        "2 years ago",
      );

      // Test 1 year ago (singular)
      const oneYearAgo = SnowflakeUtil.generate(
        now - 1 * 365 * 24 * 60 * 60 * 1000,
      );
      expect(SnowflakeUtil.formatDate(oneYearAgo, "relative")).toBe(
        "1 year ago",
      );
    });
  });

  describe("Real-world Usage Examples", () => {
    it("demonstrates a paginated collection using snowflakes", () => {
      // Set a fixed timestamp for tests
      const baseTime = 1600000000000; // Sunday, September 13, 2020 12:26:40 PM

      // Create 5 items with timestamps 1 minute apart
      const items = [
        {
          id: SnowflakeUtil.generate(baseTime + 4 * 60 * 1000),
          content: "Item 5",
        },
        {
          id: SnowflakeUtil.generate(baseTime + 3 * 60 * 1000),
          content: "Item 4",
        },
        {
          id: SnowflakeUtil.generate(baseTime + 2 * 60 * 1000),
          content: "Item 3",
        },
        {
          id: SnowflakeUtil.generate(baseTime + 1 * 60 * 1000),
          content: "Item 2",
        },
        { id: SnowflakeUtil.generate(baseTime), content: "Item 1" },
      ];

      // Sort items by snowflake (newest first)
      const sortedBySnowflake = [...items].sort((a, b) =>
        SnowflakeUtil.compare(b.id, a.id),
      );

      // Check that items are sorted correctly
      expect(sortedBySnowflake[0]?.content).toBe("Item 5");
      expect(sortedBySnowflake[4]?.content).toBe("Item 1");

      // Implement pagination
      function getMessagesBeforeId(snowflake: string, limit = 2) {
        return items
          .filter((item) => SnowflakeUtil.compare(item.id, snowflake) < 0)
          .sort((a, b) => SnowflakeUtil.compare(b.id, a.id))
          .slice(0, limit);
      }

      // Get the first page (before the newest item)
      const page1 = getMessagesBeforeId((items[0] as { id: string }).id);
      expect(page1).toHaveLength(2);
      expect(page1[0]?.content).toBe("Item 4");
      expect(page1[1]?.content).toBe("Item 3");

      // Get the second page
      const page2 = getMessagesBeforeId((page1[1] as { id: string }).id);
      expect(page2).toHaveLength(2);
      expect(page2[0]?.content).toBe("Item 2");
      expect(page2[1]?.content).toBe("Item 1");
    });

    it("demonstrates using snowflakes for ordering and uniqueness", () => {
      // Set a fixed timestamp for tests
      const baseTime = 1600000000000;

      // Generate multiple snowflakes at the same millisecond with different increments
      const sf1 = SnowflakeUtil.generate(baseTime, 1);
      const sf2 = SnowflakeUtil.generate(baseTime, 2);
      const sf3 = SnowflakeUtil.generate(baseTime, 3);

      // They should have the same timestamp
      expect(SnowflakeUtil.getTimestamp(sf1)).toBe(
        SnowflakeUtil.getTimestamp(sf2),
      );
      expect(SnowflakeUtil.getTimestamp(sf2)).toBe(
        SnowflakeUtil.getTimestamp(sf3),
      );

      // But they should be different snowflakes
      expect(sf1).not.toBe(sf2);
      expect(sf2).not.toBe(sf3);
      expect(sf1).not.toBe(sf3);

      // And they should sort correctly when converted to bigints
      const sorted = [sf3, sf1, sf2].sort((a, b) =>
        Number(BigInt(a) - BigInt(b)),
      );

      expect(sorted[0]).toBe(sf1);
      expect(sorted[1]).toBe(sf2);
      expect(sorted[2]).toBe(sf3);
    });

    it("demonstrates extracting creation time from entity IDs", () => {
      // In Discord, all entities (users, channels, messages, etc.) have snowflake IDs
      // that encode their creation time

      // Let's simulate a Discord message
      const messageId = "730029344193249310"; // Your Discord ID

      // Extract the creation time
      const creationDate = SnowflakeUtil.getDate(messageId);

      // Check that the creation date is what we expect
      expect(creationDate.getFullYear()).toBe(2020); // This message is from 2020

      // We could implement a function to check if an account is suspicious based on age
      function isRecentAccount(userId: string, maxAgeDays = 30): boolean {
        const now = Date.now();
        const accountCreation = SnowflakeUtil.getTimestamp(userId);
        const ageInDays = (now - accountCreation) / (1000 * 60 * 60 * 24);
        return ageInDays <= maxAgeDays;
      }

      // Test with a very old account
      expect(isRecentAccount(messageId)).toBe(false);

      // Test with an account created just now
      const newAccountId = SnowflakeUtil.generate();
      expect(isRecentAccount(newAccountId)).toBe(true);
    });
  });
});
