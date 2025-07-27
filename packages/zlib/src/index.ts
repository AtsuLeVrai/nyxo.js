import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface for C++ zlib compression module.
 * Provides high-performance zlib decompression for Discord Gateway protocol.
 *
 * @internal
 */
interface NativeAddon {
  /**
   * Constructor for streaming zlib instances.
   *
   * @param options - Stream configuration options
   * @returns Native stream instance
   */
  ZlibStream: new (
    options?: ZlibStreamOptions,
  ) => NativeZlibStream;

  /**
   * Discord's zlib suffix marker (0x00 0x00 0xFF 0xFF).
   * Indicates complete message boundaries.
   */
  ZLIB_SUFFIX: Buffer;

  /**
   * Default chunk size for buffering operations.
   * Optimized for streaming performance (32KB).
   */
  DEFAULT_CHUNK_SIZE: number;
}

/**
 * Native streaming zlib instance interface.
 * Maintains zlib decompression state and buffers.
 *
 * @internal
 */
interface NativeZlibStream {
  /**
   * Current error code from last operation.
   * Zero indicates no error.
   */
  error: number;

  /**
   * Human-readable error message.
   * Null when no error occurred.
   */
  message: string | null;

  /**
   * Stream completion status.
   * True when all data processed.
   */
  finished: boolean;

  /**
   * Processes compressed data through the stream.
   *
   * @param data - Compressed data to process
   * @returns True if complete message processed
   */
  push(data: Buffer | Uint8Array): boolean;

  /**
   * Forces flush of remaining buffered data.
   */
  flush(): void;

  /**
   * Resets stream to initial state.
   */
  reset(): void;

  /**
   * Closes stream and releases resources.
   */
  close(): void;

  /**
   * Retrieves accumulated decompressed data.
   *
   * @returns Buffer with decompressed data
   */
  getBuffer(): Buffer;

  /**
   * Clears internal output buffer.
   */
  clearBuffer(): void;
}

/**
 * Loads native addon with fallback strategies.
 * Handles different build configurations and environments.
 *
 * @returns Successfully loaded native addon
 *
 * @throws {Error} When all loading attempts fail
 *
 * @internal
 */
function loadNativeAddon(): NativeAddon {
  const possiblePaths = [
    join(__dirname, "..", "build", "Release", "zlib.node"),
    join(__dirname, "..", "build", "Debug", "zlib.node"),
  ];

  let lastError: Error | null = null;

  for (const path of possiblePaths) {
    try {
      const addon = require(path) as NativeAddon;

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

  const platform = `${process.platform}-${process.arch}`;
  const nodeVersion = process.version;

  throw new Error(
    `Failed to load native zlib addon for platform ${platform} and Node.js version ${nodeVersion}. Tried paths: ${possiblePaths.join(
      ", ",
    )}. Last error: ${(lastError as Error).message}. Ensure the addon is built correctly for your environment.`,
  );
}

const nativeAddon = loadNativeAddon();

/**
 * Configuration options for ZlibStream initialization.
 * Controls decompression behavior and performance characteristics.
 *
 * @public
 */
export const ZlibStreamOptions = z.object({
  /**
   * Window bits parameter controlling sliding window size.
   * Common values: 15 (zlib), -15 (raw deflate), 31 (auto-detect).
   *
   * @default 15
   */
  windowBits: z.number().int().min(-15).max(47).default(15),

  /**
   * Chunk size for internal buffering in bytes.
   * Larger values improve throughput but use more memory.
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

export type ZlibStreamOptions = z.infer<typeof ZlibStreamOptions>;

/**
 * High-performance streaming zlib for Discord Gateway compression.
 * Handles Discord's zlib-stream transport with message boundary detection.
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
   * Total compressed bytes read since initialization.
   * Includes all data passed to push operations.
   */
  bytesRead = 0;

  /**
   * Total decompressed bytes written since initialization.
   * Represents cumulative decompressed data size.
   */
  bytesWritten = 0;

  /**
   * Stream destruction status.
   * True when stream is closed and unusable.
   */
  destroyed = false;

  /**
   * Complete messages processed by the stream.
   * Each message represents one compression unit.
   */
  messagesProcessed = 0;

  /**
   * Native C++ zlib stream instance.
   * @internal
   */
  readonly #native: NativeZlibStream;

  /**
   * Creates a new ZlibStream with specified configuration.
   *
   * @param options - Stream behavior and performance options
   *
   * @throws {Error} When validation fails or initialization fails
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
   * Current zlib error code.
   * Returns -1 if stream destroyed.
   *
   * @public
   */
  get error(): number {
    return this.destroyed ? -1 : this.#native.error;
  }

  /**
   * Current zlib error message.
   * Returns null if no error or stream destroyed.
   *
   * @public
   */
  get message(): string | null {
    return this.destroyed ? null : this.#native.message;
  }

  /**
   * Stream completion status.
   * True when all input data processed.
   *
   * @public
   */
  get finished(): boolean {
    return this.destroyed ? true : this.#native.finished;
  }

  /**
   * Processes compressed data through the stream.
   * Detects complete messages using Discord's zlib suffix marker.
   *
   * @param data - Compressed data buffer from WebSocket transport
   * @returns True if complete message processed and ready for extraction
   *
   * @throws {Error} When stream destroyed or decompression fails
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
    if (this.destroyed) {
      throw new Error(
        "Cannot push data to destroyed ZlibStream. Create a new instance to continue decompression.",
      );
    }

    if (!data || data.length === 0) {
      return false;
    }

    try {
      this.bytesRead += data.length;
      const hasCompleteMessage = this.#native.push(data);

      if (hasCompleteMessage) {
        const decompressed = this.#native.getBuffer();
        this.bytesWritten += decompressed.length;
        this.messagesProcessed++;
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(
        `Failed to process data through ZlibStream: ${(error as Error).message}. This may indicate corrupted input data or a stream state error.`,
      );
    }
  }

  /**
   * Forces flush of remaining buffered data.
   * Processes data held in internal buffers.
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
   * Resets stream to initial conditions.
   * Clears buffers and reinitializes decompression context.
   *
   * @example
   * ```typescript
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
      this.messagesProcessed = 0;
      this.bytesRead = 0;
      this.bytesWritten = 0;
    } catch (_error) {
      // Reset errors are typically not critical
    }
  }

  /**
   * Closes stream and releases all resources.
   * Makes stream unusable and prevents memory leaks.
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
      this.destroyed = true;
      this.messagesProcessed = 0;
      this.bytesRead = 0;
      this.bytesWritten = 0;
    }
  }

  /**
   * Retrieves current accumulated decompressed data.
   * Returns copy without clearing internal buffer.
   *
   * @returns Buffer containing decompressed data
   *
   * @throws {Error} When stream destroyed or retrieval fails
   *
   * @example
   * ```typescript
   * if (stream.push(data)) {
   *   const decompressed = stream.getBuffer();
   *   stream.clearBuffer();
   * }
   * ```
   *
   * @see {@link clearBuffer} - For freeing internal buffer
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
   * Clears internal output buffer to free memory.
   * Should be called after processing decompressed data.
   *
   * @example
   * ```typescript
   * const data = stream.getBuffer();
   * processData(data);
   * stream.clearBuffer();
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
 * Discord's zlib suffix marker for message boundaries.
 * Byte sequence (0x00 0x00 0xFF 0xFF) indicating complete messages.
 *
 * @public
 */
export const ZLIB_SUFFIX: Buffer = nativeAddon.ZLIB_SUFFIX;

/**
 * Default chunk size for optimal performance.
 * Recommended buffer size for zlib streaming operations (32KB).
 *
 * @public
 */
export const DEFAULT_CHUNK_SIZE: number = nativeAddon.DEFAULT_CHUNK_SIZE;
