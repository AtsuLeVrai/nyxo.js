import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod/v4";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface representing the loaded C++ zlib compression module.
 *
 * This interface defines the structure of the native Node.js addon that provides
 * high-performance zlib decompression capabilities specifically optimized for
 * Discord's Gateway transport compression protocol.
 *
 * @internal
 */
interface NativeAddon {
  /**
   * Constructor for streaming zlib instances with configurable options.
   *
   * @param options - Optional configuration for the stream
   * @returns Native stream instance
   */
  ZlibStream: new (
    options?: ZlibStreamOptions,
  ) => NativeZlibStream;

  /**
   * The 4-byte zlib suffix marker used by Discord (0x00 0x00 0xFF 0xFF).
   *
   * @returns Buffer containing the zlib suffix bytes
   */
  ZLIB_SUFFIX: Buffer;

  /**
   * Default chunk size for internal buffering operations (32KB).
   *
   * @returns Buffer size in bytes
   */
  DEFAULT_CHUNK_SIZE: number;
}

/**
 * Native streaming zlib instance interface.
 *
 * Represents the actual native C++ object instance that maintains the zlib
 * decompression state and buffers.
 *
 * @internal
 */
interface NativeZlibStream {
  /**
   * Current error code from the last zlib operation.
   *
   * @returns Error code number
   */
  error: number;

  /**
   * Human-readable error message from zlib, if any.
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
   * Push compressed data into the stream for processing.
   *
   * @param data - Compressed data to process
   * @returns True if a complete message was processed and is ready for extraction
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
    join(__dirname, "..", "build", "Release", "zlib.node"),
    // Debug build (development with debugging symbols)
    join(__dirname, "..", "build", "Debug", "zlib.node"),
  ];

  let lastError: Error | null = null;

  for (const path of possiblePaths) {
    try {
      const addon = require(path) as NativeAddon;

      // Validate the addon has required exports
      if (addon && typeof addon.ZlibStream === "function") {
        return addon;
      }

      throw new Error(
        "Native addon loaded but missing required exports (ZlibStream)",
      );
    } catch (error) {
      lastError = error as Error;
    }
  }

  // Provide helpful error message
  const platform = `${process.platform}-${process.arch}`;
  const nodeVersion = process.version;

  throw new Error(
    `Failed to load native zlib addon for platform ${platform} and Node.js version ${nodeVersion}. Tried paths: ${possiblePaths.join(
      ", ",
    )}. Last error: ${(lastError as Error).message}. Ensure the addon is built correctly for your environment.`,
  );
}

// Load the native addon once at module initialization to avoid repeated loading overhead
const nativeAddon = loadNativeAddon();

/**
 * Configuration options for initializing ZlibStream instances.
 *
 * These options control the behavior and performance characteristics of streaming
 * zlib decompression. Default values provide a good balance between memory usage and performance.
 *
 * @public
 */
export const ZlibStreamOptions = z.object({
  /**
   * Window bits parameter for zlib initialization, controlling the size of the sliding window
   * used for compression history and the compression format detection.
   *
   * Common values:
   * - `15`: Standard zlib format with 32KB window (default, recommended for Discord)
   * - `-15`: Raw deflate format without zlib headers
   * - `31`: Automatic format detection supporting both gzip and zlib headers
   *
   * @default 15
   */
  windowBits: z.number().int().min(-15).max(47).default(15),

  /**
   * Chunk size for internal buffering operations in bytes.
   *
   * Controls the size of internal buffers used for decompression operations.
   * Larger values generally improve throughput but consume more memory per stream instance.
   *
   * @default 128 * 1024
   */
  chunkSize: z
    .number()
    .int()
    .min(1024)
    .max(1048576)
    .default(128 * 1024),
});

/**
 * Type definition for ZlibStreamOptions.
 *
 * Represents the validated configuration options for ZlibStream instances.
 * Includes window bits and chunk size parameters with constraints on their values.
 *
 * @public
 */
export type ZlibStreamOptions = z.infer<typeof ZlibStreamOptions>;

/**
 * High-performance streaming zlib implementation for Discord Gateway transport compression.
 *
 * Provides specialized streaming zlib decompression designed specifically for Discord's Gateway
 * WebSocket compression protocol. Implements zlib-stream transport compression with shared context
 * across multiple messages and automatic detection of complete messages using the Z_SYNC_FLUSH
 * suffix (0x00 0x00 0xFF 0xFF).
 *
 * Key features include automatic message boundary detection, shared compression context for
 * improved ratios, memory efficient buffering, and native C++ performance.
 *
 * @example
 * ```typescript
 * const stream = new ZlibStream({ chunkSize: 64 * 1024 });
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
export class ZlibStream {
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
   * Number of complete messages successfully processed by the stream.
   * Each message corresponds to one complete compression unit.
   */
  messagesProcessed = 0;

  /**
   * Reference to the native C++ zlib stream instance.
   * Maintains the actual zlib decompression state and buffers.
   * @internal
   */
  readonly #native: NativeZlibStream;

  /**
   * Creates a new ZlibStream instance with the specified configuration.
   *
   * @param options - Configuration options for stream behavior and performance
   *
   * @throws {Error} If option validation fails or native stream initialization fails
   *
   * @example
   * ```typescript
   * const stream = new ZlibStream({
   *   windowBits: 15,
   *   chunkSize: 64 * 1024
   * });
   * ```
   *
   * @public
   */
  constructor(options: z.input<typeof ZlibStreamOptions> = {}) {
    try {
      const validatedOptions = ZlibStreamOptions.parse(options);
      this.#native = new nativeAddon.ZlibStream(validatedOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid ZlibStream options: ${z.prettifyError(error)}`,
        );
      }

      throw new Error(
        `Failed to initialize ZlibStream: ${(error as Error).message}. This may indicate missing native dependencies or invalid configuration.`,
      );
    }
  }

  /**
   * Gets the current error code from the native zlib stream.
   *
   * @returns The current zlib error code, or -1 if the stream has been destroyed
   *
   * @public
   */
  get error(): number {
    return this.destroyed ? -1 : this.#native.error;
  }

  /**
   * Gets the current error message from the native zlib stream.
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
   * Processes compressed data through the zlib stream.
   *
   * This is the primary interface for feeding compressed data into the stream.
   * Accumulates data internally until a complete message is detected (indicated by
   * Discord's zlib suffix marker). Returns true when decompressed output is available.
   *
   * @param data - Compressed data buffer from WebSocket or other transport
   * @returns True if a complete message was processed and is ready for extraction, false otherwise
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
        "Cannot push data to destroyed ZlibStream. Create a new instance to continue decompression.",
      );
    }

    // Early return for empty data to avoid unnecessary processing
    if (!data || data.length === 0) {
      return false;
    }

    try {
      // Update input byte counter before processing
      this.bytesRead += data.length;

      // Process the data through the native zlib decompression engine
      const hasCompleteMessage = this.#native.push(data);

      // Update output statistics if decompression produced a complete message
      if (hasCompleteMessage) {
        const decompressed = this.#native.getBuffer();
        this.bytesWritten += decompressed.length;
        this.messagesProcessed++;

        return true;
      }

      return false;
    } catch (error) {
      // Re-throw with enhanced error context for debugging
      throw new Error(
        `Failed to process data through ZlibStream: ${(error as Error).message}. This may indicate corrupted input data or a stream state error.`,
      );
    }
  }

  /**
   * Forces the stream to flush any remaining buffered data.
   *
   * Attempts to process any data currently held in internal buffers, even if complete
   * message markers have not been detected. Primarily useful for debugging or error recovery.
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
   * the zlib decompression context. After reset, the stream is ready to process new data.
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
      this.messagesProcessed = 0;
      this.bytesRead = 0;
      this.bytesWritten = 0;
    } catch (_error) {
      // Reset errors are typically not critical
    }
  }

  /**
   * Closes the stream and releases all allocated resources.
   *
   * Performs complete shutdown of the zlib stream, releasing all native resources,
   * buffers, and the zlib decompression context. Once closed, the stream becomes unusable.
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
      this.messagesProcessed = 0;
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
        "Cannot retrieve buffer from destroyed ZlibStream. The stream has been closed and all data has been released.",
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
 * The 4-byte zlib suffix marker used by Discord Gateway transport compression.
 *
 * Represents the specific byte sequence (0x00 0x00 0xFF 0xFF) that Discord appends
 * to each complete message when using zlib-stream transport compression. The presence
 * of this marker indicates that a complete compressed message has been received.
 *
 * @returns Buffer containing the zlib suffix bytes
 *
 * @public
 */
export const ZLIB_SUFFIX: Buffer = nativeAddon.ZLIB_SUFFIX;

/**
 * Default chunk size for internal buffering operations (32KB).
 *
 * Recommended buffer size for zlib streaming decompression operations.
 * Determined to provide optimal performance across different system configurations.
 *
 * @returns Buffer size in bytes
 *
 * @public
 */
export const DEFAULT_CHUNK_SIZE: number = nativeAddon.DEFAULT_CHUNK_SIZE;
