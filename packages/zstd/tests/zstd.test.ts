import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_IN_BUFFER_SIZE,
  DEFAULT_OUT_BUFFER_SIZE,
  InflateStream,
  InflateStreamOptions,
  InflateSync,
  ZSTD_VERSION_MAJOR,
  ZSTD_VERSION_MINOR,
  ZSTD_VERSION_NUMBER,
  ZSTD_VERSION_RELEASE,
  ZSTD_VERSION_STRING,
  inflateSync,
} from "../src/index.js";

// Test data - using simple buffers for basic functionality testing
const TEST_DATA = Buffer.from(
  "Hello, World! This is test data for zstd compression testing.",
);

// Mock corrupted data for error testing
const MOCK_CORRUPTED_DATA = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);

describe("InflateStreamOptions", () => {
  it("should parse valid options correctly", () => {
    const options = {
      inputBufferSize: 65536,
      outputBufferSize: 131072,
    };

    const result = InflateStreamOptions.parse(options);
    expect(result.inputBufferSize).toBe(65536);
    expect(result.outputBufferSize).toBe(131072);
  });

  it("should use default values when no options provided", () => {
    const result = InflateStreamOptions.parse({});
    expect(result.inputBufferSize).toBe(DEFAULT_IN_BUFFER_SIZE);
    expect(result.outputBufferSize).toBe(DEFAULT_OUT_BUFFER_SIZE);
  });

  it("should reject invalid input buffer size", () => {
    expect(() => {
      InflateStreamOptions.parse({ inputBufferSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ inputBufferSize: 3000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ inputBufferSize: 1.5 }); // Non-integer
    }).toThrow();
  });

  it("should reject invalid output buffer size", () => {
    expect(() => {
      InflateStreamOptions.parse({ outputBufferSize: 512 }); // Below minimum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ outputBufferSize: 3000000 }); // Above maximum
    }).toThrow();

    expect(() => {
      InflateStreamOptions.parse({ outputBufferSize: 1.5 }); // Non-integer
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
      expect(stream.framesProcessed).toBe(0);
      stream.close();
    });

    it("should create an instance with custom options", () => {
      const options = {
        inputBufferSize: 32768,
        outputBufferSize: 65536,
      };
      const stream = new InflateStream(options);
      expect(stream).toBeInstanceOf(InflateStream);
      expect(stream.destroyed).toBe(false);
      stream.close();
    });

    it("should throw error with invalid options", () => {
      expect(() => {
        new InflateStream({ inputBufferSize: -1 });
      }).toThrow(/Invalid InflateStream options/);
    });
  });

  describe("properties", () => {
    it("should have initial state properties", () => {
      expect(inflateStream.bytesRead).toBe(0);
      expect(inflateStream.bytesWritten).toBe(0);
      expect(inflateStream.destroyed).toBe(false);
      expect(inflateStream.framesProcessed).toBe(0);
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
      expect(inflateStream.framesProcessed).toBe(0);
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
      expect(inflateStream.framesProcessed).toBe(0);
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
  it("should export buffer size constants", () => {
    expect(typeof DEFAULT_IN_BUFFER_SIZE).toBe("number");
    expect(typeof DEFAULT_OUT_BUFFER_SIZE).toBe("number");
    expect(DEFAULT_IN_BUFFER_SIZE).toBeGreaterThan(0);
    expect(DEFAULT_OUT_BUFFER_SIZE).toBeGreaterThan(0);
  });

  it("should export version constants", () => {
    expect(typeof ZSTD_VERSION_MAJOR).toBe("number");
    expect(typeof ZSTD_VERSION_MINOR).toBe("number");
    expect(typeof ZSTD_VERSION_RELEASE).toBe("number");
    expect(typeof ZSTD_VERSION_NUMBER).toBe("number");
    expect(typeof ZSTD_VERSION_STRING).toBe("string");

    expect(ZSTD_VERSION_MAJOR).toBeGreaterThanOrEqual(0);
    expect(ZSTD_VERSION_MINOR).toBeGreaterThanOrEqual(0);
    expect(ZSTD_VERSION_RELEASE).toBeGreaterThanOrEqual(0);
    expect(ZSTD_VERSION_NUMBER).toBeGreaterThan(0);
    expect(ZSTD_VERSION_STRING.length).toBeGreaterThan(0);
  });

  it("should have consistent version number calculation", () => {
    const expectedVersionNumber =
      ZSTD_VERSION_MAJOR * 10000 +
      ZSTD_VERSION_MINOR * 100 +
      ZSTD_VERSION_RELEASE;
    expect(ZSTD_VERSION_NUMBER).toBe(expectedVersionNumber);
  });

  it("should have consistent version string format", () => {
    const expectedVersionString = `${ZSTD_VERSION_MAJOR}.${ZSTD_VERSION_MINOR}.${ZSTD_VERSION_RELEASE}`;
    expect(ZSTD_VERSION_STRING).toBe(expectedVersionString);
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

  it("should handle custom buffer sizes correctly", () => {
    const customOptions = {
      inputBufferSize: 32768,
      outputBufferSize: 65536,
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

describe("API Surface", () => {
  it("should export all expected classes and functions", () => {
    expect(InflateStream).toBeDefined();
    expect(InflateSync).toBeDefined();
    expect(inflateSync).toBeDefined();
    expect(InflateStreamOptions).toBeDefined();
  });

  it("should export all expected constants", () => {
    expect(DEFAULT_IN_BUFFER_SIZE).toBeDefined();
    expect(DEFAULT_OUT_BUFFER_SIZE).toBeDefined();
    expect(ZSTD_VERSION_MAJOR).toBeDefined();
    expect(ZSTD_VERSION_MINOR).toBeDefined();
    expect(ZSTD_VERSION_RELEASE).toBeDefined();
    expect(ZSTD_VERSION_NUMBER).toBeDefined();
    expect(ZSTD_VERSION_STRING).toBeDefined();
  });

  it("should have proper type definitions", () => {
    expect(typeof InflateStream).toBe("function");
    expect(typeof InflateSync).toBe("function");
    expect(typeof inflateSync).toBe("function");
    expect(typeof InflateStreamOptions.parse).toBe("function");
  });
});
