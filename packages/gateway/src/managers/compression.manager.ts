import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type { CompressionType } from "../types/index.js";

export class CompressionManager {
  static readonly ZLIB_FLUSH_BYTES = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  static readonly CHUNK_SIZE = 128 * 1024;
  static readonly ZLIB_WINDOW_BITS = 15;
  static readonly VALID_COMPRESSION_TYPES = new Set<CompressionType>([
    "zlib-stream",
    "zstd-stream",
  ]);

  readonly #compressionType: CompressionType;
  #zlibInflate: zlib.Inflate | null = null;
  #zstdStream: Decompress | null = null;
  #chunks: Uint8Array[] = [];

  constructor(compressionType: CompressionType) {
    this.#compressionType = this.#validateCompressionType(compressionType);
  }

  initializeCompression(): void {
    try {
      this.destroy();

      switch (this.#compressionType) {
        case "zlib-stream": {
          this.#zlibInflate = new zlib.Inflate({
            chunkSize: CompressionManager.CHUNK_SIZE,
            windowBits: CompressionManager.ZLIB_WINDOW_BITS,
          });

          if (!this.#zlibInflate || this.#zlibInflate.err) {
            throw new Error(
              `Zlib initialization failed: ${this.#zlibInflate?.msg}`,
            );
          }

          break;
        }

        case "zstd-stream": {
          this.#zstdStream = new Decompress((chunk) => {
            try {
              this.#chunks.push(chunk);
            } catch {
              this.destroy();
            }
          });

          if (!this.#zstdStream) {
            throw new Error("Zstd initialization failed");
          }

          break;
        }

        default: {
          throw new Error("Invalid compression type");
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize compression: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.#compressionType) {
      return Buffer.from(data);
    }

    const buffer = Buffer.from(data);
    if (this.#compressionType === "zlib-stream") {
      return this.#decompressZlib(buffer);
    }

    return this.#decompressZstd(buffer);
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      throw new Error("Zlib decompressor not initialized");
    }

    const shouldFlush = this.#isZlibFlushMarker(data);
    if (!shouldFlush) {
      return Buffer.alloc(0);
    }

    this.#zlibInflate.push(data, shouldFlush && zlib.Z_SYNC_FLUSH);

    if (this.#zlibInflate.err < 0) {
      throw new Error(`Zlib inflation error: ${this.#zlibInflate.msg}`);
    }

    const result = this.#zlibInflate.result;
    return Buffer.isBuffer(result) ? result : Buffer.from(result ?? []);
  }

  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      throw new Error("Zstd decompressor not initialized");
    }

    this.#chunks = [];

    try {
      this.#zstdStream.push(new Uint8Array(data));

      if (this.#chunks.length === 0) {
        return Buffer.alloc(0);
      }

      return this.#combineChunks(this.#chunks);
    } catch (error) {
      throw new Error(
        `ZSTD decompression error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  #validateCompressionType(type: CompressionType): CompressionType {
    if (!CompressionManager.VALID_COMPRESSION_TYPES.has(type)) {
      throw new Error(
        `Invalid compression type: ${type}. Must be one of: ${[...CompressionManager.VALID_COMPRESSION_TYPES].join(", ")}`,
      );
    }

    return type;
  }

  #isZlibFlushMarker(data: Buffer): boolean {
    if (data.length < CompressionManager.ZLIB_FLUSH_BYTES.length) {
      return false;
    }

    const suffixStart =
      data.length - CompressionManager.ZLIB_FLUSH_BYTES.length;
    return data
      .subarray(suffixStart)
      .equals(CompressionManager.ZLIB_FLUSH_BYTES);
  }

  #combineChunks(chunks: Uint8Array[]): Buffer {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(combined);
  }
}
