import { EventEmitter } from "eventemitter3";
import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { CompressionError } from "../errors/index.js";
import { CompressionOptions } from "../schemas/index.js";
import type { CompressionType, GatewayEvents } from "../types/index.js";

export class CompressionService extends EventEmitter<GatewayEvents> {
  #totalSize = 0;
  #chunks: Uint8Array[] = [];
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;

  readonly #options: z.output<typeof CompressionOptions>;

  constructor(options: z.input<typeof CompressionOptions> = {}) {
    super();
    try {
      this.#options = CompressionOptions.parse(options);
    } catch (error) {
      throw CompressionError.validationError(fromError(error).message);
    }
  }

  get compressionType(): CompressionType | undefined {
    return this.#options.type;
  }

  get isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  get isZlib(): boolean {
    return this.#options.type === "zlib-stream";
  }

  get isZstd(): boolean {
    return this.#options.type === "zstd-stream";
  }

  initialize(): void {
    this.destroy();

    try {
      if (this.isZlib) {
        this.#initializeZlib();
      } else if (this.isZstd) {
        this.#initializeZstd();
      }
    } catch (error) {
      throw CompressionError.initializationFailed(
        this.#options.type ?? "unknown",
        error,
      );
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw CompressionError.notInitialized();
    }

    const buffer = Buffer.from(data.buffer, data.byteOffset, data.length);

    try {
      const decompressed = this.isZlib
        ? this.#decompressZlib(buffer)
        : this.#decompressZstd(buffer);

      this.emit(
        "debug",
        `[Gateway:Compression] Decompressed ${buffer.length} bytes to ${decompressed.length} bytes`,
      );

      return decompressed;
    } catch (error) {
      throw CompressionError.decompressionFailed(
        this.#options.type ?? "unknown",
        error,
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

    return this.isZlib ? this.#isZlibFlushMarker(Buffer.from(data)) : true;
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
      throw CompressionError.invalidChunkSize(
        chunk.length,
        this.#options.maxChunkSize,
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
        throw CompressionError.maxChunksExceeded();
      }
    }
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      throw CompressionError.notInitialized();
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
      throw CompressionError.notInitialized();
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
