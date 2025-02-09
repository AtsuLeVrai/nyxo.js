import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type {
  CompressionOptions,
  CompressionType,
  ZlibCompressionOptions,
  ZstdCompressionOptions,
} from "../options/index.js";

const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);

export class CompressionService {
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;
  #chunks: Uint8Array[] = [];

  readonly #options?: CompressionOptions;

  constructor(options?: CompressionOptions) {
    this.#options = options;
  }

  get compressionType(): CompressionType | undefined {
    return this.#options?.compressionType;
  }

  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  isZlib(
    options: CompressionOptions | undefined,
  ): options is ZlibCompressionOptions {
    return options?.compressionType === "zlib-stream";
  }

  isZstd(
    options: CompressionOptions | undefined,
  ): options is ZstdCompressionOptions {
    return options?.compressionType === "zstd-stream";
  }

  initialize(): void {
    if (!this.#options) {
      return;
    }

    this.destroy();

    try {
      if (this.isZlib(this.#options)) {
        this.#initializeZlib();
      } else if (this.isZstd(this.#options)) {
        this.#initializeZstd();
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize ${this.#options.compressionType} compression`,
        { cause: error },
      );
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Compression not initialized");
    }

    try {
      const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

      if (this.#zlibInflate) {
        return this.#decompressZlib(buffer);
      }

      if (this.#zstdStream) {
        return this.#decompressZstd(buffer);
      }

      throw new Error("No compression handler available");
    } catch (error) {
      throw new Error("Decompression failed", { cause: error });
    }
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
  }

  #initializeZlib(): void {
    if (!(this.#options && this.isZlib(this.#options))) {
      throw new Error("Zlib compression options not available");
    }

    this.#zlibInflate = new zlib.Inflate({
      chunkSize: this.#options.zlibChunkSize,
      windowBits: this.#options.zlibWindowBits,
    });

    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error("Failed to create Zlib inflater");
    }
  }

  #initializeZstd(): void {
    if (!(this.#options && this.isZstd(this.#options))) {
      throw new Error("Zstd compression options not available");
    }

    this.#zstdStream = new Decompress((chunk) => this.#chunks.push(chunk));
    if (!this.#zstdStream) {
      throw new Error("Failed to create Zstd decompressor");
    }
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      return Buffer.alloc(0);
    }

    const hasFlush = data.subarray(-4).equals(ZLIB_FLUSH);
    if (!hasFlush) {
      return Buffer.alloc(0);
    }

    this.#zlibInflate.push(data, zlib.Z_SYNC_FLUSH);

    if (this.#zlibInflate.err) {
      throw new Error("Zlib decompression failed");
    }

    return Buffer.from(this.#zlibInflate.result || []);
  }

  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      return Buffer.alloc(0);
    }

    this.#chunks = [];
    this.#zstdStream.push(new Uint8Array(data));

    if (this.#chunks.length === 0) {
      return Buffer.alloc(0);
    }

    const totalLength = this.#chunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    for (const chunk of this.#chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(combined);
  }
}
