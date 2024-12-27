import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import { CompressionType } from "../types/index.js";

interface DecompressionContext {
  zlibInflate: zlib.Inflate | null;
  zstdStream: Decompress | null;
  chunks: Uint8Array[];
}

export class CompressionManager {
  static readonly ZLIB_FLUSH_BYTES = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  static readonly MAX_COMPRESSION_SIZE = 1024 * 1024 * 100;
  static readonly CHUNK_SIZE = 128 * 1024;
  static readonly ZLIB_WINDOW_BITS = 15;
  static readonly VALID_COMPRESSION_TYPES = new Set<CompressionType>([
    CompressionType.ZlibStream,
    CompressionType.ZstdStream,
  ]);

  readonly #compressionType: CompressionType | null;
  readonly #context: DecompressionContext = {
    zlibInflate: null,
    zstdStream: null,
    chunks: [],
  };

  #initialized = false;
  #totalProcessed = 0;

  constructor(compressionType: CompressionType | null = null) {
    this.#compressionType = this.#validateCompressionType(compressionType);
  }

  get compressionType(): CompressionType | null {
    return this.#compressionType;
  }

  get isInitialized(): boolean {
    return this.#initialized;
  }

  async initializeCompression(): Promise<void> {
    if (this.#initialized || !this.#compressionType) {
      return;
    }

    try {
      await this.#setupDecompressor();
      this.#initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize compression: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async decompress(data: Buffer | Uint8Array): Promise<Buffer> {
    if (!this.#compressionType) {
      return Buffer.from(data);
    }

    if (!this.#initialized) {
      await this.initializeCompression();
    }

    try {
      const buffer = Buffer.from(data);
      this.#totalProcessed += buffer.length;

      if (this.#totalProcessed > CompressionManager.MAX_COMPRESSION_SIZE) {
        this.destroy();
        throw new Error("Processed data limit exceeded");
      }

      switch (this.#compressionType) {
        case CompressionType.ZlibStream:
          return this.#decompressZlib(buffer);
        case CompressionType.ZstdStream:
          return this.#decompressZstd(buffer);
        default:
          throw new Error(
            `Unsupported compression type: ${this.#compressionType}`,
          );
      }
    } catch (error) {
      throw new Error(
        `Decompression failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  destroy(): void {
    this.#resetContext();
    this.#initialized = false;
    this.#totalProcessed = 0;
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#context.zlibInflate) {
      throw new Error("Zlib decompressor not initialized");
    }

    const shouldFlush = this.#isZlibFlushMarker(data);
    if (!shouldFlush) {
      return Buffer.alloc(0);
    }

    this.#context.zlibInflate.push(data, shouldFlush && zlib.Z_SYNC_FLUSH);

    if (this.#context.zlibInflate.err < 0) {
      throw new Error(`Zlib inflation error: ${this.#context.zlibInflate.msg}`);
    }

    const result = this.#context.zlibInflate.result;
    return Buffer.isBuffer(result) ? result : Buffer.from(result ?? []);
  }

  #decompressZstd(data: Buffer): Buffer {
    if (!this.#context.zstdStream) {
      throw new Error("Zstd decompressor not initialized");
    }

    this.#context.chunks = [];

    try {
      this.#context.zstdStream.push(new Uint8Array(data));

      if (this.#context.chunks.length === 0) {
        return Buffer.alloc(0);
      }

      return this.#combineChunks(this.#context.chunks);
    } catch (error) {
      throw new Error(
        `ZSTD decompression error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async #setupDecompressor(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.#resetContext();

        switch (this.#compressionType) {
          case CompressionType.ZlibStream: {
            this.#context.zlibInflate = new zlib.Inflate({
              chunkSize: CompressionManager.CHUNK_SIZE,
              windowBits: CompressionManager.ZLIB_WINDOW_BITS,
            });

            if (!this.#context.zlibInflate || this.#context.zlibInflate.err) {
              throw new Error(
                `Zlib initialization failed: ${this.#context.zlibInflate?.msg}`,
              );
            }
            resolve();
            break;
          }

          case CompressionType.ZstdStream: {
            this.#context.zstdStream = new Decompress((chunk) => {
              try {
                this.#context.chunks.push(chunk);
              } catch (error) {
                this.#resetContext();
                reject(error);
              }
            });

            if (!this.#context.zstdStream) {
              throw new Error("Zstd initialization failed");
            }
            resolve();
            break;
          }

          default: {
            resolve();
          }
        }
      } catch (error) {
        this.#resetContext();
        reject(error);
      }
    });
  }

  #validateCompressionType(
    type: CompressionType | null,
  ): CompressionType | null {
    if (type === null) {
      return null;
    }

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

  #resetContext(): void {
    this.#context.zlibInflate = null;
    this.#context.zstdStream = null;
    this.#context.chunks = [];
  }
}
