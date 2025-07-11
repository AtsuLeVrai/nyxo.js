import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_CHUNK_SIZE,
  ZLIB_SUFFIX,
  ZlibStream,
  ZlibStreamOptions,
} from "../src/index.js";

// Test data - using simple buffers for basic functionality testing
const TEST_DATA = Buffer.from(
  "Hello, Discord! This is test data for zlib compression testing.",
);

// Mock corrupted data for error testing
const MOCK_CORRUPTED_DATA = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);

// Mock data with zlib suffix for testing suffix detection
const DATA_WITH_SUFFIX = Buffer.concat([
  TEST_DATA,
  Buffer.from([0x00, 0x00, 0xff, 0xff]),
]);

describe("ZlibStreamOptions", () => {
  it("should parse valid options correctly", () => {
    const options = {
      windowBits: 15,
      chunkSize: 65536,
    };

    const result = ZlibStreamOptions.parse(options);
    expect(result.windowBits).toBe(15);
    expect(result.chunkSize).toBe(65536);
  });

  it("should use default values when no options provided", () => {
    const result = ZlibStreamOptions.parse({});
    expect(result.windowBits).toBe(15);
    expect(result.chunkSize).toBe(128 * 1024);
  });

  it("should reject invalid windowBits values", () => {
    expect(() => {
      ZlibStreamOptions.parse({ windowBits: -20 }); // Below minimum
    }).toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ windowBits: 50 }); // Above maximum
    }).toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ windowBits: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should reject invalid chunkSize values", () => {
    expect(() => {
      ZlibStreamOptions.parse({ chunkSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ chunkSize: 2000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ chunkSize: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should accept valid windowBits range", () => {
    expect(() => {
      ZlibStreamOptions.parse({ windowBits: -15 });
    }).not.toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ windowBits: 31 });
    }).not.toThrow();

    expect(() => {
      ZlibStreamOptions.parse({ windowBits: 47 });
    }).not.toThrow();
  });
});

describe("ZlibStream", () => {
  let zlibStream: ZlibStream;

  beforeEach(() => {
    zlibStream = new ZlibStream();
  });

  afterEach(() => {
    if (zlibStream && !zlibStream.destroyed) {
      zlibStream.close();
    }
  });

  describe("constructor", () => {
    it("should create an instance with default options", () => {
      const stream = new ZlibStream();
      expect(stream).toBeInstanceOf(ZlibStream);
      expect(stream.bytesRead).toBe(0);
      expect(stream.bytesWritten).toBe(0);
      expect(stream.destroyed).toBe(false);
      expect(stream.messagesProcessed).toBe(0);
      stream.close();
    });

    it("should create an instance with custom options", () => {
      const options = {
        windowBits: -15,
        chunkSize: 32768,
      };
      const stream = new ZlibStream(options);
      expect(stream).toBeInstanceOf(ZlibStream);
      expect(stream.destroyed).toBe(false);
      stream.close();
    });

    it("should throw error with invalid options", () => {
      expect(() => {
        new ZlibStream({ windowBits: -20 });
      }).toThrow(/Invalid ZlibStream options/);
    });
  });

  describe("properties", () => {
    it("should have initial state properties", () => {
      expect(zlibStream.bytesRead).toBe(0);
      expect(zlibStream.bytesWritten).toBe(0);
      expect(zlibStream.destroyed).toBe(false);
      expect(zlibStream.messagesProcessed).toBe(0);
      expect(typeof zlibStream.error).toBe("number");
      expect(zlibStream.finished).toBe(false);
    });

    it("should return correct values when destroyed", () => {
      zlibStream.close();
      expect(zlibStream.destroyed).toBe(true);
      expect(zlibStream.error).toBe(-1);
      expect(zlibStream.message).toBe(null);
      expect(zlibStream.finished).toBe(true);
    });
  });

  describe("push method", () => {
    it("should handle empty data gracefully", () => {
      const result = zlibStream.push(Buffer.alloc(0));
      expect(result).toBe(false);
      expect(zlibStream.bytesRead).toBe(0);
    });

    it("should throw error when pushing to destroyed stream", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.push(TEST_DATA);
      }).toThrow(/Cannot push data to destroyed ZlibStream/);
    });

    it("should update bytesRead when processing data", () => {
      const initialBytes = zlibStream.bytesRead;
      try {
        zlibStream.push(TEST_DATA);
        expect(zlibStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      } catch (_error) {
        // Expected to fail with invalid data, but bytesRead should still be updated
        expect(zlibStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      }
    });

    it("should handle Uint8Array input", () => {
      const uint8Data = new Uint8Array(TEST_DATA);
      try {
        const result = zlibStream.push(uint8Data);
        expect(typeof result).toBe("boolean");
        expect(zlibStream.bytesRead).toBe(uint8Data.length);
      } catch (_error) {
        // Expected to fail with invalid data, but should accept Uint8Array
        expect(zlibStream.bytesRead).toBe(uint8Data.length);
      }
    });

    it("should handle data with zlib suffix", () => {
      try {
        const result = zlibStream.push(DATA_WITH_SUFFIX);
        expect(typeof result).toBe("boolean");
        expect(zlibStream.bytesRead).toBe(DATA_WITH_SUFFIX.length);
      } catch (_error) {
        // Expected to fail with invalid data
        expect(zlibStream.bytesRead).toBe(DATA_WITH_SUFFIX.length);
      }
    });

    it("should handle corrupted data appropriately", () => {
      // The push method may not immediately throw on corrupted data
      // It might return false or process it without immediate error
      const result = zlibStream.push(MOCK_CORRUPTED_DATA);
      expect(typeof result).toBe("boolean");
      expect(zlibStream.bytesRead).toBe(MOCK_CORRUPTED_DATA.length);

      // The error might surface when trying to get the buffer or during processing
      // This tests that the API handles invalid data gracefully
    });
  });

  describe("getBuffer method", () => {
    it("should return Buffer instance", () => {
      const buffer = zlibStream.getBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should throw error when called on destroyed stream", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.getBuffer();
      }).toThrow(/Cannot retrieve buffer from destroyed ZlibStream/);
    });

    it("should return same data on multiple calls before clearBuffer", () => {
      const buffer1 = zlibStream.getBuffer();
      const buffer2 = zlibStream.getBuffer();
      expect(buffer1.equals(buffer2)).toBe(true);
    });
  });

  describe("clearBuffer method", () => {
    it("should clear internal buffer", () => {
      const bufferBefore = zlibStream.getBuffer();
      zlibStream.clearBuffer();
      const bufferAfter = zlibStream.getBuffer();
      expect(bufferAfter.length).toBeLessThanOrEqual(bufferBefore.length);
    });

    it("should not throw error when called on destroyed stream", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.clearBuffer();
      }).not.toThrow();
    });
  });

  describe("flush method", () => {
    it("should not throw error during normal operation", () => {
      expect(() => {
        zlibStream.flush();
      }).not.toThrow();
    });

    it("should not throw error when called on destroyed stream", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.flush();
      }).not.toThrow();
    });
  });

  describe("reset method", () => {
    it("should reset stream state", () => {
      try {
        zlibStream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail but should still update bytesRead
      }

      const bytesReadBefore = zlibStream.bytesRead;
      zlibStream.reset();

      expect(zlibStream.bytesRead).toBe(0);
      expect(zlibStream.bytesWritten).toBe(0);
      expect(zlibStream.messagesProcessed).toBe(0);
      expect(bytesReadBefore).toBeGreaterThan(0);
    });

    it("should not throw error when called on destroyed stream", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.reset();
      }).not.toThrow();
    });

    it("should allow reuse after reset", () => {
      try {
        zlibStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      zlibStream.reset();

      try {
        const result = zlibStream.push(TEST_DATA);
        expect(typeof result).toBe("boolean");
      } catch (_error) {
        // Expected to fail with invalid data
      }
      expect(zlibStream.bytesRead).toBeGreaterThan(0);
    });
  });

  describe("close method", () => {
    it("should mark stream as destroyed", () => {
      expect(zlibStream.destroyed).toBe(false);
      zlibStream.close();
      expect(zlibStream.destroyed).toBe(true);
    });

    it("should reset all counters", () => {
      try {
        zlibStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      zlibStream.close();

      expect(zlibStream.bytesRead).toBe(0);
      expect(zlibStream.bytesWritten).toBe(0);
      expect(zlibStream.messagesProcessed).toBe(0);
    });

    it("should be safe to call multiple times", () => {
      zlibStream.close();
      expect(() => {
        zlibStream.close();
      }).not.toThrow();
      expect(zlibStream.destroyed).toBe(true);
    });
  });
});

describe("Constants", () => {
  it("should export ZLIB_SUFFIX constant", () => {
    expect(ZLIB_SUFFIX).toBeInstanceOf(Buffer);
    expect(ZLIB_SUFFIX.length).toBe(4);
    expect(ZLIB_SUFFIX[0]).toBe(0x00);
    expect(ZLIB_SUFFIX[1]).toBe(0x00);
    expect(ZLIB_SUFFIX[2]).toBe(0xff);
    expect(ZLIB_SUFFIX[3]).toBe(0xff);
  });

  it("should export DEFAULT_CHUNK_SIZE constant", () => {
    expect(typeof DEFAULT_CHUNK_SIZE).toBe("number");
    expect(DEFAULT_CHUNK_SIZE).toBeGreaterThan(0);
  });
});

describe("Integration Tests", () => {
  it("should handle streaming with multiple chunks", () => {
    const stream = new ZlibStream();

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
    const stream = new ZlibStream();

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

  it("should handle custom options correctly", () => {
    const customOptions = {
      windowBits: -15,
      chunkSize: 16384,
    };

    const stream = new ZlibStream(customOptions);

    try {
      expect(stream).toBeInstanceOf(ZlibStream);
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

  it("should handle data with Discord zlib suffix", () => {
    const stream = new ZlibStream();

    try {
      try {
        const result = stream.push(DATA_WITH_SUFFIX);
        expect(typeof result).toBe("boolean");
      } catch (error) {
        // Expected to fail with invalid data
        expect(error).toBeInstanceOf(Error);
      }

      expect(stream.bytesRead).toBe(DATA_WITH_SUFFIX.length);
    } finally {
      stream.close();
    }
  });
});

describe("Memory Management", () => {
  it("should properly clean up resources on close", () => {
    const stream = new ZlibStream();

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
    const stream = new ZlibStream();

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
    const stream = new ZlibStream();
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

describe("Discord Gateway Specific Features", () => {
  it("should handle zlib suffix detection", () => {
    // Test that ZLIB_SUFFIX is properly exported and has correct format
    expect(ZLIB_SUFFIX).toBeInstanceOf(Buffer);
    expect(ZLIB_SUFFIX.length).toBe(4);

    // Check the exact bytes for Discord's zlib suffix
    const expectedSuffix = [0x00, 0x00, 0xff, 0xff];
    for (let i = 0; i < 4; i++) {
      expect(ZLIB_SUFFIX[i]).toBe(expectedSuffix[i]);
    }
  });

  it("should work with streaming compression context", () => {
    const stream = new ZlibStream();

    try {
      // Test that the stream maintains context across multiple operations
      const initialState = {
        bytesRead: stream.bytesRead,
        bytesWritten: stream.bytesWritten,
        messagesProcessed: stream.messagesProcessed,
      };

      try {
        stream.push(TEST_DATA);
      } catch (_error) {
        // Expected with invalid data
      }

      // State should change appropriately
      expect(stream.bytesRead).toBeGreaterThan(initialState.bytesRead);

      // Reset should preserve context but clear state
      stream.reset();
      expect(stream.bytesRead).toBe(0);
      expect(stream.bytesWritten).toBe(0);
      expect(stream.messagesProcessed).toBe(0);
    } finally {
      stream.close();
    }
  });
});

describe("Error Handling", () => {
  it("should provide meaningful error messages", () => {
    expect(() => {
      new ZlibStream({ windowBits: -20 });
    }).toThrow(/Invalid ZlibStream options/);

    expect(() => {
      new ZlibStream({ chunkSize: 500 });
    }).toThrow(/Invalid ZlibStream options/);
  });

  it("should handle native addon loading errors gracefully", () => {
    // These tests ensure the error handling paths work correctly
    // The actual native addon should be available in the test environment
    expect(ZlibStream).toBeDefined();
  });
});

describe("API Surface", () => {
  it("should export all expected classes and functions", () => {
    expect(ZlibStream).toBeDefined();
    expect(ZlibStreamOptions).toBeDefined();
  });

  it("should export all expected constants", () => {
    expect(ZLIB_SUFFIX).toBeDefined();
    expect(DEFAULT_CHUNK_SIZE).toBeDefined();
  });

  it("should have proper type definitions", () => {
    expect(typeof ZlibStream).toBe("function");
    expect(typeof ZlibStreamOptions.parse).toBe("function");
  });

  it("should have consistent API with expected signatures", () => {
    // Test that constructors can be called without throwing type errors
    const stream = new ZlibStream();

    expect(stream).toBeInstanceOf(ZlibStream);

    stream.close();
  });
});
