import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface for C++ zstd compression module.
 * Provides high-performance zstd decompression capabilities.
 *
 * @internal
 */
interface NativeAddon {
  /**
   * Constructor for streaming zstd instances.
   *
   * @param options - Stream configuration options
   * @returns Native stream instance
   */
  ZstdStream: new (
    options?: ZstdStreamOptions,
  ) => NativeZstdStream;

  /**
   * Default input buffer size in bytes.
   * Optimized for streaming performance.
   */
  DEFAULT_IN_BUFFER_SIZE: number;

  /**
   * Default output buffer size in bytes.
   * Optimized for streaming performance.
   */
  DEFAULT_OUT_BUFFER_SIZE: number;
}

/**
 * Native streaming zstd instance interface.
 * Maintains zstd decompression state and buffers.
 *
 * @internal
 */
interface NativeZstdStream {
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
   * Total bytes read from input.
   * Updated after each push operation.
   */
  bytesRead: number;

  /**
   * Total bytes written to output.
   * Updated when decompression produces data.
   */
  bytesWritten: number;

  /**
   * Processes compressed data through the stream.
   *
   * @param data - Compressed data to process
   * @returns True if output is available
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
    join(__dirname, "..", "build", "Release", "zstd.node"),
    join(__dirname, "..", "build", "Debug", "zstd.node"),
  ];

  let lastError: Error | null = null;

  for (const path of possiblePaths) {
    try {
      const addon = require(path) as NativeAddon;

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

  const platform = `${process.platform}-${process.arch}`;
  const nodeVersion = process.version;

  throw new Error(
    `Failed to load native zstd addon for platform ${platform} and Node.js version ${nodeVersion}. Tried paths: ${possiblePaths.join(
      ", ",
    )}. Last error: ${(lastError as Error).message}. Ensure the addon is built correctly for your environment.`,
  );
}

const nativeAddon = loadNativeAddon();

/**
 * Configuration options for ZstdStream initialization.
 * Controls performance and memory usage characteristics.
 *
 * @public
 */
export const ZstdStreamOptions = z.object({
  /**
   * Input buffer size in bytes.
   * Larger values improve throughput but use more memory.
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
   * Output buffer size in bytes.
   * Larger values reduce operations but increase memory usage.
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

export type ZstdStreamOptions = z.infer<typeof ZstdStreamOptions>;

/**
 * High-performance streaming zstd decompression.
 * Provides frame-based processing with automatic buffer management.
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
   * Complete compression frames processed.
   * Each frame represents one compression unit.
   */
  framesProcessed = 0;

  /**
   * Native C++ zstd stream instance.
   * @internal
   */
  readonly #native: NativeZstdStream;

  /**
   * Creates a new ZstdStream with specified configuration.
   *
   * @param options - Stream behavior and performance options
   *
   * @throws {Error} When validation fails or initialization fails
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
   * Current zstd error code.
   * Returns -1 if stream destroyed.
   *
   * @public
   */
  get error(): number {
    return this.destroyed ? -1 : this.#native.error;
  }

  /**
   * Current zstd error message.
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
   * Returns true when decompressed output becomes available.
   *
   * @param data - Compressed data buffer to process
   * @returns True if decompressed data available
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
        "Cannot push data to destroyed ZstdStream. Create a new instance to continue decompression.",
      );
    }

    if (!data || data.length === 0) {
      return false;
    }

    try {
      this.bytesRead += data.length;
      const hasOutput = this.#native.push(data);

      if (hasOutput) {
        this.bytesWritten = this.#native.bytesWritten;
      }

      return hasOutput;
    } catch (error) {
      throw new Error(
        `Failed to process data through ZstdStream: ${(error as Error).message}. This may indicate corrupted input data or a stream state error.`,
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
      this.framesProcessed = 0;
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
      this.framesProcessed = 0;
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
 * Default input buffer size for optimal performance.
 * Determined by zstd library's ZSTD_DStreamInSize function.
 *
 * @public
 */
export const DEFAULT_IN_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_IN_BUFFER_SIZE;

/**
 * Default output buffer size for optimal performance.
 * Determined by zstd library's ZSTD_DStreamOutSize function.
 *
 * @public
 */
export const DEFAULT_OUT_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_OUT_BUFFER_SIZE;
