import { loadNativeAddon } from "../utils/index.js";

/**
 * @private
 * Native zstd module bindings from C++ addon
 */
const native = loadNativeAddon<NativeZstdModule>({
  name: "nyxojs",
  requiredExports: [
    "ZstdStream",
    "DEFAULT_IN_BUFFER_SIZE",
    "DEFAULT_OUT_BUFFER_SIZE",
    "ZSTD_VERSION",
  ],
  validate: (addon) => {
    const a = addon as Record<string, unknown>;
    if (typeof a["ZstdStream"] !== "function") {
      throw new Error("ZstdStream must be a constructor function");
    }
    if (typeof a["DEFAULT_IN_BUFFER_SIZE"] !== "number") {
      throw new Error("DEFAULT_IN_BUFFER_SIZE must be a number");
    }
  },
});

/**
 * Configuration options for ZstdStream initialization.
 * Controls buffer sizes for optimal memory usage and throughput.
 *
 * @see {@link ZstdStream} for usage examples
 */
export interface ZstdStreamOptions {
  /**
   * Input buffer size in bytes for reading compressed data.
   * Larger values improve throughput for high-bandwidth scenarios.
   *
   * Default: Optimal size determined by ZSTD_DStreamInSize()
   */
  inputBufferSize?: number;

  /**
   * Output buffer size in bytes for writing decompressed data.
   * Larger values reduce overhead but increase memory usage.
   *
   * Default: Optimal size determined by ZSTD_DStreamOutSize()
   */
  outputBufferSize?: number;
}

/**
 * Statistics tracking for zstd stream operations.
 * Provides insights into compression efficiency and data flow.
 */
export interface ZstdStreamStats {
  /** Total bytes read from input (compressed) */
  bytesRead: number;

  /** Total bytes written to output (decompressed) */
  bytesWritten: number;

  /** Number of complete frames processed */
  framesProcessed: number;

  /** Current compression ratio (bytesWritten / bytesRead) */
  compressionRatio: number;
}

/**
 * @private
 * Native module interface from C++ bindings
 */
interface NativeZstdModule {
  ZstdStream: new (options?: ZstdStreamOptions) => NativeZstdStream;
  DEFAULT_IN_BUFFER_SIZE: number;
  DEFAULT_OUT_BUFFER_SIZE: number;
  ZSTD_VERSION: string;
}

/**
 * @private
 * Native ZstdStream class interface from C++ addon
 */
interface NativeZstdStream {
  readonly error: number;
  readonly message: string | null;
  readonly bytesRead: number;
  readonly bytesWritten: number;
  readonly finished: boolean;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  reset(): void;

  close(): void;

  getBuffer(): Buffer;

  clearBuffer(): void;
}

/**
 * Streaming zstd decompression with incremental processing and performance tracking.
 * Handles fragmented input data and produces decompressed output progressively.
 */
export class ZstdStream {
  /**
   * @private
   * Native C++ stream instance
   */
  private readonly stream: NativeZstdStream;

  /**
   * @private
   * Frame counter for statistics
   */
  private frameCount = 0;

  /**
   * Creates new zstd decompression stream with specified configuration.
   *
   * @param options - Stream configuration options
   * @throws {Error} When stream initialization fails
   * @see {@link ZstdStreamOptions} for configuration details
   */
  constructor(options?: ZstdStreamOptions) {
    this.stream = new native.ZstdStream(options);
  }

  /**
   * Last error code from zstd operations.
   * Zero indicates success, non-zero indicates error condition.
   *
   * @see {@link message} for human-readable error description
   */
  get error(): number {
    return this.stream.error;
  }

  /**
   * Human-readable error message from last operation.
   * Null when no error has occurred.
   *
   * @see {@link error} for numeric error code
   */
  get message(): string | null {
    return this.stream.message;
  }

  /**
   * Total number of compressed bytes read from input.
   * Useful for tracking progress and calculating compression ratios.
   */
  get bytesRead(): number {
    return this.stream.bytesRead;
  }

  /**
   * Total number of decompressed bytes written to output.
   * Useful for tracking progress and validating decompression.
   */
  get bytesWritten(): number {
    return this.stream.bytesWritten;
  }

  /**
   * Indicates if stream has finished processing all data.
   * True after complete frame processed or close() called.
   */
  get finished(): boolean {
    return this.stream.finished;
  }

  /**
   * Pushes compressed data chunk into stream for processing.
   * Data is processed incrementally with automatic frame detection.
   *
   * @param buffer - Compressed data chunk to process
   * @returns True if data was processed and output is available, false if buffering
   * @throws {Error} When stream is not initialized
   * @throws {Error} When stream is already finished
   * @throws {TypeError} When buffer is not Buffer or Uint8Array
   */
  push(buffer: Buffer | Uint8Array): boolean {
    const result = this.stream.push(buffer);
    if (result) {
      this.frameCount++;
    }
    return result;
  }

  /**
   * Forces processing of buffered data without waiting for complete frame.
   * Useful for handling end-of-stream scenarios.
   *
   * @throws {Error} When stream is not initialized
   */
  flush(): void {
    this.stream.flush();
  }

  /**
   * Resets stream state to initial configuration.
   * Clears all buffers, error states, and statistics for stream reuse.
   */
  reset(): void {
    this.stream.reset();
    this.frameCount = 0;
  }

  /**
   * Closes stream and releases all allocated resources.
   * Stream cannot be used after calling close.
   */
  close(): void {
    this.stream.close();
  }

  /**
   * Retrieves accumulated decompressed data from output buffer.
   * Buffer is not cleared automatically - call clearBuffer() to free memory.
   *
   * @returns Buffer containing all decompressed data since last clear
   */
  getBuffer(): Buffer {
    return this.stream.getBuffer();
  }

  /**
   * Clears output buffer and releases allocated memory.
   * Should be called after processing getBuffer() results to prevent memory leaks.
   */
  clearBuffer(): void {
    this.stream.clearBuffer();
  }

  /**
   * Retrieves comprehensive statistics about stream processing.
   * Includes byte counts, frame information, and compression ratios.
   *
   * @returns Statistics object with processing metrics
   */
  getStats(): ZstdStreamStats {
    const bytesRead = this.stream.bytesRead;
    const bytesWritten = this.stream.bytesWritten;

    return {
      bytesRead,
      bytesWritten,
      framesProcessed: this.frameCount,
      compressionRatio: bytesRead > 0 ? bytesWritten / bytesRead : 0,
    };
  }
}

/**
 * Recommended input buffer size for optimal zstd decompression performance.
 * Determined by ZSTD_DStreamInSize() for current platform.
 */
export const DEFAULT_IN_BUFFER_SIZE: number = native.DEFAULT_IN_BUFFER_SIZE;

/**
 * Recommended output buffer size for optimal zstd decompression performance.
 * Determined by ZSTD_DStreamOutSize() for current platform.
 */
export const DEFAULT_OUT_BUFFER_SIZE: number = native.DEFAULT_OUT_BUFFER_SIZE;

/**
 * Zstd library version string from native binding.
 * Format: "major.minor.patch" (e.g., "1.5.2")
 */
export const ZSTD_VERSION: string = native.ZSTD_VERSION;

/**
 * @private
 * Validates buffer input and throws descriptive errors
 */
function validateBuffer(buffer: unknown): asserts buffer is Buffer | Uint8Array {
  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw new TypeError("Expected Buffer or Uint8Array");
  }
}

/**
 * Decompresses complete zstd-compressed buffer in single operation.
 * Convenience wrapper around ZstdStream for simple use cases.
 *
 * @param buffer - Complete compressed data buffer
 * @param options - Optional stream configuration
 * @returns Decompressed data buffer
 * @throws {Error} When decompression fails
 * @throws {TypeError} When buffer is invalid type
 */
export function decompressSync(buffer: Buffer | Uint8Array, options?: ZstdStreamOptions): Buffer {
  validateBuffer(buffer);

  const stream = new ZstdStream(options);
  try {
    stream.push(buffer);
    stream.flush();

    if (stream.error !== 0) {
      throw new Error(`Decompression failed: ${stream.message ?? "Unknown error"}`);
    }

    return stream.getBuffer();
  } finally {
    stream.close();
  }
}

/**
 * Decompresses buffer and returns both data and statistics.
 * Useful for monitoring compression efficiency and performance.
 *
 * @param buffer - Complete compressed data buffer
 * @param options - Optional stream configuration
 * @returns Object containing decompressed data and processing statistics
 * @throws {Error} When decompression fails
 * @throws {TypeError} When buffer is invalid type
 */
export function decompressWithStats(
  buffer: Buffer | Uint8Array,
  options?: ZstdStreamOptions,
): { data: Buffer; stats: ZstdStreamStats } {
  validateBuffer(buffer);

  const stream = new ZstdStream(options);
  try {
    stream.push(buffer);
    stream.flush();

    if (stream.error !== 0) {
      throw new Error(`Decompression failed: ${stream.message ?? "Unknown error"}`);
    }

    return {
      data: stream.getBuffer(),
      stats: stream.getStats(),
    };
  } finally {
    stream.close();
  }
}

/**
 * Creates managed zstd stream with automatic cleanup and error handling.
 * Provides callback-based API for processing streaming data.
 *
 * @param options - Stream configuration options
 * @param onData - Callback invoked with decompressed chunks
 * @param onError - Optional error handler callback
 * @returns Stream controller object with push and close methods
 */
export function createDecompressStream(
  options?: ZstdStreamOptions,
  onData?: (data: Buffer) => void,
  onError?: (error: Error) => void,
): DecompressStreamController {
  const stream = new ZstdStream(options);
  let closed = false;

  return {
    push(buffer: Buffer | Uint8Array): boolean {
      if (closed) {
        throw new Error("Stream is closed");
      }

      try {
        const processed = stream.push(buffer);

        if (stream.error !== 0) {
          const error = new Error(`Decompression error: ${stream.message ?? "Unknown"}`);
          onError?.(error);
          return false;
        }

        if (processed && onData) {
          const output = stream.getBuffer();
          if (output.length > 0) {
            onData(output);
            stream.clearBuffer();
          }
        }

        return processed;
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    },

    flush(): void {
      if (closed) {
        throw new Error("Stream is closed");
      }

      stream.flush();

      if (onData) {
        const output = stream.getBuffer();
        if (output.length > 0) {
          onData(output);
          stream.clearBuffer();
        }
      }
    },

    getStats(): ZstdStreamStats {
      return stream.getStats();
    },

    close(): void {
      if (!closed) {
        stream.close();
        closed = true;
      }
    },

    get finished(): boolean {
      return stream.finished;
    },

    get bytesRead(): number {
      return stream.bytesRead;
    },

    get bytesWritten(): number {
      return stream.bytesWritten;
    },
  };
}

/**
 * Controller interface for managed decompress stream operations.
 * Provides methods for data processing, statistics, and resource management.
 *
 * @see {@link createDecompressStream} for creation
 */
export interface DecompressStreamController {
  /**
   * Indicates if stream has finished processing.
   */
  readonly finished: boolean;
  /**
   * Total compressed bytes read.
   */
  readonly bytesRead: number;
  /**
   * Total decompressed bytes written.
   */
  readonly bytesWritten: number;

  /**
   * Pushes compressed data chunk into stream.
   *
   * @param buffer - Compressed data to process
   * @returns True if data was processed and output is available
   * @throws {Error} When stream is closed
   */
  push(buffer: Buffer | Uint8Array): boolean;

  /**
   * Forces processing of buffered data.
   *
   * @throws {Error} When stream is closed
   */
  flush(): void;

  /**
   * Retrieves current processing statistics.
   *
   * @returns Statistics object with metrics
   */
  getStats(): ZstdStreamStats;

  /**
   * Closes stream and releases resources.
   */
  close(): void;
}

/**
 * Type guard for checking if value is valid zstd options object.
 *
 * @param value - Value to check
 * @returns True if value is valid ZstdStreamOptions
 */
export function isZstdStreamOptions(value: unknown): value is ZstdStreamOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const opts = value as Record<string, unknown>;

  if ("inputBufferSize" in opts && typeof opts["inputBufferSize"] !== "number") {
    return false;
  }

  if ("outputBufferSize" in opts && typeof opts["outputBufferSize"] !== "number") {
    return false;
  }

  return true;
}

/**
 * Type guard for checking if value is valid statistics object.
 *
 * @param value - Value to check
 * @returns True if value is valid ZstdStreamStats
 */
export function isZstdStreamStats(value: unknown): value is ZstdStreamStats {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const stats = value as Record<string, unknown>;

  return (
    typeof stats["bytesRead"] === "number" &&
    typeof stats["bytesWritten"] === "number" &&
    typeof stats["framesProcessed"] === "number" &&
    typeof stats["compressionRatio"] === "number"
  );
}
