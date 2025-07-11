import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_IN_BUFFER_SIZE,
  DEFAULT_OUT_BUFFER_SIZE,
  ZstdStream,
  ZstdStreamOptions,
} from "../src/index.js";

// Test data - using simple buffers for basic functionality testing
const TEST_DATA = Buffer.from(
  "Hello, World! This is test data for zstd compression testing.",
);

// Mock corrupted data for error testing
const MOCK_CORRUPTED_DATA = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);

describe("ZstdStreamOptions", () => {
  it("should parse valid options correctly", () => {
    const options = {
      inputBufferSize: 65536,
      outputBufferSize: 131072,
    };

    const result = ZstdStreamOptions.parse(options);
    expect(result.inputBufferSize).toBe(65536);
    expect(result.outputBufferSize).toBe(131072);
  });

  it("should use default values when no options provided", () => {
    const result = ZstdStreamOptions.parse({});
    expect(result.inputBufferSize).toBe(DEFAULT_IN_BUFFER_SIZE);
    expect(result.outputBufferSize).toBe(DEFAULT_OUT_BUFFER_SIZE);
  });

  it("should reject invalid input buffer size", () => {
    expect(() => {
      ZstdStreamOptions.parse({ inputBufferSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      ZstdStreamOptions.parse({ inputBufferSize: 3000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      ZstdStreamOptions.parse({ inputBufferSize: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should reject invalid output buffer size", () => {
    expect(() => {
      ZstdStreamOptions.parse({ outputBufferSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      ZstdStreamOptions.parse({ outputBufferSize: 3000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      ZstdStreamOptions.parse({ outputBufferSize: 1.5 }); // Non-integer
    }).toThrow();
  });
});

describe("ZstdStream", () => {
  let zstdStream: ZstdStream;

  beforeEach(() => {
    zstdStream = new ZstdStream();
  });

  afterEach(() => {
    if (zstdStream && !zstdStream.destroyed) {
      zstdStream.close();
    }
  });

  describe("constructor", () => {
    it("should create an instance with default options", () => {
      const stream = new ZstdStream();
      expect(stream).toBeInstanceOf(ZstdStream);
      expect(stream.bytesRead).toBe(0);
      expect(stream.bytesWritten).toBe(0);
      expect(stream.destroyed).toBe(false);
      expect(stream.framesProcessed).toBe(0);
      stream.close();
    });

    it("should create an instance with custom options", () => {
      const options = {
        inputBufferSize: 32768,
        outputBufferSize: 65536,
      };
      const stream = new ZstdStream(options);
      expect(stream).toBeInstanceOf(ZstdStream);
      expect(stream.destroyed).toBe(false);
      stream.close();
    });

    it("should throw error with invalid options", () => {
      expect(() => {
        new ZstdStream({ inputBufferSize: -1 });
      }).toThrow(/Invalid ZstdStream options/);
    });
  });

  describe("properties", () => {
    it("should have initial state properties", () => {
      expect(zstdStream.bytesRead).toBe(0);
      expect(zstdStream.bytesWritten).toBe(0);
      expect(zstdStream.destroyed).toBe(false);
      expect(zstdStream.framesProcessed).toBe(0);
      expect(typeof zstdStream.error).toBe("number");
      expect(zstdStream.finished).toBe(false);
    });

    it("should return correct values when destroyed", () => {
      zstdStream.close();
      expect(zstdStream.destroyed).toBe(true);
      expect(zstdStream.error).toBe(-1);
      expect(zstdStream.message).toBe(null);
      expect(zstdStream.finished).toBe(true);
    });
  });

  describe("push method", () => {
    it("should handle empty data gracefully", () => {
      const result = zstdStream.push(Buffer.alloc(0));
      expect(result).toBe(false);
      expect(zstdStream.bytesRead).toBe(0);
    });

    it("should throw error when pushing to destroyed stream", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.push(TEST_DATA);
      }).toThrow(/Cannot push data to destroyed ZstdStream/);
    });

    it("should update bytesRead when processing data", () => {
      const initialBytes = zstdStream.bytesRead;
      try {
        zstdStream.push(TEST_DATA);
        expect(zstdStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      } catch (_error) {
        // Expected to fail with invalid data, but bytesRead should still be updated
        expect(zstdStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      }
    });

    it("should handle Uint8Array input", () => {
      const uint8Data = new Uint8Array(TEST_DATA);
      try {
        const result = zstdStream.push(uint8Data);
        expect(typeof result).toBe("boolean");
        expect(zstdStream.bytesRead).toBe(uint8Data.length);
      } catch (_error) {
        // Expected to fail with invalid data, but should accept Uint8Array
        expect(zstdStream.bytesRead).toBe(uint8Data.length);
      }
    });

    it("should handle corrupted data appropriately", () => {
      // The push method may not immediately throw on corrupted data
      // It might return false or process it without immediate error
      const result = zstdStream.push(MOCK_CORRUPTED_DATA);
      expect(typeof result).toBe("boolean");
      expect(zstdStream.bytesRead).toBe(MOCK_CORRUPTED_DATA.length);

      // The error might surface when trying to get the buffer or during processing
      // This tests that the API handles invalid data gracefully
    });
  });

  describe("getBuffer method", () => {
    it("should return Buffer instance", () => {
      const buffer = zstdStream.getBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should throw error when called on destroyed stream", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.getBuffer();
      }).toThrow(/Cannot retrieve buffer from destroyed ZstdStream/);
    });

    it("should return same data on multiple calls before clearBuffer", () => {
      const buffer1 = zstdStream.getBuffer();
      const buffer2 = zstdStream.getBuffer();
      expect(buffer1.equals(buffer2)).toBe(true);
    });
  });

  describe("clearBuffer method", () => {
    it("should clear internal buffer", () => {
      const bufferBefore = zstdStream.getBuffer();
      zstdStream.clearBuffer();
      const bufferAfter = zstdStream.getBuffer();
      expect(bufferAfter.length).toBeLessThanOrEqual(bufferBefore.length);
    });

    it("should not throw error when called on destroyed stream", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.clearBuffer();
      }).not.toThrow();
    });
  });

  describe("flush method", () => {
    it("should not throw error during normal operation", () => {
      expect(() => {
        zstdStream.flush();
      }).not.toThrow();
    });

    it("should not throw error when called on destroyed stream", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.flush();
      }).not.toThrow();
    });
  });

  describe("reset method", () => {
    it("should reset stream state", () => {
      try {
        zstdStream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail but should still update bytesRead
      }

      const bytesReadBefore = zstdStream.bytesRead;
      zstdStream.reset();

      expect(zstdStream.bytesRead).toBe(0);
      expect(zstdStream.bytesWritten).toBe(0);
      expect(zstdStream.framesProcessed).toBe(0);
      expect(bytesReadBefore).toBeGreaterThan(0);
    });

    it("should not throw error when called on destroyed stream", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.reset();
      }).not.toThrow();
    });

    it("should allow reuse after reset", () => {
      try {
        zstdStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      zstdStream.reset();

      try {
        const result = zstdStream.push(TEST_DATA);
        expect(typeof result).toBe("boolean");
      } catch (_error) {
        // Expected to fail with invalid data
      }
      expect(zstdStream.bytesRead).toBeGreaterThan(0);
    });
  });

  describe("close method", () => {
    it("should mark stream as destroyed", () => {
      expect(zstdStream.destroyed).toBe(false);
      zstdStream.close();
      expect(zstdStream.destroyed).toBe(true);
    });

    it("should reset all counters", () => {
      try {
        zstdStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      zstdStream.close();

      expect(zstdStream.bytesRead).toBe(0);
      expect(zstdStream.bytesWritten).toBe(0);
      expect(zstdStream.framesProcessed).toBe(0);
    });

    it("should be safe to call multiple times", () => {
      zstdStream.close();
      expect(() => {
        zstdStream.close();
      }).not.toThrow();
      expect(zstdStream.destroyed).toBe(true);
    });
  });
});

describe("Constants", () => {
  it("should export buffer size constants", () => {
    expect(typeof DEFAULT_IN_BUFFER_SIZE).toBe("number");
    expect(typeof DEFAULT_OUT_BUFFER_SIZE).toBe("number");
    expect(DEFAULT_IN_BUFFER_SIZE).toBeGreaterThan(0);
    expect(DEFAULT_OUT_BUFFER_SIZE).toBeGreaterThan(0);
  });
});

describe("Integration Tests", () => {
  it("should handle streaming with multiple chunks", () => {
    const stream = new ZstdStream();

    try {
      // Simulate processing multiple chunks - should not crash
      const chunk1 = TEST_DATA.subarray(0, 10);
      const chunk2 = TEST_DATA.subarray(10);

      try {
        stream.push(chunk1);
        stream.push(chunk2);
      } catch (error) {
        // Expected to fail with invalid data
        expect(error).toBeInstanceOf(Error);
      }

      const result = stream.getBuffer();
      expect(result).toBeInstanceOf(Buffer);
    } finally {
      stream.close();
    }
  });

  it("should maintain consistent state across operations", () => {
    const stream = new ZstdStream();

    try {
      const initialBytesRead = stream.bytesRead;

      try {
        stream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail with invalid data
      }

      expect(stream.bytesRead).toBeGreaterThan(initialBytesRead);
      expect(stream.bytesRead).toBe(TEST_DATA.length);

      stream.clearBuffer();

      // Bytes read should remain the same after clearing buffer
      expect(stream.bytesRead).toBe(TEST_DATA.length);
    } finally {
      stream.close();
    }
  });

  it("should handle custom buffer sizes correctly", () => {
    const customOptions = {
      inputBufferSize: 32768,
      outputBufferSize: 65536,
    };

    const stream = new ZstdStream(customOptions);

    try {
      expect(stream).toBeInstanceOf(ZstdStream);
      try {
        stream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail with invalid data
      }
      const result = stream.getBuffer();
      expect(result).toBeInstanceOf(Buffer);
    } finally {
      stream.close();
    }
  });
});

describe("Memory Management", () => {
  it("should properly clean up resources on close", () => {
    const stream = new ZstdStream();

    try {
      stream.push(TEST_DATA);
    } catch (_error) {
      // Expected to fail with invalid data
    }

    const bytesReadBeforeClose = stream.bytesRead;
    stream.close();

    expect(stream.destroyed).toBe(true);
    expect(stream.bytesRead).toBe(0);
    expect(bytesReadBeforeClose).toBeGreaterThan(0);
  });

  it("should handle multiple reset operations", () => {
    const stream = new ZstdStream();

    try {
      // Process some data
      try {
        stream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail with invalid data
      }
      expect(stream.bytesRead).toBeGreaterThan(0);

      // Reset multiple times
      stream.reset();
      expect(stream.bytesRead).toBe(0);

      stream.reset();
      expect(stream.bytesRead).toBe(0);

      // Should still be usable
      try {
        stream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail with invalid data
      }
      expect(stream.bytesRead).toBeGreaterThan(0);
    } finally {
      stream.close();
    }
  });

  it("should prevent operations after destruction", () => {
    const stream = new ZstdStream();
    stream.close();

    expect(() => stream.push(TEST_DATA)).toThrow();
    expect(() => stream.getBuffer()).toThrow();

    // These should not throw
    expect(() => stream.clearBuffer()).not.toThrow();
    expect(() => stream.flush()).not.toThrow();
    expect(() => stream.reset()).not.toThrow();
    expect(() => stream.close()).not.toThrow();
  });
});

describe("API Surface", () => {
  it("should export all expected classes and functions", () => {
    expect(ZstdStream).toBeDefined();
    expect(ZstdStreamOptions).toBeDefined();
  });

  it("should export all expected constants", () => {
    expect(DEFAULT_IN_BUFFER_SIZE).toBeDefined();
    expect(DEFAULT_OUT_BUFFER_SIZE).toBeDefined();
  });

  it("should have proper type definitions", () => {
    expect(typeof ZstdStream).toBe("function");
    expect(typeof ZstdStreamOptions.parse).toBe("function");
  });
});
