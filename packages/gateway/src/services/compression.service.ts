import { OptionalDeps } from "@nyxjs/core";
import type fzstd from "fzstd";
import type zlibSync from "zlib-sync";
import { z } from "zod";

/**
 * Marker buffer used to identify the end of a zlib compressed stream.
 * Discord's Gateway uses this specific byte sequence to signal that a complete
 * zlib message has been received when using zlib-stream compression.
 *
 * This marker is crucial for streaming implementations as it allows the receiver
 * to determine when a complete message has been received, even when messages are
 * fragmented across multiple WebSocket frames.
 *
 * @constant {Buffer}
 */
const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);

/**
 * Supported Gateway payload compression types.
 *
 * - zlib-stream: Zlib compression with streaming support, widely compatible
 *   Uses RFC1950 zlib format with Z_SYNC_FLUSH markers
 *   Typical compression ratio: 3-5x for JSON payloads
 *
 * - zstd-stream: Zstandard compression with streaming support
 *   More efficient than zlib (better ratio and speed)
 *   Typical compression ratio: 5-7x for JSON payloads
 *   Requires more recent software support
 *
 * Discord recommends zlib-stream for most applications, while zstd-stream
 * can provide better performance for high-volume connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#compression}
 * @see {@link https://github.com/facebook/zstd} For more information about Zstandard
 */
export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);

export type CompressionType = z.infer<typeof CompressionType>;

/**
 * Service responsible for decompressing Gateway payload data.
 *
 * This service handles the decompression of data received from Discord's Gateway
 * WebSocket connection. It supports both Zlib and Zstandard compression algorithms
 * with streaming capabilities to efficiently process large payloads.
 *
 * Performance considerations:
 * - Enabling compression reduces bandwidth usage by 60-85% depending on payload content
 * - Zstd generally offers 3-5% better compression ratio than Zlib
 * - Zstd typically has 20-30% faster decompression speed than Zlib
 * - CPU usage impact is minimal for modern hardware
 *
 * Compression significantly reduces bandwidth usage for high-volume Gateway connections
 * but requires the corresponding optional dependencies to be installed:
 * - zlib-stream requires 'zlib-sync' (npm install zlib-sync)
 * - zstd-stream requires 'fzstd' (npm install fzstd)
 */
export class CompressionService {
  /**
   * The Zstandard decompression stream instance if using zstd-stream
   * Maintains state between successive calls to decompress()
   * @private
   */
  #zstdStream: fzstd.Decompress | null = null;

  /**
   * The Zlib inflate stream instance if using zlib-stream
   * Maintains decompression context between messages
   * @private
   */
  #zlibInflate: zlibSync.Inflate | null = null;

  /**
   * Collection of output chunks from Zstandard decompression.
   * Used to accumulate partial outputs before combining them.
   * This is necessary because Zstandard's streaming API can emit
   * multiple output chunks for a single input push.
   * @private
   */
  #chunks: Uint8Array[] = [];

  /**
   * The compression type being used by this service instance, or null for no compression
   * When null, the service will pass through data unmodified
   * @private
   */
  readonly #type: CompressionType | null;

  /**
   * Creates a new CompressionService instance.
   *
   * Note that you must call {@link initialize} before using the service for decompression.
   * The constructor only configures the service but doesn't load dependencies or allocate
   * resources for decompression.
   *
   * @param type - The compression type to use, or null to disable compression
   */
  constructor(type: CompressionType | null = null) {
    this.#type = type;
  }

  /**
   * Gets the compression type currently used by this service.
   *
   * This property is useful for checking the current compression type
   * without needing to compare against string literals.
   *
   * @returns The current compression type, or null if no compression is used
   */
  get type(): CompressionType | null {
    return this.#type;
  }

  /**
   * Determines if this service uses Zlib compression.
   *
   * Useful for conditional logic based on the compression type
   * without having to directly compare with string literals.
   *
   * @returns `true` if using Zlib compression, `false` otherwise
   */
  get isZlib(): boolean {
    return this.#type === "zlib-stream";
  }

  /**
   * Determines if this service uses Zstandard compression.
   *
   * Useful for conditional logic based on the compression type
   * without having to directly compare with string literals.
   *
   * @returns `true` if using Zstandard compression, `false` otherwise
   */
  get isZstd(): boolean {
    return this.#type === "zstd-stream";
  }

  /**
   * Checks if the service has been successfully initialized with a compression algorithm.
   *
   * This property indicates whether the service has been properly initialized
   * and is ready to decompress data. It returns `true` if either the Zlib inflater
   * or Zstandard decompressor has been successfully created.
   *
   * @returns `true` if the service has been initialized and is ready for use, `false` otherwise
   */
  get isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  /**
   * Initializes the compression service by loading and setting up required modules.
   *
   * For Zlib compression, this will:
   * - Attempt to load the zlib-sync module
   * - Create an inflate stream with appropriate buffer settings
   * - Configure the stream for optimal Discord Gateway usage
   *
   * For Zstandard compression, this will:
   * - Attempt to load the fzstd module
   * - Create a decompression stream with chunk output collection
   * - Set up the streaming decompression context
   *
   * If no compression type is specified, this resolves immediately.
   *
   * This method must be called before using the service for decompression.
   * It's recommended to call this during application startup to ensure
   * dependencies are available before handling gateway traffic.
   *
   * @throws {Error} If initialization fails due to missing dependencies or invalid configuration
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Ensure clean state before initialization
    this.destroy();

    if (!this.#type) {
      // No compression requested, nothing to initialize
      return;
    }

    try {
      // Initialize the appropriate decompression algorithm
      if (this.isZlib) {
        await this.#initializeZlib();
      } else if (this.isZstd) {
        await this.#initializeZstd();
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize ${this.#type} compression service`,
        {
          cause: error,
        },
      );
    }
  }

  /**
   * Decompresses a data buffer using the initialized compression method.
   *
   * This method processes incoming compressed data and returns the decompressed result.
   * The behavior depends on the compression type:
   *
   * For Zlib streaming:
   * - Checks for the ZLIB_FLUSH marker (0x00 0x00 0xFF 0xFF) at the end of the data
   * - If the marker is present, processes the data and returns the full message
   * - If the marker is absent, returns an empty buffer (message is incomplete)
   *
   * For Zstandard streaming:
   * - Processes the data through the decompression stream
   * - Collects all output chunks and combines them into a single buffer
   * - Returns the combined buffer, or an empty buffer if no output was produced
   *
   * @param data - The compressed data to decompress
   * @returns The decompressed data as a Buffer, or an empty Buffer if the message is incomplete
   * @throws {Error} If the service is not initialized or decompression fails
   */
  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw new Error(
        "Compression service not initialized. Call initialize() before using decompress().",
      );
    }

    try {
      // Convert input to Buffer for consistent handling
      // This ensures we have a proper Buffer regardless of input type
      const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

      // Route to the appropriate decompression method
      if (this.#zlibInflate) {
        return this.#decompressZlib(buffer);
      }

      if (this.#zstdStream) {
        return this.#decompressZstd(buffer);
      }

      throw new Error("No compression handler available");
    } catch (error) {
      throw new Error(`Decompression failed using ${this.#type}`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by the compression service.
   *
   * This method should be called when the service is no longer needed
   * to prevent memory leaks, especially in long-running applications.
   * It resets all internal state and releases any loaded modules.
   *
   * After calling destroy(), the service must be re-initialized with
   * initialize() before it can be used again.
   */
  destroy(): void {
    // Clear Zlib inflate instance
    this.#zlibInflate = null;

    // Clear Zstandard stream instance
    this.#zstdStream = null;

    // Clear accumulated chunks
    this.#chunks = [];
  }

  /**
   * Initializes the Zlib decompression stream.
   *
   * This method:
   * 1. Dynamically loads the zlib-sync module
   * 2. Creates an inflate stream with optimized settings
   * 3. Verifies the inflate stream is working correctly
   *
   * The window bits (15) and chunk size (128KB) are configured for optimal
   * performance with Discord Gateway payloads, balancing memory usage and
   * decompression efficiency.
   *
   * @throws {Error} If the zlib-sync module is not available or initialization fails
   * @private
   */
  async #initializeZlib(): Promise<void> {
    // Attempt to dynamically import the zlib-sync module
    const result =
      await OptionalDeps.safeImport<typeof import("zlib-sync")>("zlib-sync");

    // Check if the import was successful
    if (!result.success) {
      throw new Error(
        "The zlib-sync module is required for zlib-stream compression but is not available. " +
          "Please install it with: npm install zlib-sync",
      );
    }

    // Create Zlib inflate instance with appropriate options
    // - chunkSize: Controls buffer allocation size for efficiency
    // - windowBits: Must be 15 for raw deflate streams (RFC1950 format)
    this.#zlibInflate = new result.data.Inflate({
      chunkSize: 128 * 1024, // 128KB chunk size for efficient memory usage
      windowBits: 15, // Standard window size for maximum compatibility
    });

    // Validate the inflater was created successfully
    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error(
        `Failed to create Zlib inflater: ${this.#zlibInflate?.msg || "Unknown error"}`,
      );
    }
  }

  /**
   * Initializes the Zstandard decompression stream.
   *
   * This method:
   * 1. Dynamically loads the fzstd module
   * 2. Creates a decompression stream with a chunk collector callback
   * 3. Verifies the decompression stream is working correctly
   *
   * The chunk collector callback accumulates decompressed data chunks
   * which will later be combined into complete messages.
   *
   * @throws {Error} If the fzstd module is not available or initialization fails
   * @private
   */
  async #initializeZstd(): Promise<void> {
    // Attempt to dynamically import the fzstd module
    const result =
      await OptionalDeps.safeImport<typeof import("fzstd")>("fzstd");

    // Check if the import was successful
    if (!result.success) {
      throw new Error(
        "The fzstd module is required for zstd-stream compression but is not available. " +
          "Please install it with: npm install fzstd",
      );
    }

    // Create Zstandard decompress instance with chunk collector callback
    // The callback adds each output chunk to our chunks array for later assembly
    this.#zstdStream = new result.data.Decompress((chunk) =>
      this.#chunks.push(chunk),
    );

    // Validate the decompressor was created successfully
    if (!this.#zstdStream) {
      throw new Error("Failed to create Zstd decompressor");
    }
  }

  /**
   * Decompresses data using Zlib streaming.
   *
   * This method processes compressed data through the Zlib inflate stream
   * and checks for the ZLIB_FLUSH marker to determine if a complete message
   * has been received.
   *
   * The ZLIB_FLUSH marker is a 4-byte sequence (0x00, 0x00, 0xFF, 0xFF) that
   * Discord appends to each complete message when using zlib-stream compression.
   * Its presence indicates that we can extract the complete decompressed message.
   *
   * @param data - The compressed data buffer
   * @returns The decompressed data, or an empty buffer if the message is incomplete
   * @throws {Error} If Zlib decompression fails with detailed error information
   * @private
   */
  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      return Buffer.alloc(0);
    }

    // Check for Z_SYNC_FLUSH marker at the end of the message
    // Discord's gateway requires this marker at the end of each complete message
    const hasFlush = data.subarray(-4).equals(ZLIB_FLUSH);
    if (!hasFlush) {
      // Not a complete message, wait for more data
      return Buffer.alloc(0);
    }

    // Process the data through the inflate stream
    // Z_SYNC_FLUSH (2) tells zlib to process all available input and flush output
    this.#zlibInflate.push(data, 2);

    // Check for decompression errors
    if (this.#zlibInflate.err) {
      throw new Error(`Zlib decompression failed: ${this.#zlibInflate.msg}`);
    }

    // Return the decompressed result
    return Buffer.from(this.#zlibInflate.result as Uint8Array);
  }

  /**
   * Decompresses data using Zstandard streaming.
   *
   * This method processes compressed data through the Zstandard decompression stream
   * and combines all output chunks into a single buffer.
   *
   * The Zstandard streaming implementation:
   * 1. Resets the chunk collection array
   * 2. Pushes compressed data into the decompression stream
   * 3. Collects output chunks via the callback provided during initialization
   * 4. Calculates the total size of all chunks
   * 5. Combines chunks into a single contiguous buffer
   *
   * @param data - The compressed data buffer
   * @returns The decompressed data, or an empty buffer if no output was produced
   * @private
   */
  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      return Buffer.alloc(0);
    }

    // Reset chunks array for new decompression
    // This ensures we're only working with chunks from this call
    this.#chunks = [];

    // Process the data through the Zstandard decompression stream
    // This will trigger our callback for each output chunk produced
    this.#zstdStream.push(new Uint8Array(data));

    // Check if we received any output chunks
    if (this.#chunks.length === 0) {
      return Buffer.alloc(0);
    }

    // Calculate total length of all chunks to allocate exact buffer size
    const totalLength = this.#chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );

    // Create a single buffer to hold all chunks
    const combined = new Uint8Array(totalLength);

    // Copy each chunk into the combined buffer at the appropriate offset
    let offset = 0;
    for (const chunk of this.#chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to Node.js Buffer and return
    return Buffer.from(combined);
  }
}
