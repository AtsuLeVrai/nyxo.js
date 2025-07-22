import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface representing the loaded C++ zstd compression module.
 *
 * This interface defines the structure of the native Node.js addon that provides
 * high-performance zstd decompression capabilities.
 *
 * @internal
 */
interface NativeAddon {
  /**
   * Constructor for streaming zstd instances with configurable options.
   *
   * @param options - Optional configuration for the stream
   * @returns Native stream instance
   */
  ZstdStream: new (
    options?: ZstdStreamOptions,
  ) => NativeZstdStream;

  /**
   * Default input buffer size for optimal streaming performance.
   *
   * @returns Buffer size in bytes
   */
  DEFAULT_IN_BUFFER_SIZE: number;

  /**
   * Default output buffer size for optimal streaming performance.
   *
   * @returns Buffer size in bytes
   */
  DEFAULT_OUT_BUFFER_SIZE: number;
}

/**
 * Native streaming zstd instance interface.
 *
 * Represents the actual native C++ object instance that maintains the zstd
 * decompression state and buffers.
 *
 * @internal
 */
interface NativeZstdStream {
  /**
   * Current error code from the last zstd operation.
   *
   * @returns Error code number
   */
  error: number;

  /**
   * Human-readable error message from zstd, if any.
   *
   * @returns Error message or null
   */
  message: string | null;

  /**
   * Whether the stream has finished processing.
   *
   * @returns True if finished
   */
  finished: boolean;

  /**
   * Number of bytes read from input.
   *
   * @returns Bytes read count
   */
  bytesRead: number;

  /**
   * Number of bytes written to output.
   *
   * @returns Bytes written count
   */
  bytesWritten: number;

  /**
   * Push compressed data into the stream for processing.
   *
   * @param data - Compressed data to process
   * @returns True if data was processed and output is available
   */
  push(data: Buffer | Uint8Array): boolean;

  /**
   * Force flush any remaining data in the decompression stream.
   *
   * @returns Void
   */
  flush(): void;

  /**
   * Reset the stream state.
   *
   * @returns Void
   */
  reset(): void;

  /**
   * Close the stream and release all allocated resources.
   *
   * @returns Void
   */
  close(): void;

  /**
   * Get the current accumulated decompressed data without clearing the buffer.
   *
   * @returns Buffer with decompressed data
   */
  getBuffer(): Buffer;

  /**
   * Clear the internal output buffer to free memory.
   *
   * @returns Void
   */
  clearBuffer(): void;
}

/**
 * Loads the native addon with multiple fallback strategies for different build configurations.
 *
 * Attempts to load the compiled native module from various potential locations,
 * providing resilience across different build environments.
 *
 * @throws {Error} If all loading attempts fail or the addon lacks required exports
 * @returns The successfully loaded and validated native addon
 * @internal
 */
function loadNativeAddon(): NativeAddon {
  // Define possible paths for the native addon binary
  const possiblePaths = [
    // Release build (production/optimized)
    join(__dirname, "..", "build", "Release", "zstd.node"),
    // Debug build (development with debugging symbols)
    join(__dirname, "..", "build", "Debug", "zstd.node"),
  ];

  let lastError: Error | null = null;

  for (const path of possiblePaths) {
    try {
      const addon = require(path) as NativeAddon;

      // Validate the addon has required exports
      if (addon && typeof addon.ZstdStream === "function") {
        return addon;
      }

      throw new Error(
        "Native addon loaded but missing required exports (ZstdStream)",
      );
    } catch (error) {
      lastError = error as Error;
    }
  }

  // Provide helpful error message
  const platform = `${process.platform}-${process.arch}`;
  const nodeVersion = process.version;

  throw new Error(
    `Failed to load native zstd addon for platform ${platform} and Node.js version ${nodeVersion}. Tried paths: ${possiblePaths.join(
      ", ",
    )}. Last error: ${(lastError as Error).message}. Ensure the addon is built correctly for your environment.`,
  );
}

// Load the native addon once at module initialization to avoid repeated loading overhead
const nativeAddon = loadNativeAddon();

/**
 * Configuration options for initializing ZstdStream instances.
 *
 * These options control the behavior and performance characteristics of streaming
 * zstd decompression. Default values provide a good balance between memory usage and performance.
 *
 * @public
 */
export const ZstdStreamOptions = z.object({
  /**
   * Input buffer size for internal buffering operations in bytes.
   *
   * Controls the size of internal input buffers used for decompression operations.
   * Larger values generally improve throughput but consume more memory per stream instance.
   *
   * @default ZSTD_DStreamInSize()
   */
  inputBufferSize: z
    .number()
    .int()
    .min(1024)
    .max(2097152)
    .default(nativeAddon.DEFAULT_IN_BUFFER_SIZE),

  /**
   * Output buffer size for internal buffering operations in bytes.
   *
   * Controls the size of internal output buffers used for storing decompressed data.
   * Larger values reduce buffer operations frequency but increase memory consumption.
   *
   * @default ZSTD_DStreamOutSize()
   */
  outputBufferSize: z
    .number()
    .int()
    .min(1024)
    .max(2097152)
    .default(nativeAddon.DEFAULT_OUT_BUFFER_SIZE),
});

/**
 * Type definition for ZstdStreamOptions.
 *
 * Represents the validated configuration options for ZstdStream instances.
 * Includes input and output buffer sizes with constraints on their values.
 *
 * @public
 */
export type ZstdStreamOptions = z.infer<typeof ZstdStreamOptions>;

/**
 * High-performance streaming zstd decompression implementation.
 *
 * Provides specialized streaming zstd decompression with efficient frame-based processing,
 * automatic buffer management, and comprehensive performance monitoring.
 *
 * @example
 * ```typescript
 * const stream = new ZstdStream({ inputBufferSize: 64 * 1024 });
 *
 * const hasOutput = stream.push(compressedData);
 * if (hasOutput) {
 *   const decompressed = stream.getBuffer();
 *   stream.clearBuffer();
 * }
 *
 * stream.close();
 * ```
 *
 * @public
 */
export class ZstdStream {
  /**
   * Total number of compressed bytes read from input since stream initialization.
   * Includes all data passed to push(), regardless of complete frame processing.
   */
  bytesRead = 0;

  /**
   * Total number of decompressed bytes written to output buffers since initialization.
   * Represents cumulative size of all decompressed data produced by the stream.
   */
  bytesWritten = 0;

  /**
   * Indicates whether the stream has been destroyed and is no longer usable.
   * Once destroyed, all operations will throw errors.
   */
  destroyed = false;

  /**
   * Number of complete compression frames successfully processed by the stream.
   * Each frame corresponds to one complete compression unit.
   */
  framesProcessed = 0;

  /**
   * Reference to the native C++ zstd stream instance.
   * Maintains the actual zstd decompression state and buffers.
   * @internal
   */
  readonly #native: NativeZstdStream;

  /**
   * Creates a new ZstdStream instance with the specified configuration.
   *
   * @param options - Configuration options for stream behavior and performance
   *
   * @throws {Error} If option validation fails or native stream initialization fails
   *
   * @example
   * ```typescript
   * const stream = new ZstdStream({
   *   inputBufferSize: 128 * 1024,
   *   outputBufferSize: 256 * 1024
   * });
   * ```
   *
   * @public
   */
  constructor(options: z.input<typeof ZstdStreamOptions> = {}) {
    try {
      const validatedOptions = ZstdStreamOptions.parse(options);
      this.#native = new nativeAddon.ZstdStream(validatedOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid ZstdStream options: ${z.prettifyError(error)}`,
        );
      }

      throw new Error(
        `Failed to initialize ZstdStream: ${(error as Error).message}. This may indicate missing native dependencies or invalid configuration.`,
      );
    }
  }

  /**
   * Gets the current error code from the native zstd stream.
   *
   * @returns The current zstd error code, or -1 if the stream has been destroyed
   *
   * @public
   */
  get error(): number {
    return this.destroyed ? -1 : this.#native.error;
  }

  /**
   * Gets the current error message from the native zstd stream.
   *
   * @returns A descriptive error message, or null if no error has occurred or stream is destroyed
   *
   * @public
   */
  get message(): string | null {
    return this.destroyed ? null : this.#native.message;
  }

  /**
   * Indicates whether the stream has finished processing all input data.
   *
   * @returns True if stream processing is complete, false if more data is expected
   *
   * @public
   */
  get finished(): boolean {
    return this.destroyed ? true : this.#native.finished;
  }

  /**
   * Processes compressed data through the zstd stream.
   *
   * This is the primary interface for feeding compressed data into the stream.
   * Processes data incrementally and returns true when decompressed output is available.
   *
   * @param data - Compressed data buffer from file, network, or other source
   * @returns True if decompressed data is available for extraction, false otherwise
   *
   * @throws {Error} If the stream has been destroyed or if a fatal decompression error occurs
   *
   * @example
   * ```typescript
   * const hasOutput = stream.push(compressedChunk);
   * if (hasOutput) {
   *   const result = stream.getBuffer();
   *   stream.clearBuffer();
   * }
   * ```
   *
   * @public
   */
  push(data: Buffer | Uint8Array): boolean {
    // Ensure the stream is still active and usable
    if (this.destroyed) {
      throw new Error(
        "Cannot push data to destroyed ZstdStream. Create a new instance to continue decompression.",
      );
    }

    // Early return for empty data to avoid unnecessary processing
    if (!data || data.length === 0) {
      return false;
    }

    try {
      // Update input byte counter before processing
      this.bytesRead += data.length;

      // Process the data through the native zstd decompression engine
      const hasOutput = this.#native.push(data);

      // Update output statistics if decompression produced data
      if (hasOutput) {
        this.bytesWritten = this.#native.bytesWritten;
      }

      return hasOutput;
    } catch (error) {
      // Re-throw with enhanced error context for debugging
      throw new Error(
        `Failed to process data through ZstdStream: ${(error as Error).message}. This may indicate corrupted input data or a stream state error.`,
      );
    }
  }

  /**
   * Forces the stream to flush any remaining buffered data.
   *
   * Attempts to process any data currently held in internal buffers, even if complete
   * frames have not been detected. Primarily useful for debugging or error recovery.
   *
   * @returns Void
   *
   * @public
   */
  flush(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.flush();
    } catch (_error) {
      // Ignore flush errors - they're typically not critical
    }
  }

  /**
   * Resets the stream state to initial conditions.
   *
   * Clears all internal buffers and resets statistical counters while reinitializing
   * the zstd decompression context. After reset, the stream is ready to process new data.
   *
   * @returns Void
   *
   * @example
   * ```typescript
   * // Reset after error or to reuse stream
   * stream.reset();
   * console.log(stream.bytesRead); // 0
   * ```
   *
   * @public
   */
  reset(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.reset();

      // Reset local statistics
      this.framesProcessed = 0;
      this.bytesRead = 0;
      this.bytesWritten = 0;
    } catch (_error) {
      // Reset errors are typically not critical
    }
  }

  /**
   * Closes the stream and releases all allocated resources.
   *
   * Performs complete shutdown of the zstd stream, releasing all native resources,
   * buffers, and the zstd decompression context. Once closed, the stream becomes unusable.
   *
   * Always call close() when finished to prevent memory leaks.
   *
   * @returns Void
   *
   * @example
   * ```typescript
   * try {
   *   // Use stream...
   * } finally {
   *   stream.close();
   * }
   * ```
   *
   * @public
   */
  close(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.close();
    } finally {
      // Mark as destroyed regardless of close success
      this.destroyed = true;
      this.framesProcessed = 0;
      this.bytesRead = 0;
      this.bytesWritten = 0;
    }
  }

  /**
   * Retrieves the current accumulated decompressed data from the stream buffer.
   *
   * Returns a copy of the decompressed data accumulated in the internal output buffer.
   * The internal buffer is not cleared by this operation.
   *
   * @returns Buffer containing the current decompressed data
   *
   * @throws {Error} If the stream has been destroyed or buffer retrieval fails
   *
   * @example
   * ```typescript
   * if (stream.push(data)) {
   *   const decompressed = stream.getBuffer();
   *   // Process decompressed data...
   *   stream.clearBuffer();
   * }
   * ```
   *
   * @see {@link clearBuffer} - For freeing the internal buffer after use
   *
   * @public
   */
  getBuffer(): Buffer {
    if (this.destroyed) {
      throw new Error(
        "Cannot retrieve buffer from destroyed ZstdStream. The stream has been closed and all data has been released.",
      );
    }

    try {
      return this.#native.getBuffer();
    } catch (error) {
      throw new Error(
        `Failed to retrieve decompressed buffer: ${(error as Error).message}. This may indicate a corrupted stream state or insufficient memory.`,
      );
    }
  }

  /**
   * Clears the internal output buffer to free memory.
   *
   * Releases the memory used by the internal decompressed data buffer. Should be called
   * after processing each batch of decompressed data to prevent memory accumulation.
   *
   * @returns Void
   *
   * @example
   * ```typescript
   * const data = stream.getBuffer();
   * processData(data);
   * stream.clearBuffer(); // Free memory
   * ```
   *
   * @see {@link getBuffer} - For retrieving data before clearing
   *
   * @public
   */
  clearBuffer(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.clearBuffer();
    } catch (_error) {
      // Clear buffer errors are typically not critical
    }
  }
}

/**
 * Default input buffer size for optimal streaming performance.
 *
 * Recommended input buffer size for zstd streaming decompression operations.
 * Determined by the zstd library's ZSTD_DStreamInSize() function.
 *
 * @returns Buffer size in bytes
 *
 * @public
 */
export const DEFAULT_IN_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_IN_BUFFER_SIZE;

/**
 * Default output buffer size for optimal streaming performance.
 *
 * Recommended output buffer size for zstd streaming decompression operations.
 * Determined by the zstd library's ZSTD_DStreamOutSize() function.
 *
 * @returns Buffer size in bytes
 *
 * @public
 */
export const DEFAULT_OUT_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_OUT_BUFFER_SIZE;
