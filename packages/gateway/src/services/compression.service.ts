import { EventEmitter } from "eventemitter3";
import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type { z } from "zod";
import type { CompressionOptions, CompressionType } from "../options/index.js";
import type { GatewayEvents } from "../types/index.js";

export class CompressionService extends EventEmitter<GatewayEvents> {
  #totalSize = 0;
  #chunks: Uint8Array[] = [];
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;

  readonly #options: z.output<typeof CompressionOptions>;

  constructor(options: z.output<typeof CompressionOptions>) {
    super();
    this.#options = options;
  }

  get compressionType(): CompressionType | undefined {
    return this.#options.compressionType;
  }

  isZlib(): boolean {
    return this.#options.compressionType === "zlib-stream";
  }

  isZstd(): boolean {
    return this.#options.compressionType === "zstd-stream";
  }

  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  initialize(): void {
    this.destroy();

    try {
      if (this.isZlib()) {
        this.#initializeZlib();
      } else if (this.isZstd()) {
        this.#initializeZstd();
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize compression for ${this.#options.compressionType}`,
        {
          cause: error,
        },
      );
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw new Error("Compression service is not initialized");
    }

    const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

    try {
      const decompressed = this.isZlib()
        ? this.#decompressZlib(buffer)
        : this.#decompressZstd(buffer);

      this.emit(
        "debug",
        `[Gateway:Compression] Decompressed ${buffer.length} bytes to ${decompressed.length} bytes`,
      );

      return decompressed;
    } catch (error) {
      throw new Error(
        `Failed to decompress data using ${this.#options.compressionType}`,
        {
          cause: error,
        },
      );
    }
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
    this.emit("debug", "[Gateway:Compression] Service destroyed");
  }

  validateBuffer(data: Buffer | Uint8Array): boolean {
    if (!this.#options.validateBuffers) {
      return true;
    }

    return this.isZlib() ? this.#isZlibFlushMarker(Buffer.from(data)) : true;
  }

  #initializeZlib(): void {
    this.#zlibInflate = new zlib.Inflate({
      chunkSize: this.#options.zlibChunkSize,
      windowBits: this.#options.zlibWindowBits,
    });

    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error(
        this.#zlibInflate?.msg ?? "Failed to create Zlib inflater",
      );
    }

    this.emit("debug", "[Gateway:Compression] Zlib initialization successful");
  }

  #initializeZstd(): void {
    this.#zstdStream = new Decompress((chunk) => this.#handleChunk(chunk));

    if (!this.#zstdStream) {
      throw new Error("Failed to create Zstd decompressor");
    }

    this.emit("debug", "[Gateway:Compression] Zstd initialization successful");
  }

  #handleChunk(chunk: Uint8Array): void {
    if (
      this.#options.maxChunkSize &&
      chunk.length > this.#options.maxChunkSize
    ) {
      this.emit("chunkSizeExceeded", chunk.length, this.#options.maxChunkSize);
      throw new Error(
        `Zstd chunk size exceeded - Received: ${chunk.length} bytes, Max: ${this.#options.maxChunkSize} bytes`,
      );
    }

    try {
      this.#chunks.push(chunk);
      this.#totalSize += chunk.length;
    } catch {
      if (this.#options.autoCleanChunks) {
        this.#chunks = [];
        this.#chunks.push(chunk);
        this.#totalSize += chunk.length;
      } else {
        throw new Error("Zstd chunk buffer exceeded");
      }
    }
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      throw new Error("Zlib inflater is not initialized");
    }

    if (this.#options.validateBuffers && !this.#isZlibFlushMarker(data)) {
      return Buffer.alloc(0);
    }

    this.#zlibInflate.push(data, zlib.Z_SYNC_FLUSH);

    if (this.#zlibInflate.err < 0) {
      throw new Error(this.#zlibInflate.msg ?? "Zlib decompression failed");
    }

    const result = this.#zlibInflate.result;
    return Buffer.isBuffer(result) ? result : Buffer.from(result ?? []);
  }

  #isZlibFlushMarker(data: Buffer): boolean {
    if (data.length < this.#options.zlibFlushBytes.length) {
      return false;
    }

    const suffixStart = data.length - this.#options.zlibFlushBytes.length;
    return data.subarray(suffixStart).equals(this.#options.zlibFlushBytes);
  }

  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      throw new Error("Zstd decompressor is not initialized");
    }

    this.#chunks = [];
    this.#zstdStream.push(new Uint8Array(data));

    const newChunks = this.#chunks.slice(this.#totalSize);
    if (newChunks.length === 0) {
      return Buffer.alloc(0);
    }

    return this.#combineChunks(newChunks);
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
