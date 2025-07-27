import { OptionalDeps } from "@nyxojs/core";
import type { ZlibStream } from "@nyxojs/zlib";
import type { ZstdStream } from "@nyxojs/zstd";
import { z } from "zod";

/**
 * Supported Gateway payload compression types.
 * Controls bandwidth optimization for Gateway connections.
 *
 * @public
 */
export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);
export type CompressionType = z.infer<typeof CompressionType>;

/**
 * Service responsible for decompressing Gateway payload data.
 * Supports both Zlib and Zstandard compression with streaming capabilities.
 *
 * @example
 * ```typescript
 * const compression = new CompressionService("zlib-stream");
 * await compression.initialize();
 *
 * const decompressed = compression.decompress(compressedData);
 * console.log("Decompression successful");
 * ```
 *
 * @public
 */
export class CompressionService {
  /**
   * Compression type currently used by this service.
   * Returns null if no compression is used.
   *
   * @readonly
   * @public
   */
  readonly type: CompressionType | null;

  /**
   * High-performance zstd inflate stream instance.
   * Uses @nyxojs/zstd for enhanced performance.
   *
   * @internal
   */
  #zstdInflate: ZstdStream | null = null;

  /**
   * High-performance zlib inflate stream instance.
   * Uses @nyxojs/zlib for enhanced performance.
   *
   * @internal
   */
  #zlibInflate: ZlibStream | null = null;

  /**
   * Creates a new CompressionService instance.
   * Must call initialize() before using for decompression.
   *
   * @param type - Compression type to use, or null to disable compression
   *
   * @example
   * ```typescript
   * const service = new CompressionService("zlib-stream");
   * await service.initialize();
   * ```
   *
   * @public
   */
  constructor(type: CompressionType | null = null) {
    this.type = type;
  }

  /**
   * Checks if service uses Zlib compression.
   * Useful for conditional logic without string comparisons.
   *
   * @returns True if using Zlib compression
   *
   * @public
   */
  get isZlib(): boolean {
    return this.type === "zlib-stream";
  }

  /**
   * Checks if service uses Zstandard compression.
   * Useful for conditional logic without string comparisons.
   *
   * @returns True if using Zstandard compression
   *
   * @public
   */
  get isZstd(): boolean {
    return this.type === "zstd-stream";
  }

  /**
   * Checks if service has been successfully initialized.
   * Returns true if ready for decompression operations.
   *
   * @returns True if service is initialized and ready
   *
   * @public
   */
  get isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdInflate !== null;
  }

  /**
   * Initializes compression service by loading required modules.
   * Must be called before using service for decompression.
   *
   * @throws {Error} If initialization fails due to missing dependencies
   *
   * @example
   * ```typescript
   * const service = new CompressionService("zlib-stream");
   * await service.initialize();
   * // Service is now ready for decompression
   * ```
   *
   * @public
   */
  async initialize(): Promise<void> {
    this.destroy();

    if (!this.type) {
      return;
    }

    try {
      if (this.isZlib) {
        await this.#initializeZlib();
      } else if (this.isZstd) {
        await this.#initializeZstd();
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${this.type} compression service`, {
        cause: error,
      });
    }
  }

  /**
   * Decompresses data buffer using initialized compression method.
   * Returns decompressed data or empty buffer if message incomplete.
   *
   * @param data - Compressed data to decompress
   * @returns Decompressed data as Buffer
   *
   * @throws {Error} If service not initialized or decompression fails
   *
   * @example
   * ```typescript
   * const decompressed = service.decompress(compressedBuffer);
   * if (decompressed.length > 0) {
   *   console.log("Complete message received");
   * }
   * ```
   *
   * @public
   */
  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw new Error(
        "Compression service not initialized. Call initialize() before using decompress().",
      );
    }

    try {
      if (Buffer.isBuffer(data)) {
        if (this.#zlibInflate) {
          return this.#decompressZlib(data);
        }

        if (this.#zstdInflate) {
          return this.#decompressZstd(data);
        }
      } else {
        const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

        if (this.#zlibInflate) {
          return this.#decompressZlib(buffer);
        }

        if (this.#zstdInflate) {
          return this.#decompressZstd(buffer);
        }
      }

      throw new Error("No compression handler available");
    } catch (error) {
      throw new Error(`Decompression failed using ${this.type}`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by compression service.
   * Should be called when service is no longer needed.
   *
   * @example
   * ```typescript
   * service.destroy();
   * // Service must be re-initialized before next use
   * ```
   *
   * @public
   */
  destroy(): void {
    if (this.#zlibInflate) {
      try {
        this.#zlibInflate.close();
      } catch {
        // Ignore cleanup errors
      }
      this.#zlibInflate = null;
    }

    if (this.#zstdInflate) {
      try {
        this.#zstdInflate.close();
      } catch {
        // Ignore cleanup errors
      }
      this.#zstdInflate = null;
    }
  }

  /**
   * Initializes high-performance Zlib decompression stream.
   * Loads @nyxojs/zlib module and creates optimized InflateStream.
   *
   * @throws {Error} If @nyxojs/zlib module unavailable or initialization fails
   *
   * @internal
   */
  async #initializeZlib(): Promise<void> {
    const result = await OptionalDeps.safeImport<{
      ZlibStream: typeof ZlibStream;
    }>("@nyxojs/zlib");

    if (!result.success) {
      throw new Error(
        "The @nyxojs/zlib module is required for zlib-stream compression but is not available. " +
          "Please install it with: npm install @nyxojs/zlib",
      );
    }

    try {
      this.#zlibInflate = new result.data.ZlibStream();

      if (!this.#zlibInflate) {
        throw new Error("Failed to create InflateStream instance");
      }

      if (this.#zlibInflate.error !== 0) {
        const errorMessage =
          this.#zlibInflate.message || "Unknown error during initialization";
        throw new Error(`InflateStream initialization error: ${errorMessage}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize @nyxojs/zlib: ${(error as Error).message}. This may indicate missing native dependencies, compilation issues, or system constraints.`,
      );
    }
  }

  /**
   * Initializes high-performance Zstandard decompression stream.
   * Loads @nyxojs/zstd module and creates optimized InflateStream.
   *
   * @throws {Error} If @nyxojs/zstd module unavailable or initialization fails
   *
   * @internal
   */
  async #initializeZstd(): Promise<void> {
    const result = await OptionalDeps.safeImport<{
      ZstdStream: typeof ZstdStream;
    }>("@nyxojs/zstd");

    if (!result.success) {
      throw new Error(
        "The @nyxojs/zstd module is required for zstd-stream compression but is not available. " +
          "Please install it with: npm install @nyxojs/zstd",
      );
    }

    try {
      this.#zstdInflate = new result.data.ZstdStream();

      if (!this.#zstdInflate) {
        throw new Error("Failed to create Zstd InflateStream instance");
      }

      if (this.#zstdInflate.error !== 0) {
        const errorMessage =
          this.#zstdInflate.message || "Unknown error during initialization";
        throw new Error(
          `Zstd InflateStream initialization error: ${errorMessage}`,
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize @nyxojs/zstd: ${(error as Error).message}. This may indicate missing native dependencies, compilation issues, or system constraints.`,
      );
    }
  }

  /**
   * Decompresses data using high-performance zlib streaming implementation.
   * Leverages native C++ implementation for optimal performance.
   *
   * @param data - Compressed data buffer from Discord Gateway
   * @returns Decompressed data or empty buffer if message incomplete
   *
   * @throws {Error} If decompression fails
   *
   * @internal
   */
  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      return Buffer.alloc(0);
    }

    try {
      const hasCompleteMessage = this.#zlibInflate.push(data);

      if (this.#zlibInflate.error !== 0) {
        const errorMessage =
          this.#zlibInflate.message ||
          `Zlib error code: ${this.#zlibInflate.error}`;
        throw new Error(`Native zlib decompression failed: ${errorMessage}`);
      }

      if (hasCompleteMessage) {
        const decompressed = this.#zlibInflate.getBuffer();
        this.#zlibInflate.clearBuffer();
        return decompressed;
      }

      return Buffer.alloc(0);
    } catch (error) {
      throw new Error(
        `High-performance zlib decompression failed: ${(error as Error).message}. This may indicate corrupted data, stream state issues, or native module problems.`,
      );
    }
  }

  /**
   * Decompresses data using high-performance Zstd streaming implementation.
   * Leverages native C++ implementation for optimal performance.
   *
   * @param data - Compressed data buffer
   * @returns Decompressed data or empty buffer if no complete frame available
   *
   * @throws {Error} If decompression fails
   *
   * @internal
   */
  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdInflate) {
      return Buffer.alloc(0);
    }

    try {
      const hasCompleteFrame = this.#zstdInflate.push(data);

      if (this.#zstdInflate.error !== 0) {
        const errorMessage =
          this.#zstdInflate.message ||
          `Zstd error code: ${this.#zstdInflate.error}`;
        throw new Error(`Native Zstd decompression failed: ${errorMessage}`);
      }

      if (hasCompleteFrame) {
        const decompressed = this.#zstdInflate.getBuffer();
        this.#zstdInflate.clearBuffer();
        return decompressed;
      }

      return Buffer.alloc(0);
    } catch (error) {
      throw new Error(
        `High-performance Zstd decompression failed: ${(error as Error).message}. This may indicate corrupted data, stream state issues, or native module problems.`,
      );
    }
  }
}
