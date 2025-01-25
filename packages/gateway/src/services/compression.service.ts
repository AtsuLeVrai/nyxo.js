import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type { CompressionType } from "../options/index.js";

const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const ZLIB_CHUNK_SIZE = 128 * 1024;
const ZLIB_WINDOW_BITS = 15;

export class CompressionService {
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;
  #chunks: Uint8Array[] = [];

  readonly #compressionType?: CompressionType;

  constructor(compressionType?: CompressionType) {
    this.#compressionType = compressionType;
  }

  get compressionType(): CompressionType | undefined {
    return this.#compressionType;
  }

  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  initialize(): void {
    this.destroy();

    if (this.#compressionType === "zlib-stream") {
      this.#zlibInflate = new zlib.Inflate({
        chunkSize: ZLIB_CHUNK_SIZE,
        windowBits: ZLIB_WINDOW_BITS,
      });

      if (!this.#zlibInflate || this.#zlibInflate.err) {
        throw new Error("Failed to create Zlib inflater");
      }
    }

    if (this.#compressionType === "zstd-stream") {
      this.#zstdStream = new Decompress((chunk) => this.#chunks.push(chunk));
      if (!this.#zstdStream) {
        throw new Error("Failed to create Zstd decompressor");
      }
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Compression not initialized");
    }

    const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

    if (this.#zlibInflate) {
      return this.#decompressZlib(buffer);
    }

    if (this.#zstdStream) {
      return this.#decompressZstd(buffer);
    }

    throw new Error("No compression handler available");
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
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

    const combined = new Uint8Array(
      this.#chunks.reduce((sum, chunk) => sum + chunk.length, 0),
    );

    let offset = 0;
    for (const chunk of this.#chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(combined);
  }
}
