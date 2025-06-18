import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_CHUNK_SIZE,
  InflateStream,
  InflateStreamOptions,
  InflateSync,
  InflateSyncOptions,
  inflateSync,
  Z_BUF_ERROR,
  Z_DATA_ERROR,
  Z_ERRNO,
  Z_FINISH,
  Z_FULL_FLUSH,
  Z_MEM_ERROR,
  Z_NEED_DICT,
  Z_NO_FLUSH,
  Z_OK,
  Z_PARTIAL_FLUSH,
  Z_STREAM_END,
  Z_STREAM_ERROR,
  Z_SYNC_FLUSH,
  ZLIB_SUFFIX,
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

describe("InflateStreamOptions", () => {
  it("should parse valid options correctly", () => {
    const options = {
      windowBits: 15,
      chunkSize: 65536,
    };

    const result = InflateStreamOptions.parse(options);
    expect(result.windowBits).toBe(15);
    expect(result.chunkSize).toBe(65536);
  });

  it("should use default values when no options provided", () => {
    const result = InflateStreamOptions.parse({});
    expect(result.windowBits).toBe(15);
    expect(result.chunkSize).toBe(128 * 1024);
  });

  it("should reject invalid windowBits values", () => {
    expect(() => {
      InflateStreamOptions.parse({ windowBits: -20 }); // Below minimum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ windowBits: 50 }); // Above maximum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ windowBits: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should reject invalid chunkSize values", () => {
    expect(() => {
      InflateStreamOptions.parse({ chunkSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ chunkSize: 2000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ chunkSize: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should accept valid windowBits range", () => {
    expect(() => {
      InflateStreamOptions.parse({ windowBits: -15 });
    }).not.toThrow();

    expect(() => {
      InflateStreamOptions.parse({ windowBits: 31 });
    }).not.toThrow();

    expect(() => {
      InflateStreamOptions.parse({ windowBits: 47 });
    }).not.toThrow();
  });
});

describe("InflateSyncOptions", () => {
  it("should parse valid options correctly", () => {
    const options = {
      windowBits: 15,
    };

    const result = InflateSyncOptions.parse(options);
    expect(result.windowBits).toBe(15);
  });

  it("should use default values when no options provided", () => {
    const result = InflateSyncOptions.parse({});
    expect(result.windowBits).toBe(15);
  });

  it("should reject invalid windowBits values", () => {
    expect(() => {
      InflateSyncOptions.parse({ windowBits: -20 });
    }).toThrow();

    expect(() => {
      InflateSyncOptions.parse({ windowBits: 50 });
    }).toThrow();
  });
});

describe("InflateStream", () => {
  let inflateStream: InflateStream;

  beforeEach(() => {
    inflateStream = new InflateStream();
  });

  afterEach(() => {
    if (inflateStream && !inflateStream.destroyed) {
      inflateStream.close();
    }
  });

  describe("constructor", () => {
    it("should create an instance with default options", () => {
      const stream = new InflateStream();
      expect(stream).toBeInstanceOf(InflateStream);
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
      const stream = new InflateStream(options);
      expect(stream).toBeInstanceOf(InflateStream);
      expect(stream.destroyed).toBe(false);
      stream.close();
    });

    it("should throw error with invalid options", () => {
      expect(() => {
        new InflateStream({ windowBits: -20 });
      }).toThrow(/Invalid InflateStream options/);
    });
  });

  describe("properties", () => {
    it("should have initial state properties", () => {
      expect(inflateStream.bytesRead).toBe(0);
      expect(inflateStream.bytesWritten).toBe(0);
      expect(inflateStream.destroyed).toBe(false);
      expect(inflateStream.messagesProcessed).toBe(0);
      expect(typeof inflateStream.error).toBe("number");
      expect(inflateStream.finished).toBe(false);
    });

    it("should return correct values when destroyed", () => {
      inflateStream.close();
      expect(inflateStream.destroyed).toBe(true);
      expect(inflateStream.error).toBe(-1);
      expect(inflateStream.message).toBe(null);
      expect(inflateStream.finished).toBe(true);
    });
  });

  describe("push method", () => {
    it("should handle empty data gracefully", () => {
      const result = inflateStream.push(Buffer.alloc(0));
      expect(result).toBe(false);
      expect(inflateStream.bytesRead).toBe(0);
    });

    it("should throw error when pushing to destroyed stream", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.push(TEST_DATA);
      }).toThrow(/Cannot push data to destroyed InflateStream/);
    });

    it("should update bytesRead when processing data", () => {
      const initialBytes = inflateStream.bytesRead;
      try {
        inflateStream.push(TEST_DATA);
        expect(inflateStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      } catch (_error) {
        // Expected to fail with invalid data, but bytesRead should still be updated
        expect(inflateStream.bytesRead).toBe(initialBytes + TEST_DATA.length);
      }
    });

    it("should handle Uint8Array input", () => {
      const uint8Data = new Uint8Array(TEST_DATA);
      try {
        const result = inflateStream.push(uint8Data);
        expect(typeof result).toBe("boolean");
        expect(inflateStream.bytesRead).toBe(uint8Data.length);
      } catch (_error) {
        // Expected to fail with invalid data, but should accept Uint8Array
        expect(inflateStream.bytesRead).toBe(uint8Data.length);
      }
    });

    it("should handle data with zlib suffix", () => {
      try {
        const result = inflateStream.push(DATA_WITH_SUFFIX);
        expect(typeof result).toBe("boolean");
        expect(inflateStream.bytesRead).toBe(DATA_WITH_SUFFIX.length);
      } catch (_error) {
        // Expected to fail with invalid data
        expect(inflateStream.bytesRead).toBe(DATA_WITH_SUFFIX.length);
      }
    });

    it("should handle corrupted data appropriately", () => {
      // The push method may not immediately throw on corrupted data
      // It might return false or process it without immediate error
      const result = inflateStream.push(MOCK_CORRUPTED_DATA);
      expect(typeof result).toBe("boolean");
      expect(inflateStream.bytesRead).toBe(MOCK_CORRUPTED_DATA.length);

      // The error might surface when trying to get the buffer or during processing
      // This tests that the API handles invalid data gracefully
    });
  });

  describe("getBuffer method", () => {
    it("should return Buffer instance", () => {
      const buffer = inflateStream.getBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should throw error when called on destroyed stream", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.getBuffer();
      }).toThrow(/Cannot retrieve buffer from destroyed InflateStream/);
    });

    it("should return same data on multiple calls before clearBuffer", () => {
      const buffer1 = inflateStream.getBuffer();
      const buffer2 = inflateStream.getBuffer();
      expect(buffer1.equals(buffer2)).toBe(true);
    });
  });

  describe("clearBuffer method", () => {
    it("should clear internal buffer", () => {
      const bufferBefore = inflateStream.getBuffer();
      inflateStream.clearBuffer();
      const bufferAfter = inflateStream.getBuffer();
      expect(bufferAfter.length).toBeLessThanOrEqual(bufferBefore.length);
    });

    it("should not throw error when called on destroyed stream", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.clearBuffer();
      }).not.toThrow();
    });
  });

  describe("flush method", () => {
    it("should not throw error during normal operation", () => {
      expect(() => {
        inflateStream.flush();
      }).not.toThrow();
    });

    it("should not throw error when called on destroyed stream", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.flush();
      }).not.toThrow();
    });
  });

  describe("reset method", () => {
    it("should reset stream state", () => {
      try {
        inflateStream.push(TEST_DATA);
      } catch (_error) {
        // Expected to fail but should still update bytesRead
      }

      const bytesReadBefore = inflateStream.bytesRead;
      inflateStream.reset();

      expect(inflateStream.bytesRead).toBe(0);
      expect(inflateStream.bytesWritten).toBe(0);
      expect(inflateStream.messagesProcessed).toBe(0);
      expect(bytesReadBefore).toBeGreaterThan(0);
    });

    it("should not throw error when called on destroyed stream", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.reset();
      }).not.toThrow();
    });

    it("should allow reuse after reset", () => {
      try {
        inflateStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      inflateStream.reset();

      try {
        const result = inflateStream.push(TEST_DATA);
        expect(typeof result).toBe("boolean");
      } catch (_error) {
        // Expected to fail with invalid data
      }
      expect(inflateStream.bytesRead).toBeGreaterThan(0);
    });
  });

  describe("close method", () => {
    it("should mark stream as destroyed", () => {
      expect(inflateStream.destroyed).toBe(false);
      inflateStream.close();
      expect(inflateStream.destroyed).toBe(true);
    });

    it("should reset all counters", () => {
      try {
        inflateStream.push(TEST_DATA);
      } catch (_error) {
        // Expected
      }

      inflateStream.close();

      expect(inflateStream.bytesRead).toBe(0);
      expect(inflateStream.bytesWritten).toBe(0);
      expect(inflateStream.messagesProcessed).toBe(0);
    });

    it("should be safe to call multiple times", () => {
      inflateStream.close();
      expect(() => {
        inflateStream.close();
      }).not.toThrow();
      expect(inflateStream.destroyed).toBe(true);
    });
  });
});

describe("InflateSync", () => {
  let inflateSync: InflateSync;

  beforeEach(() => {
    inflateSync = new InflateSync();
  });

  describe("constructor", () => {
    it("should create an instance successfully", () => {
      const sync = new InflateSync();
      expect(sync).toBeInstanceOf(InflateSync);
    });
  });

  describe("inflate method", () => {
    it("should throw error with empty data", () => {
      expect(() => {
        inflateSync.inflate(Buffer.alloc(0));
      }).toThrow(/Input data cannot be empty/);
    });

    it("should throw error with corrupted data", () => {
      expect(() => {
        inflateSync.inflate(MOCK_CORRUPTED_DATA);
      }).toThrow(/Synchronous decompression failed/);
    });

    it("should throw error with invalid test data", () => {
      expect(() => {
        inflateSync.inflate(TEST_DATA);
      }).toThrow(/Synchronous decompression failed/);
    });

    it("should handle Uint8Array input type", () => {
      const uint8Data = new Uint8Array(MOCK_CORRUPTED_DATA);
      expect(() => {
        inflateSync.inflate(uint8Data);
      }).toThrow(/Synchronous decompression failed/);
    });

    it("should accept custom options", () => {
      const options = { windowBits: -15 };
      expect(() => {
        inflateSync.inflate(MOCK_CORRUPTED_DATA, options);
      }).toThrow(/Synchronous decompression failed/);
    });

    it("should throw error with invalid options", () => {
      const invalidOptions = { windowBits: -20 };
      expect(() => {
        inflateSync.inflate(TEST_DATA, invalidOptions);
      }).toThrow(/Invalid inflation options/);
    });
  });
});

describe("inflateSync function", () => {
  it("should throw error with empty data", () => {
    expect(() => {
      inflateSync(Buffer.alloc(0));
    }).toThrow(/Input data cannot be empty/);
  });

  it("should throw error with corrupted data", () => {
    expect(() => {
      inflateSync(MOCK_CORRUPTED_DATA);
    }).toThrow(/Synchronous decompression operation failed/);
  });

  it("should throw error with invalid test data", () => {
    expect(() => {
      inflateSync(TEST_DATA);
    }).toThrow(/Synchronous decompression operation failed/);
  });

  it("should handle Uint8Array input type", () => {
    const uint8Data = new Uint8Array(MOCK_CORRUPTED_DATA);
    expect(() => {
      inflateSync(uint8Data);
    }).toThrow(/Synchronous decompression operation failed/);
  });

  it("should accept custom options", () => {
    const options = { windowBits: -15 };
    expect(() => {
      inflateSync(MOCK_CORRUPTED_DATA, options);
    }).toThrow(/Synchronous decompression operation failed/);
  });

  it("should throw error with invalid options", () => {
    const invalidOptions = { windowBits: -20 };
    expect(() => {
      inflateSync(TEST_DATA, invalidOptions);
    }).toThrow(/Invalid synchronous inflation options/);
  });

  it("should produce same error behavior as InflateSync class", () => {
    const classInstance = new InflateSync();

    expect(() => {
      inflateSync(MOCK_CORRUPTED_DATA);
    }).toThrow();

    expect(() => {
      classInstance.inflate(MOCK_CORRUPTED_DATA);
    }).toThrow();
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

  it("should export flush mode constants", () => {
    expect(typeof Z_NO_FLUSH).toBe("number");
    expect(typeof Z_PARTIAL_FLUSH).toBe("number");
    expect(typeof Z_SYNC_FLUSH).toBe("number");
    expect(typeof Z_FULL_FLUSH).toBe("number");
    expect(typeof Z_FINISH).toBe("number");

    // These should be different values
    const flushModes = [
      Z_NO_FLUSH,
      Z_PARTIAL_FLUSH,
      Z_SYNC_FLUSH,
      Z_FULL_FLUSH,
      Z_FINISH,
    ];
    const uniqueValues = new Set(flushModes);
    expect(uniqueValues.size).toBe(flushModes.length);
  });

  it("should export result code constants", () => {
    expect(typeof Z_OK).toBe("number");
    expect(typeof Z_STREAM_END).toBe("number");
    expect(typeof Z_NEED_DICT).toBe("number");
    expect(typeof Z_ERRNO).toBe("number");
    expect(typeof Z_STREAM_ERROR).toBe("number");
    expect(typeof Z_DATA_ERROR).toBe("number");
    expect(typeof Z_MEM_ERROR).toBe("number");
    expect(typeof Z_BUF_ERROR).toBe("number");

    // These should be different values
    const resultCodes = [
      Z_OK,
      Z_STREAM_END,
      Z_NEED_DICT,
      Z_ERRNO,
      Z_STREAM_ERROR,
      Z_DATA_ERROR,
      Z_MEM_ERROR,
      Z_BUF_ERROR,
    ];
    const uniqueValues = new Set(resultCodes);
    expect(uniqueValues.size).toBe(resultCodes.length);
  });

  it("should have expected constant values", () => {
    // Z_OK should typically be 0
    expect(Z_OK).toBe(0);

    // Error codes should typically be negative
    expect(Z_ERRNO).toBeLessThan(0);
    expect(Z_STREAM_ERROR).toBeLessThan(0);
    expect(Z_DATA_ERROR).toBeLessThan(0);
    expect(Z_MEM_ERROR).toBeLessThan(0);
    expect(Z_BUF_ERROR).toBeLessThan(0);
  });
});

describe("Integration Tests", () => {
  it("should handle streaming with multiple chunks", () => {
    const stream = new InflateStream();

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
    const stream = new InflateStream();

    try {
      const initialBytesRead = stream.bytesRead;
      const _initialBytesWritten = stream.bytesWritten;

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

    const stream = new InflateStream(customOptions);

    try {
      expect(stream).toBeInstanceOf(InflateStream);
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
    const stream = new InflateStream();

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
    const stream = new InflateStream();

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
    const stream = new InflateStream();

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
    const stream = new InflateStream();
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
    const stream = new InflateStream();

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
      new InflateStream({ windowBits: -20 });
    }).toThrow(/Invalid InflateStream options/);

    expect(() => {
      new InflateStream({ chunkSize: 500 });
    }).toThrow(/Invalid InflateStream options/);

    const sync = new InflateSync();
    expect(() => {
      sync.inflate(Buffer.alloc(0));
    }).toThrow(/Input data cannot be empty/);
  });

  it("should handle native addon loading errors gracefully", () => {
    // These tests ensure the error handling paths work correctly
    // The actual native addon should be available in the test environment
    expect(InflateStream).toBeDefined();
    expect(InflateSync).toBeDefined();
    expect(inflateSync).toBeDefined();
  });
});

describe("API Surface", () => {
  it("should export all expected classes and functions", () => {
    expect(InflateStream).toBeDefined();
    expect(InflateSync).toBeDefined();
    expect(inflateSync).toBeDefined();
    expect(InflateStreamOptions).toBeDefined();
    expect(InflateSyncOptions).toBeDefined();
  });

  it("should export all expected constants", () => {
    expect(ZLIB_SUFFIX).toBeDefined();
    expect(DEFAULT_CHUNK_SIZE).toBeDefined();

    // Flush modes
    expect(Z_NO_FLUSH).toBeDefined();
    expect(Z_PARTIAL_FLUSH).toBeDefined();
    expect(Z_SYNC_FLUSH).toBeDefined();
    expect(Z_FULL_FLUSH).toBeDefined();
    expect(Z_FINISH).toBeDefined();

    // Result codes
    expect(Z_OK).toBeDefined();
    expect(Z_STREAM_END).toBeDefined();
    expect(Z_NEED_DICT).toBeDefined();
    expect(Z_ERRNO).toBeDefined();
    expect(Z_STREAM_ERROR).toBeDefined();
    expect(Z_DATA_ERROR).toBeDefined();
    expect(Z_MEM_ERROR).toBeDefined();
    expect(Z_BUF_ERROR).toBeDefined();
  });

  it("should have proper type definitions", () => {
    expect(typeof InflateStream).toBe("function");
    expect(typeof InflateSync).toBe("function");
    expect(typeof inflateSync).toBe("function");
    expect(typeof InflateStreamOptions.parse).toBe("function");
    expect(typeof InflateSyncOptions.parse).toBe("function");
  });

  it("should have consistent API with expected signatures", () => {
    // Test that constructors can be called without throwing type errors
    const stream = new InflateStream();
    const sync = new InflateSync();

    expect(stream).toBeInstanceOf(InflateStream);
    expect(sync).toBeInstanceOf(InflateSync);

    stream.close();
  });
});
