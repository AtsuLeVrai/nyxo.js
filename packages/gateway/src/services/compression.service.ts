import { OptionalDeps } from "@nyxjs/core";
import type { Decompress } from "fzstd";
import type { Inflate } from "zlib-sync";
import type { CompressionType } from "../options/index.js";

/**
 * Marker buffer used to identify the end of a zlib compressed stream
 */
const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);

/**
 * Service responsible for decompressing Gateway payload data
 *
 * Supports Zlib and Zstandard compression algorithms as specified by Discord's Gateway
 */
export class CompressionService {
  /** Zstandard decompression stream */
  #zstdStream: Decompress | null = null;

  /** Zlib inflate stream */
  #zlibInflate: Inflate | null = null;

  /** Buffer for Zstandard output chunks */
  #chunks: Uint8Array[] = [];

  /** The compression type being used (if any) */
  readonly #type: CompressionType | null;

  /**
   * Creates a new CompressionService
   *
   * @param type - The compression type to use, or undefined for no compression
   */
  constructor(type: CompressionType | null = null) {
    this.#type = type;
  }

  /**
   * Gets the compression type used by this service
   */
  get type(): CompressionType | null {
    return this.#type;
  }

  /**
   * Checks if the service has been successfully initialized with a compression algorithm
   */
  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  /**
   * Initializes the compression service by loading and setting up required modules
   *
   * This must be called before using the service for decompression.
   *
   * @throws {Error} If initialization fails or required modules are not available
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
      if (this.#type === "zlib-stream") {
        await this.#initializeZlib();
      } else if (this.#type === "zstd-stream") {
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
   * Decompresses a data buffer using the initialized compression method
   *
   * @param data - The compressed data to decompress
   * @returns The decompressed data as a Buffer
   * @throws {Error} If the service is not initialized or decompression fails
   */
  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Compression service not initialized");
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
   * Cleans up resources used by the compression service
   *
   * Should be called when the service is no longer needed.
   */
  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
  }

  /**
   * Initializes the Zlib decompression stream
   *
   * @throws {Error} If Zlib initialization fails
   */
  async #initializeZlib(): Promise<void> {
    const result =
      await OptionalDeps.safeImport<typeof import("zlib-sync")>("zlib-sync");
    if (!result.success) {
      throw new Error("zlib-sync module required but not available");
    }

    // Create Zlib inflate instance with appropriate options
    this.#zlibInflate = new result.data.Inflate({
      chunkSize: 128 * 1024, // 128KB chunk size for efficient memory usage
      windowBits: 15, // Standard window size for maximum compatibility
    });

    // Validate the inflater was created successfully
    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error("Failed to create Zlib inflater");
    }
  }

  /**
   * Initializes the Zstandard decompression stream
   *
   * @throws {Error} If Zstandard initialization fails
   */
  async #initializeZstd(): Promise<void> {
    const result =
      await OptionalDeps.safeImport<typeof import("fzstd")>("fzstd");
    if (!result.success) {
      throw new Error("fzstd module required but not available");
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
   * Decompresses data using Zlib
   *
   * @param data - The compressed data
   * @returns The decompressed data
   * @throws {Error} If decompression fails
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
    this.#zlibInflate.push(data, 2);

    // Check for decompression errors
    if (this.#zlibInflate.err) {
      throw new Error(`Zlib decompression failed: ${this.#zlibInflate.msg}`);
    }

    // Return the decompressed result
    return Buffer.from(this.#zlibInflate.result as Uint8Array);
  }

  /**
   * Decompresses data using Zstandard
   *
   * @param data - The compressed data
   * @returns The decompressed data
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
