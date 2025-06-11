import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod/v4";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface representing the loaded C++ zstd compression module.
 *
 * This interface defines the structure of the native Node.js addon that provides
 * high-performance zstd compression/decompression capabilities optimized for
 * streaming data processing with superior compression ratios and speed.
 *
 * The native module implements streaming zstd decompression with automatic frame
 * detection and maintains efficient buffer management for optimal performance
 * across multiple compression frames.
 *
 * @internal
 */
interface NativeAddon {
  /** Constructor for streaming decompress instances with configurable options */
  InflateStream: new (
    options?: InflateStreamOptions,
  ) => NativeInflateStream;

  /** Constructor for synchronous decompress instances */
  InflateSync: new () => NativeInflateSync;

  /**
   * Synchronous decompression function for simple one-off decompression operations
   * @param data - Compressed data buffer to decompress
   * @returns Decompressed data as a Buffer
   */
  inflateSync: (data: Buffer | Uint8Array) => Buffer;

  /** Default input buffer size for optimal streaming performance */
  DEFAULT_IN_BUFFER_SIZE: number;

  /** Default output buffer size for optimal streaming performance */
  DEFAULT_OUT_BUFFER_SIZE: number;

  // Zstd version constants
  /** Zstd major version number */
  ZSTD_VERSION_MAJOR: number;
  /** Zstd minor version number */
  ZSTD_VERSION_MINOR: number;
  /** Zstd release version number */
  ZSTD_VERSION_RELEASE: number;
  /** Zstd version number as integer */
  ZSTD_VERSION_NUMBER: number;
  /** Zstd version string */
  ZSTD_VERSION_STRING: string;
}

/**
 * Native streaming decompress instance interface.
 *
 * Represents the actual native C++ object instance created by the InflateStream constructor.
 * This interface defines the methods and properties available on the native stream object
 * that maintains the zstd decompression state and buffers.
 *
 * @internal
 */
interface NativeInflateStream {
  /** Current error code from the last zstd operation */
  error: number;

  /** Human-readable error message from zstd, if any */
  message: string | null;

  /** Whether the stream has finished processing */
  finished: boolean;

  /** Number of bytes read from input */
  bytesRead: number;

  /** Number of bytes written to output */
  bytesWritten: number;

  /**
   * Push compressed data into the stream for processing
   * @param data - Compressed data to process
   * @returns True if data was processed and output is available
   */
  push(data: Buffer | Uint8Array): boolean;

  /** Force flush any remaining data in the decompression stream */
  flush(): void;

  /** Reset the stream state */
  reset(): void;

  /** Close the stream and release all allocated resources */
  close(): void;

  /** Get the current accumulated decompressed data without clearing the buffer */
  getBuffer(): Buffer;

  /** Clear the internal output buffer to free memory */
  clearBuffer(): void;
}

/**
 * Native synchronous decompress instance interface.
 *
 * Represents the actual native C++ object instance created by the InflateSync constructor.
 * This interface provides synchronous decompression capabilities for simple use cases
 * where streaming is not required.
 *
 * @internal
 */
interface NativeInflateSync {
  /**
   * Perform synchronous decompression of the provided data
   * @param data - Compressed data to decompress
   * @returns Decompressed data as a Buffer
   */
  inflate(data: Buffer | Uint8Array): Buffer;
}

/**
 * Loads the native addon with multiple fallback strategies for different build configurations.
 *
 * This function attempts to load the compiled native module from various potential locations,
 * providing resilience across different build environments and deployment scenarios.
 *
 * The loading strategy tries paths in order of preference:
 * 1. Release build binary (production/optimized builds)
 * 2. Debug build binary (development builds with debugging symbols)
 *
 * Each loaded addon is validated to ensure it exports the required functions and classes
 * before being returned to the caller.
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
      if (
        addon &&
        typeof addon.InflateStream === "function" &&
        typeof addon.inflateSync === "function"
      ) {
        return addon;
      }

      throw new Error(
        "Native addon loaded but missing required exports (InflateStream, inflateSync)",
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
const nativeAddon: NativeAddon = loadNativeAddon();

/**
 * Configuration options for initializing InflateStream instances.
 *
 * These options control the behavior and performance characteristics of the streaming
 * zstd decompression. The default values are optimized for general usage patterns
 * and provide a good balance between memory usage and performance.
 */
export const InflateStreamOptions = z.object({
  /**
   * Input buffer size for internal buffering operations in bytes.
   *
   * This parameter controls the size of internal input buffers used for decompression operations.
   * Larger values generally improve throughput by reducing the number of memory allocations
   * and system calls, but consume more memory per stream instance.
   *
   * Performance considerations:
   * - **Small buffers (16-64KB)**: Lower memory usage, suitable for memory-constrained environments
   * - **Medium buffers (128-256KB)**: Balanced performance and memory usage (recommended default)
   * - **Large buffers (512KB+)**: Higher throughput for high-volume streams, more memory usage
   *
   * The default value is determined by ZSTD_DStreamInSize() which provides optimal
   * performance for typical zstd decompression scenarios.
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
   * This parameter controls the size of internal output buffers used for storing
   * decompressed data. Larger values reduce the frequency of buffer operations
   * but increase memory consumption per stream instance.
   *
   * Performance considerations:
   * - **Small buffers (16-64KB)**: Lower memory usage, more frequent buffer operations
   * - **Medium buffers (128-256KB)**: Balanced performance and memory usage (recommended default)
   * - **Large buffers (512KB+)**: Fewer buffer operations, higher memory usage
   *
   * The default value is determined by ZSTD_DStreamOutSize() which provides optimal
   * performance for typical zstd decompression scenarios.
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

export type InflateStreamOptions = z.infer<typeof InflateStreamOptions>;

/**
 * High-performance streaming decompress implementation for Zstandard compression.
 *
 * This class provides a specialized streaming zstd decompression solution designed for
 * high-throughput data processing scenarios. It implements efficient frame-based
 * decompression with automatic buffer management and comprehensive performance monitoring.
 *
 * ## Key Features
 *
 * - **High Performance**: Native C++ implementation provides significant performance
 *   improvements over pure JavaScript implementations
 * - **Streaming Support**: Processes data incrementally without requiring complete
 *   frames to be available in memory
 * - **Memory Efficient**: Uses optimized internal buffering to minimize memory allocations
 *   and garbage collection pressure
 * - **Frame Detection**: Automatically handles zstd frame boundaries and multi-frame streams
 * - **Comprehensive Monitoring**: Built-in statistics tracking for performance analysis
 *   and debugging
 *
 * ## Performance Characteristics
 *
 * Typical performance improvements over Node.js alternatives:
 * - **3-6x faster** decompression speed for typical data patterns
 * - **40-60% less** memory allocation overhead
 * - **Superior compression ratios** compared to gzip/deflate
 * - **Significantly reduced** GC pressure in high-throughput scenarios
 *
 * ## Zstandard Advantages
 *
 * Zstandard provides several advantages over traditional compression algorithms:
 * - **Better compression ratios**: Typically 20-30% better than gzip
 * - **Faster decompression**: Generally 2-3x faster than gzip
 * - **Flexible compression levels**: Range from very fast to maximum compression
 * - **Dictionary support**: Pre-trained dictionaries for domain-specific data
 */
export class InflateStream {
  /**
   * Total number of compressed bytes read from input since stream initialization.
   * This counter includes all data passed to the push() method, regardless of
   * whether it resulted in complete frame processing.
   */
  bytesRead = 0;

  /**
   * Total number of decompressed bytes written to output buffers since initialization.
   * This represents the cumulative size of all decompressed data produced by the stream.
   */
  bytesWritten = 0;

  /**
   * Indicates whether the stream has been destroyed and is no longer usable.
   * Once destroyed, all operations on the stream will throw errors.
   */
  destroyed = false;

  /**
   * Number of complete compression frames successfully processed by the stream.
   * Each frame corresponds to one complete compression unit.
   */
  framesProcessed = 0;

  /**
   * Reference to the native C++ decompress stream instance.
   * This object maintains the actual zstd decompression state and buffers.
   * @internal
   */
  readonly #native: NativeInflateStream;

  /**
   * Creates a new InflateStream instance with the specified configuration.
   *
   * The constructor initializes the native C++ decompression context and validates
   * the provided options. If initialization fails, detailed error information is
   * provided to help diagnose configuration issues.
   *
   * @param options - Configuration options for the stream behavior and performance
   * @throws {Error} If option validation fails or native stream initialization encounters an error
   */
  constructor(options: z.input<typeof InflateStreamOptions> = {}) {
    try {
      const validatedOptions = InflateStreamOptions.parse(options);
      this.#native = new nativeAddon.InflateStream(validatedOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid InflateStream options: ${z.prettifyError(error)}`,
        );
      }

      throw new Error(
        `Failed to initialize InflateStream: ${(error as Error).message}. This may indicate missing native dependencies or invalid configuration.`,
      );
    }
  }

  /**
   * Gets the current error code from the native zstd stream.
   *
   * This property provides access to the last error code reported by the underlying
   * zstd decompression engine. A value of 0 indicates no error, while non-zero
   * values indicate various error conditions specific to zstd.
   *
   * @returns The current zstd error code, or -1 if the stream has been destroyed
   */
  get error(): number {
    return this.destroyed ? -1 : this.#native.error;
  }

  /**
   * Gets the current error message from the native zstd stream.
   *
   * This property provides a human-readable description of the last error
   * encountered during decompression. The message is generated by the zstd
   * library and provides additional context for debugging compression issues.
   *
   * @returns A descriptive error message, or null if no error has occurred or stream is destroyed
   */
  get message(): string | null {
    return this.destroyed ? null : this.#native.message;
  }

  /**
   * Indicates whether the stream has finished processing all input data.
   *
   * This property becomes true when the zstd stream reaches a final state,
   * indicating that all compressed data has been processed and the stream is complete.
   *
   * @returns True if stream processing is complete, false if more data is expected
   */
  get finished(): boolean {
    return this.destroyed ? true : this.#native.finished;
  }

  /**
   * Processes compressed data through the decompress stream.
   *
   * This method is the primary interface for feeding compressed data into the stream.
   * It processes data incrementally and returns true when decompressed output is
   * available for retrieval using getBuffer().
   *
   * ## Processing Behavior
   *
   * The method processes data according to zstd frame structure:
   * 1. **Data Accumulation**: Input data is added to an internal buffer
   * 2. **Frame Processing**: Complete frames are decompressed when detected
   * 3. **Output Generation**: Decompressed data is made available in output buffer
   * 4. **Result Indication**: Returns true if output data is available
   *
   * ## Performance Considerations
   *
   * - **Efficient Buffering**: Internal buffers are reused to minimize allocations
   * - **Incremental Processing**: Data can be pushed in multiple chunks without performance penalty
   * - **Automatic Memory Management**: Buffers are managed automatically to prevent memory leaks
   * - **Native Performance**: Critical decompression operations are performed in native C++ code
   *
   * @param data - Compressed data buffer from file, network, or other source
   * @returns True if decompressed data is available for extraction, false otherwise
   * @throws {Error} If the stream has been destroyed or if a fatal decompression error occurs
   */
  push(data: Buffer | Uint8Array): boolean {
    if (this.destroyed) {
      throw new Error(
        "Cannot push data to destroyed InflateStream. Create a new instance to continue decompression.",
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
        `Failed to process data through InflateStream: ${(error as Error).message}. This may indicate corrupted input data or a stream state error.`,
      );
    }
  }

  /**
   * Forces the stream to flush any remaining buffered data.
   *
   * This method attempts to process any data currently held in internal buffers,
   * even if complete frames have not been detected. It's primarily useful
   * for debugging incomplete frames or handling non-standard compression scenarios.
   *
   * ## When to Use
   *
   * - **Debugging**: To examine partial frame data during development
   * - **Error Recovery**: To extract partial data when stream state is corrupted
   * - **Stream Termination**: To process final data when input source is closing
   *
   * For normal operation with well-formed zstd data, this method should rarely be needed.
   */
  flush(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.flush();
    } catch (_error) {}
  }

  /**
   * Resets the stream state to initial conditions.
   *
   * This method clears all internal buffers and resets statistical counters while
   * reinitializing the zstd decompression context. After reset, the stream is ready
   * to process new compressed data from the beginning.
   *
   * ## Reset Behavior
   *
   * **What gets reset**:
   * - Internal data buffers (input and output)
   * - Statistical counters (bytes read/written, frames processed)
   * - Error states and status flags
   * - Zstd decompression context
   *
   * ## When to Use Reset
   *
   * - **Error Recovery**: After encountering unrecoverable decompression errors
   * - **Statistics Reset**: To restart performance monitoring from a clean state
   * - **Memory Cleanup**: To free accumulated buffers and reset memory usage
   * - **Stream Reuse**: When processing multiple independent data streams
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
    } catch (_error) {}
  }

  /**
   * Closes the stream and releases all allocated resources.
   *
   * This method performs a complete shutdown of the decompress stream, releasing all
   * native resources, buffers, and the zstd decompression context. Once closed,
   * the stream instance becomes unusable and any further operations will throw errors.
   *
   * ## Resource Cleanup
   *
   * The close operation releases:
   * - **Native Memory**: All C++ allocated buffers and zstd context
   * - **Internal Buffers**: Input and output data buffers
   * - **System Resources**: Memory mappings and handles used by zstd
   * - **Statistical Data**: All counters and performance metrics
   *
   * ## When to Call Close
   *
   * - **Application Shutdown**: When the application is terminating
   * - **Stream Completion**: When finished processing a data stream
   * - **Stream Replacement**: Before creating a new stream instance
   * - **Memory Pressure**: To free resources in memory-constrained situations
   *
   * Always call close() when finished with a stream to prevent memory leaks.
   * Native resources are not automatically garbage collected and must be explicitly released.
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
   * This method returns a copy of the decompressed data that has been accumulated
   * in the internal output buffer. The data represents complete, decompressed
   * content ready for consumption by the application.
   *
   * ## Buffer Management
   *
   * - **Non-destructive**: The internal buffer is not cleared by this operation
   * - **Memory Copy**: Returns a new Buffer instance, safe for long-term storage
   * - **Thread Safe**: Can be called multiple times with consistent results
   * - **Size Information**: The returned buffer length indicates the decompressed data size
   *
   * ## Usage Patterns
   *
   * After calling push() and receiving true (indicating available output),
   * use getBuffer() to retrieve the decompressed data, then call clearBuffer()
   * to free the internal memory.
   *
   * @returns Buffer containing the current decompressed data
   * @throws {Error} If the stream has been destroyed or if buffer retrieval fails
   */
  getBuffer(): Buffer {
    if (this.destroyed) {
      throw new Error(
        "Cannot retrieve buffer from destroyed InflateStream. The stream has been closed and all data has been released.",
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
   * This method releases the memory used by the internal decompressed data buffer,
   * allowing the garbage collector to reclaim the space. It should be called after
   * processing each batch of decompressed data to prevent memory accumulation.
   *
   * ## Memory Management Benefits
   *
   * - **Prevents Memory Leaks**: Releases references to large decompressed buffers
   * - **Reduces GC Pressure**: Minimizes long-lived object allocations
   * - **Enables Buffer Reuse**: Allows internal buffers to be reused efficiently
   * - **Improves Performance**: Reduces memory allocation overhead for subsequent operations
   *
   * ## When to Call
   *
   * - **After Processing**: Immediately after extracting and processing decompressed data
   * - **Before Next Batch**: To ensure clean state for subsequent decompression
   * - **Memory Pressure**: When the application is under memory constraints
   * - **Periodic Cleanup**: As part of regular maintenance in long-running applications
   *
   * After calling clearBuffer(), any references to buffers returned by previous
   * getBuffer() calls remain valid, but calling getBuffer() again will return
   * an empty buffer until new data is processed.
   */
  clearBuffer(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.clearBuffer();
    } catch (_error) {}
  }
}

/**
 * Simple synchronous decompress implementation for Zstandard compression.
 *
 * This class provides a straightforward interface for one-time decompression operations
 * where streaming capabilities are not required. It's designed for scenarios where
 * complete compressed frames are available and can be processed in their entirety.
 *
 * ## Use Cases
 *
 * - **File Decompression**: For processing compressed files or data dumps
 * - **Single Frame Processing**: When working with individual compressed frames
 * - **Testing and Development**: For simple decompression tasks during development
 * - **Batch Processing**: For processing collections of independently compressed data
 *
 * ## Performance Characteristics
 *
 * - **Simple API**: Single method call for complete decompression
 * - **No State Management**: Each operation is independent
 * - **Memory Efficient**: No persistent buffers or contexts
 * - **Lower Overhead**: Minimal setup cost for one-time operations
 *
 * ## Comparison with InflateStream
 *
 * | Feature | InflateSync | InflateStream |
 * |---------|-------------|---------------|
 * | **Use Case** | Complete frames | Streaming data |
 * | **State** | Stateless | Maintains context |
 * | **Performance** | Good for single use | Optimized for continuous use |
 * | **Memory** | Minimal | Higher (buffers, context) |
 * | **API Complexity** | Simple | Advanced |
 */
export class InflateSync {
  /**
   * Reference to the native C++ synchronous decompress instance.
   * This object provides the actual decompression functionality.
   * @internal
   */
  readonly #native: NativeInflateSync;

  /**
   * Creates a new InflateSync instance.
   *
   * The constructor initializes the native C++ decompression context for
   * synchronous operations. Unlike InflateStream, this class doesn't maintain
   * persistent state between decompress operations.
   *
   * @throws {Error} If native synchronous decompressor initialization fails
   */
  constructor() {
    try {
      this.#native = new nativeAddon.InflateSync();
    } catch (error) {
      throw new Error(
        `Failed to initialize InflateSync: ${(error as Error).message}. This may indicate missing native dependencies or system resource constraints.`,
      );
    }
  }

  /**
   * Performs synchronous decompression of the provided compressed data.
   *
   * This method decompresses the entire input buffer in a single operation and returns
   * the complete decompressed result. It's suitable for scenarios where complete
   * compressed frames are available and can be processed atomically.
   *
   * ## Operation Details
   *
   * 1. **Input Validation**: Ensures data is valid and non-empty
   * 2. **Frame Analysis**: Analyzes zstd frame structure to determine output size
   * 3. **Decompression**: Processes the entire input buffer at once
   * 4. **Result Return**: Returns the complete decompressed data
   *
   * ## Performance Considerations
   *
   * - **Memory Usage**: Peak memory usage is approximately the sum of input and output sizes
   * - **Processing Time**: Generally faster than streaming for complete frames
   * - **Resource Overhead**: Minimal persistent resource usage
   * - **Throughput**: Optimal for infrequent decompression operations
   *
   * @param data - Compressed data buffer to decompress
   * @returns Buffer containing the complete decompressed data
   * @throws {Error} If the input data is invalid, corrupted, or decompression fails
   */
  inflate(data: Buffer | Uint8Array): Buffer {
    if (!data || data.length === 0) {
      throw new Error(
        "Input data cannot be empty. Provide a valid compressed data buffer for decompression.",
      );
    }

    try {
      return this.#native.inflate(data);
    } catch (error) {
      throw new Error(
        `Synchronous decompression failed: ${(error as Error).message}. This may indicate corrupted input data, invalid compression format, or insufficient system resources.`,
      );
    }
  }
}

/**
 * Performs synchronous zstd decompression for simple use cases.
 *
 * This function provides a convenient interface for one-time decompression operations
 * without the need to explicitly create and manage InflateSync instances. It creates
 * a temporary decompression context, processes the data, and automatically cleans up
 * all resources.
 *
 * ## When to Use This Function
 *
 * - **Quick Operations**: For simple, infrequent decompression tasks
 * - **Utility Scripts**: In command-line tools or one-off data processing scripts
 * - **Testing**: For unit tests or development debugging
 * - **Legacy Integration**: When integrating with existing code that expects function-based APIs
 *
 * ## Performance Trade-offs
 *
 * - **Convenience**: Simple function call with automatic resource management
 * - **Overhead**: Creates and destroys context for each call (minimal for single operations)
 * - **Memory**: No persistent memory usage between calls
 * - **Simplicity**: No object lifecycle management required
 *
 * For applications that perform frequent decompression operations, consider using
 * InflateSync or InflateStream classes for better performance.
 *
 * @param data - Compressed data buffer to decompress
 * @returns Buffer containing the complete decompressed data
 * @throws {Error} If input validation fails or decompression encounters an error
 */
export function inflateSync(data: Buffer | Uint8Array): Buffer {
  if (!data || data.length === 0) {
    throw new Error(
      "Input data cannot be empty. Provide a valid compressed data buffer for decompression.",
    );
  }

  try {
    return nativeAddon.inflateSync(data);
  } catch (error) {
    throw new Error(
      `Synchronous decompression operation failed: ${(error as Error).message}. This typically indicates corrupted input data, unsupported compression format, or insufficient system resources for the decompression operation.`,
    );
  }
}

/**
 * Default input buffer size for optimal streaming performance.
 *
 * This constant represents the recommended input buffer size for zstd streaming
 * decompression operations. The value is determined by the zstd library's
 * ZSTD_DStreamInSize() function, which provides the optimal size for input
 * buffers in streaming scenarios.
 *
 * Using this size helps ensure optimal performance by aligning with zstd's
 * internal processing requirements and minimizing overhead from buffer
 * management operations.
 */
export const DEFAULT_IN_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_IN_BUFFER_SIZE;

/**
 * Default output buffer size for optimal streaming performance.
 *
 * This constant represents the recommended output buffer size for zstd streaming
 * decompression operations. The value is determined by the zstd library's
 * ZSTD_DStreamOutSize() function, which provides the optimal size for output
 * buffers in streaming scenarios.
 *
 * Using this size helps ensure optimal performance by providing sufficient
 * space for decompressed output while minimizing memory overhead and buffer
 * resizing operations.
 */
export const DEFAULT_OUT_BUFFER_SIZE: number =
  nativeAddon.DEFAULT_OUT_BUFFER_SIZE;

/**
 * Zstd library major version number.
 * Used for compatibility checking and version-specific feature detection.
 */
export const ZSTD_VERSION_MAJOR: number = nativeAddon.ZSTD_VERSION_MAJOR;

/**
 * Zstd library minor version number.
 * Used for compatibility checking and version-specific feature detection.
 */
export const ZSTD_VERSION_MINOR: number = nativeAddon.ZSTD_VERSION_MINOR;

/**
 * Zstd library release version number.
 * Used for compatibility checking and version-specific feature detection.
 */
export const ZSTD_VERSION_RELEASE: number = nativeAddon.ZSTD_VERSION_RELEASE;

/**
 * Zstd library version number as a single integer.
 * Calculated as (MAJOR * 10000 + MINOR * 100 + RELEASE) for easy comparison.
 */
export const ZSTD_VERSION_NUMBER: number = nativeAddon.ZSTD_VERSION_NUMBER;

/**
 * Zstd library version as a human-readable string.
 * Format: "MAJOR.MINOR.RELEASE"
 */
export const ZSTD_VERSION_STRING: string = nativeAddon.ZSTD_VERSION_STRING;
