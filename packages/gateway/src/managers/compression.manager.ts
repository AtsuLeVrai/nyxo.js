import zlib from "zlib-sync";
import { ZstdCodec } from "zstd-codec";
import type { CompressionType } from "../types/index.js";

export class CompressionManager {
  #zlibSuffix = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  #compressionType: CompressionType | null;
  #zlibInflate: zlib.Inflate | null = null;
  #zstdInstance: ZstdCodec.Streaming | null = null;
  #buffer: Buffer = Buffer.alloc(0);
  #initialized = false;

  constructor(compressionType: CompressionType | null = null) {
    this.#compressionType = compressionType;

    this.#initializeCompression().catch((error) => {
      throw new Error(error instanceof Error ? error.message : String(error));
    });
  }

  getCompressionType(): CompressionType | null {
    return this.#compressionType;
  }

  clearBuffer(): void {
    this.#buffer = Buffer.alloc(0);
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdInstance = null;
    this.clearBuffer();
    this.#initialized = false;
  }

  async setCompressionType(type: CompressionType | null): Promise<void> {
    if (this.#buffer.length > 0) {
      throw new Error("Cannot change compression type while processing data");
    }

    if (this.#compressionType === type) {
      return;
    }

    this.#compressionType = type;
    this.#initialized = false;
    this.#zlibInflate = null;
    this.#zstdInstance = null;
    this.clearBuffer();

    if (type) {
      await this.#initializeCompression();
    }
  }

  async decompress(data: Buffer | Uint8Array): Promise<Buffer> {
    await this.#ensureInitialized();

    if (!this.#compressionType) {
      return Buffer.from(data);
    }

    const inputBuffer = Buffer.from(data);

    try {
      switch (this.#compressionType) {
        case "zlib-stream":
          return this.#decompressZlib(inputBuffer);
        case "zstd-stream":
          return this.#decompressZstd(inputBuffer);
        default:
          throw new Error(
            `Unsupported compression type: ${this.#compressionType}`,
          );
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  #decompressZlib(inputBuffer: Buffer): Buffer {
    if (!this.#zlibInflate) {
      throw new Error("Zlib decompression not initialized");
    }

    if (!this.#hasZlibSuffix(inputBuffer)) {
      return Buffer.alloc(0);
    }

    this.#buffer = Buffer.concat([this.#buffer, inputBuffer]);
    this.#zlibInflate.push(this.#buffer, zlib.Z_SYNC_FLUSH);

    if (this.#zlibInflate.err < 0) {
      throw new Error(
        `Zlib decompression failed: ${this.#zlibInflate.msg ?? "Unknown error"}`,
      );
    }

    const result = this.#zlibInflate.result;
    if (!result) {
      throw new Error("Zlib decompression produced no result");
    }

    this.clearBuffer();
    return Buffer.from(result);
  }

  #decompressZstd(inputBuffer: Buffer): Buffer {
    if (!this.#zstdInstance) {
      throw new Error("Zstd decompression not initialized");
    }

    const decompressed = this.#zstdInstance.decompress(
      new Uint8Array(inputBuffer),
    );

    if (!decompressed) {
      throw new Error("Zstd decompression failed");
    }

    return Buffer.from(decompressed);
  }

  async #initializeCompression(): Promise<void> {
    if (this.#initialized || !this.#compressionType) {
      return;
    }

    try {
      switch (this.#compressionType) {
        case "zlib-stream": {
          this.#zlibInflate = new zlib.Inflate({
            chunkSize: 16 * 1024,
            windowBits: 15,
          });
          break;
        }
        case "zstd-stream": {
          await new Promise<void>((resolve, reject) => {
            try {
              ZstdCodec.run((zstd) => {
                this.#zstdInstance = new zstd.Streaming();
                resolve();
              });
            } catch (error) {
              reject(error);
            }
          });
          break;
        }
        default:
          throw new Error(
            `Unsupported compression type: ${this.#compressionType}`,
          );
      }
      this.#initialized = true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async #ensureInitialized(): Promise<void> {
    if (!this.#initialized) {
      await this.#initializeCompression();
    }
  }

  #hasZlibSuffix(data: Buffer): boolean {
    if (data.length < 4) {
      return false;
    }

    return Buffer.compare(data.subarray(-4), this.#zlibSuffix) === 0;
  }
}
