import { beforeEach, describe, expect, it, vi } from "vitest";
import { sleep } from "./sleep.util.js";

describe("Sleep Utility", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it("should return a Promise", () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });

  it("should resolve immediately for zero duration", async () => {
    const startTime = Date.now();
    await sleep(0);
    const endTime = Date.now();

    // Should complete almost instantly (allow 5ms tolerance for execution)
    expect(endTime - startTime).toBeLessThan(5);
  });

  it("should resolve immediately for negative duration", async () => {
    const startTime = Date.now();
    await sleep(-100);
    const endTime = Date.now();

    // Should complete almost instantly
    expect(endTime - startTime).toBeLessThan(5);
  });

  it("should wait approximately the specified duration", async () => {
    const duration = 50;
    const startTime = Date.now();

    await sleep(duration);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    // Allow 10ms tolerance for timer precision
    expect(actualDuration).toBeGreaterThanOrEqual(duration - 5);
    expect(actualDuration).toBeLessThan(duration + 15);
  });

  it("should handle multiple concurrent sleeps", async () => {
    const duration = 30;
    const startTime = Date.now();

    const promises = [sleep(duration), sleep(duration), sleep(duration)];

    await Promise.all(promises);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    // All should complete around the same time (concurrent, not sequential)
    expect(actualDuration).toBeLessThan(duration + 20);
  });

  it("should resolve with void", async () => {
    const result = await sleep(1);
    expect(result).toBeUndefined();
  });

  it("should work with fractional milliseconds", async () => {
    const duration = 10.5;
    const startTime = Date.now();

    await sleep(duration);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    expect(actualDuration).toBeGreaterThanOrEqual(Math.floor(duration) - 2);
  });
});
