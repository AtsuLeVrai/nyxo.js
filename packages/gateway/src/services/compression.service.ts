import { OptionalDeps } from "@nyxjs/core";
import type fzstd from "fzstd";
import type zlibSync from "zlib-sync";
import { z } from "zod";

/**
 * Marker buffer used to identify the end of a zlib compressed stream.
 * Discord's Gateway uses this specific byte sequence to signal that a complete
 * zlib message has been received when using zlib-stream compression.
 *
 * @constant {Buffer}
 */
const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);

/**
 * Supported Gateway payload compression types.
 *
 * - zlib-stream: Zlib compression with streaming support, widely compatible
 * - zstd-stream: Zstandard compression with streaming support, more efficient but less common
 *
 * Discord recommends zlib-stream for most applications, while zstd-stream
 * can provide better performance for high-volume connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#compression}
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
 * Compression significantly reduces bandwidth usage for high-volume Gateway connections
 * but requires the corresponding optional dependencies to be installed:
 * - zlib-stream requires 'zlib-sync'
 * - zstd-stream requires 'fzstd'
 *
 * @example
 * ```typescript
 * // Create and initialize a Zlib decompression service
 * const zlibDecompressor = new CompressionService("zlib-stream");
 * await zlibDecompressor.initialize();
 *
 * // Create and initialize a Zstandard decompression service
 * const zstdDecompressor = new CompressionService("zstd-stream");
 * await zstdDecompressor.initialize();
 *
 * // Decompress received gateway data
 * const compressed = receiveDataFromGateway();
 * const decompressed = zlibDecompressor.decompress(compressed);
 * ```
 */
export class CompressionService {
  /** The Zstandard decompression stream instance if using zstd-stream */
  #zstdStream: fzstd.Decompress | null = null;

  /** The Zlib inflate stream instance if using zlib-stream */
  #zlibInflate: zlibSync.Inflate | null = null;

  /**
   * Collection of output chunks from Zstandard decompression.
   * Used to accumulate partial outputs before combining them.
   */
  #chunks: Uint8Array[] = [];

  /** The compression type being used by this service instance, or null for no compression */
  readonly #type: CompressionType | null;

  /**
   * Creates a new CompressionService instance.
   *
   * Note that you must call {@link initialize} before using the service for decompression.
   *
   * @param type - The compression type to use, or null to disable compression
   */
  constructor(type: CompressionType | null = null) {
    this.#type = type;
  }

  /**
   * Gets the compression type currently used by this service.
   *
   * @returns The current compression type, or null if no compression is used
   */
  get type(): CompressionType | null {
    return this.#type;
  }

  /**
   * Determines if this service uses Zlib compression.
   *
   * @returns `true` if using Zlib compression, `false` otherwise
   */
  get isZlib(): boolean {
    return this.#type === "zlib-stream";
  }

  /**
   * Determines if this service uses Zstandard compression.
   *
   * @returns `true` if using Zstandard compression, `false` otherwise
   */
  get isZstd(): boolean {
    return this.#type === "zstd-stream";
  }

  /**
   * Checks if the service has been successfully initialized with a compression algorithm.
   *
   * @returns `true` if the service has been initialized and is ready for use, `false` otherwise
   */
  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  /**
   * Initializes the compression service by loading and setting up required modules.
   *
   * For Zlib compression, this will attempt to load the zlib-sync module.
   * For Zstandard compression, this will attempt to load the fzstd module.
   * If no compression type is specified, this resolves immediately.
   *
   * This method must be called before using the service for decompression.
   *
   * @throws {Error} If initialization fails or required modules are not available
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
   * For Zlib streaming, this detects complete messages by looking for the ZLIB_FLUSH marker.
   * For Zstandard streaming, this processes the data through the decompression stream.
   *
   * @param data - The compressed data to decompress
   * @returns The decompressed data as a Buffer, or an empty Buffer if the message is incomplete
   * @throws {Error} If the service is not initialized or decompression fails
   */
  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized()) {
      throw new Error(
        "Compression service not initialized. Call initialize() before using decompress().",
      );
    }

    try {
      // Convert input to Buffer for consistent handling
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
   */
  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
  }

  /**
   * Initializes the Zlib decompression stream.
   *
   * This method loads the zlib-sync module and configures an inflate stream
   * with appropriate window size and chunk size settings for optimal performance.
   *
   * @throws {Error} If the zlib-sync module is not available or initialization fails
   * @private
   */
  async #initializeZlib(): Promise<void> {
    const result =
      await OptionalDeps.safeImport<typeof import("zlib-sync")>("zlib-sync");
    if (!result.success) {
      throw new Error(
        "The zlib-sync module is required for zlib-stream compression but is not available. " +
          "Please install it with: npm install zlib-sync",
      );
    }

    // Create Zlib inflate instance with appropriate options
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
   * This method loads the fzstd module and configures a decompression stream
   * with a callback to collect output chunks for reassembly.
   *
   * @throws {Error} If the fzstd module is not available or initialization fails
   * @private
   */
  async #initializeZstd(): Promise<void> {
    const result =
      await OptionalDeps.safeImport<typeof import("fzstd")>("fzstd");
    if (!result.success) {
      throw new Error(
        "The fzstd module is required for zstd-stream compression but is not available. " +
          "Please install it with: npm install fzstd",
      );
    }

    // Create Zstandard decompress instance with chunk collector
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
   * and checks for the presence of the ZLIB_FLUSH marker to determine
   * if a complete message has been received.
   *
   * @param data - The compressed data buffer
   * @returns The decompressed data, or an empty buffer if the message is incomplete
   * @throws {Error} If Zlib decompression fails
   * @private
   */
  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      return Buffer.alloc(0);
    }

    // Discord's gateway requires the zlib flush marker at the end of each message
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
   * @param data - The compressed data buffer
   * @returns The decompressed data, or an empty buffer if no output was produced
   * @private
   */
  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      return Buffer.alloc(0);
    }

    // Reset chunks array for new decompression
    this.#chunks = [];

    // Process the data through the Zstandard decompression stream
    this.#zstdStream.push(new Uint8Array(data));

    // Check if we received any output chunks
    if (this.#chunks.length === 0) {
      return Buffer.alloc(0);
    }

    // Calculate total length of all chunks
    const totalLength = this.#chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );

    // Combine all chunks into a single buffer
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    for (const chunk of this.#chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(combined);
  }
}
