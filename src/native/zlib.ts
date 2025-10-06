import { loadNativeAddon } from "../utils/index.js";

/**
 * @private
 * Native zlib module bindings from C++ addon
 */
const native = loadNativeAddon<NativeZlibModule>({
  name: "nyxojs",
  requiredExports: ["ZlibStream", "ZLIB_SUFFIX", "DEFAULT_CHUNK_SIZE", "ZLIB_VERSION"],
  validate: (addon) => {
    const a = addon as Record<string, unknown>;
    if (typeof a["ZlibStream"] !== "function") {
      throw new Error("ZlibStream must be a constructor function");
    }
    if (!Buffer.isBuffer(a["ZLIB_SUFFIX"])) {
      throw new Error("ZLIB_SUFFIX must be a Buffer");
    }
  },
});

/**
 * Configuration options for ZlibStream initialization.
 * Controls window size and buffer allocation for optimal performance.
 *
 * @see {@link ZlibStream} for usage examples
 */
export interface ZlibStreamOptions {
  /**
   * Base-2 logarithm of window size (8-15 for deflate).
   * Larger values use more memory but provide better compression.
   *
   * Default: 15 (32KB window)
   */
  windowBits?: number;

  /**
   * Size of internal processing chunks in bytes.
   * Larger chunks improve throughput but increase memory usage.
   *
   * Default: 32768 (32KB)
   */
  chunkSize?: number;
}

/**
 * @private
 * Native module interface from C++ bindings
 */
interface NativeZlibModule {
  ZlibStream: new (options?: ZlibStreamOptions) => NativeZlibStream;
  ZLIB_SUFFIX: Buffer;
  DEFAULT_CHUNK_SIZE: number;
  ZLIB_VERSION: string;
}

/**
 * @private
 * Native ZlibStream class interface from C++ addon
 */
interface NativeZlibStream {
  readonly error: number;
  readonly message: string | null;
  readonly finished: boolean;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  reset(): void;

  close(): void;

  getBuffer(): Buffer;

  clearBuffer(): void;
}

/**
 * Streaming zlib decompression with incremental processing and memory efficiency.
 * Handles fragmented input data and produces decompressed output progressively.
 */
export class ZlibStream {
  /**
   * @private
   * Native C++ stream instance
   */
  private readonly stream: NativeZlibStream;

  /**
   * Creates new zlib decompression stream with specified configuration.
   *
   * @param options - Stream configuration options
   * @throws {Error} When stream initialization fails
   * @see {@link ZlibStreamOptions} for configuration details
   */
  constructor(options?: ZlibStreamOptions) {
    this.stream = new native.ZlibStream(options);
  }

  /**
   * Last error code from zlib operations.
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
   * Indicates if stream has finished processing all data.
   * True after Z_STREAM_END received or close() called.
   */
  get finished(): boolean {
    return this.stream.finished;
  }

  /**
   * Pushes compressed data chunk into stream for processing.
   * Data is buffered until complete frame is available for decompression.
   *
   * @param buffer - Compressed data chunk to process
   * @returns True if data was processed, false if buffering for complete frame
   * @throws {Error} When stream is not initialized
   * @throws {Error} When stream is already finished
   * @throws {TypeError} When buffer is not Buffer or Uint8Array
   */
  push(buffer: Buffer | Uint8Array): boolean {
    return this.stream.push(buffer);
  }

  /**
   * Forces processing of buffered data without waiting for complete frame.
   * Useful for handling end-of-stream or incomplete data scenarios.
   *
   * @throws {Error} When stream is not initialized
   */
  flush(): void {
    this.stream.flush();
  }

  /**
   * Resets stream state to initial configuration.
   * Clears all buffers and error states for stream reuse.
   */
  reset(): void {
    this.stream.reset();
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
}

/**
 * Byte sequence marking end of zlib compressed frame.
 * Used for detecting complete frame boundaries in streaming scenarios.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc1950} for zlib format specification
 */
export const ZLIB_SUFFIX: Buffer = native.ZLIB_SUFFIX;

/**
 * Default chunk size for stream processing operations in bytes.
 * Optimized for balance between memory usage and throughput.
 */
export const DEFAULT_CHUNK_SIZE: number = native.DEFAULT_CHUNK_SIZE;

/**
 * Zlib library version string from native binding.
 * Format: "major.minor.patch" (e.g., "1.2.11")
 */
export const ZLIB_VERSION: string = native.ZLIB_VERSION;

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
 * Decompresses complete zlib-compressed buffer in single operation.
 * Convenience wrapper around ZlibStream for simple use cases.
 *
 * @param buffer - Complete compressed data buffer
 * @param options - Optional stream configuration
 * @returns Decompressed data buffer
 * @throws {Error} When decompression fails
 * @throws {TypeError} When buffer is invalid type
 */
export function inflateSync(buffer: Buffer | Uint8Array, options?: ZlibStreamOptions): Buffer {
  validateBuffer(buffer);

  const stream = new ZlibStream(options);
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
 * Checks if buffer ends with valid zlib frame terminator sequence.
 * Useful for validating complete frames before decompression.
 *
 * @param buffer - Buffer to check for zlib suffix
 * @returns True if buffer ends with zlib suffix
 */
export function hasZlibSuffix(buffer: Buffer | Uint8Array): boolean {
  validateBuffer(buffer);

  if (buffer.length < ZLIB_SUFFIX.length) {
    return false;
  }

  const suffix = buffer.subarray(-ZLIB_SUFFIX.length);
  return ZLIB_SUFFIX.every((byte, index) => byte === suffix[index]);
}

/**
 * Creates managed zlib stream with automatic cleanup and error handling.
 * Provides callback-based API for processing streaming data.
 *
 * @param options - Stream configuration options
 * @param onData - Callback invoked with decompressed chunks
 * @param onError - Optional error handler callback
 * @returns Stream controller object with push and close methods
 */
export function createInflateStream(
  options?: ZlibStreamOptions,
  onData?: (data: Buffer) => void,
  onError?: (error: Error) => void,
): InflateStreamController {
  const stream = new ZlibStream(options);
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

    close(): void {
      if (!closed) {
        stream.close();
        closed = true;
      }
    },

    get finished(): boolean {
      return stream.finished;
    },
  };
}

/**
 * Controller interface for managed inflate stream operations.
 * Provides methods for data processing and resource management.
 *
 * @see {@link createInflateStream} for creation
 */
export interface InflateStreamController {
  /**
   * Indicates if stream has finished processing.
   */
  readonly finished: boolean;

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
   * Closes stream and releases resources.
   */
  close(): void;
}

/**
 * Type guard for checking if value is valid zlib options object.
 *
 * @param value - Value to check
 * @returns True if value is valid ZlibStreamOptions
 */
export function isZlibStreamOptions(value: unknown): value is ZlibStreamOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const opts = value as Record<string, unknown>;

  if ("windowBits" in opts && typeof opts["windowBits"] !== "number") {
    return false;
  }

  if ("chunkSize" in opts && typeof opts["chunkSize"] !== "number") {
    return false;
  }

  return true;
}
