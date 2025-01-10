import { EventEmitter } from "eventemitter3";
import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import { CompressionOptions, type CompressionType } from "../schemas/index.js";
import type { GatewayEvents } from "../types/index.js";

export class CompressionService extends EventEmitter<GatewayEvents> {
  #chunks: Uint8Array[] = [];
  #totalMemoryUsage = 0;
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;

  readonly #options: CompressionOptions;

  constructor(options: Partial<CompressionOptions> = {}) {
    super();
    this.#options = CompressionOptions.parse(options);
  }

  get compressionType(): CompressionType | undefined {
    return this.#options.type;
  }

  get isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  get chunksCount(): number {
    return this.#chunks.length;
  }

  get totalProcessedSize(): number {
    return this.#chunks.reduce((total, chunk) => total + chunk.length, 0);
  }

  get lastChunkSize(): number | undefined {
    return this.#chunks.length > 0 ? this.#chunks.at(-1)?.length : undefined;
  }

  get isZlib(): boolean {
    return this.#options.type === "zlib-stream";
  }

  get isZstd(): boolean {
    return this.#options.type === "zstd-stream";
  }

  get currentOptions(): Readonly<CompressionOptions> {
    return Object.freeze({ ...this.#options });
  }

  initialize(): void {
    this.destroy();

    if (this.isZlib) {
      this.#zlibInflate = new zlib.Inflate({
        chunkSize: this.#options.zlibChunkSize,
        windowBits: this.#options.zlibWindowBits,
      });

      if (!this.#zlibInflate || this.#zlibInflate.err) {
        throw new Error(
          `Zlib initialization failed: ${this.#zlibInflate?.msg}`,
        );
      }

      this.emit(
        "debug",
        "[Gateway:Compression] Zlib initialization successful",
      );
    } else if (this.isZstd) {
      this.#zstdStream = new Decompress((chunk) => {
        this.#chunks.push(chunk);
      });

      if (!this.#zstdStream) {
        throw new Error("Zstd initialization failed");
      }

      this.emit(
        "debug",
        "[Gateway:Compression] Zstd initialization successful",
      );
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw new Error("Compression not initialized");
    }

    const buffer = Buffer.from(data);
    const decompressed = this.isZlib
      ? this.#decompressZlib(buffer)
      : this.#decompressZstd(buffer);

    const newMemoryUsage = this.#totalMemoryUsage + decompressed.length;
    if (
      this.#options.maxTotalMemory &&
      newMemoryUsage > this.#options.maxTotalMemory
    ) {
      throw new Error(
        `Memory limit exceeded: ${this.#formatBytes(newMemoryUsage)} > ${this.#formatBytes(this.#options.maxTotalMemory)}`,
      );
    }

    this.#totalMemoryUsage = newMemoryUsage;

    this.emit(
      "debug",
      `[Gateway:Compression] Decompressed ${buffer.length} bytes to ${decompressed.length} bytes`,
    );

    return decompressed;
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];
    this.emit("debug", "[Gateway:Compression] Service destroyed");
  }

  clearChunks(): void {
    const previousCount = this.#chunks.length;
    const previousMemory = this.#totalMemoryUsage;
    this.#chunks = [];
    this.#totalMemoryUsage = 0;

    this.emit(
      "debug",
      `[Gateway:Compression] Cleared ${previousCount} chunks (${this.#formatBytes(previousMemory)})`,
    );
  }

  getChunkAt(index: number): Uint8Array | undefined {
    return this.#chunks[index];
  }

  getLastChunks(count: number): Uint8Array[] {
    return this.#chunks.slice(-count);
  }

  validateBuffer(data: Buffer | Uint8Array): boolean {
    if (this.isZlib) {
      return this.#isZlibFlushMarker(Buffer.from(data));
    }

    return true;
  }

  #formatBytes(bytes: number): string {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  #decompressZlib(data: Buffer): Buffer {
    if (!this.#zlibInflate) {
      throw new Error("Zlib decompressor not initialized");
    }

    if (this.#options.validateBuffers) {
      const shouldFlush = this.#isZlibFlushMarker(data);
      if (!shouldFlush) {
        return Buffer.alloc(0);
      }
    }

    this.#zlibInflate.push(data, zlib.Z_SYNC_FLUSH);

    if (this.#zlibInflate.err < 0) {
      throw new Error(`Zlib inflation error: ${this.#zlibInflate.msg}`);
    }

    const result = this.#zlibInflate.result;
    return Buffer.isBuffer(result) ? result : Buffer.from(result ?? []);
  }

  #isZlibFlushMarker(data: Buffer): data is Buffer {
    if (data.length < this.#options.zlibFlushBytes.length) {
      return false;
    }

    const suffixStart = data.length - this.#options.zlibFlushBytes.length;
    return data.subarray(suffixStart).equals(this.#options.zlibFlushBytes);
  }

  #decompressZstd(data: Buffer): Buffer {
    if (!this.#zstdStream) {
      throw new Error("Zstd decompressor not initialized");
    }

    this.#chunks = [];
    this.#zstdStream.push(new Uint8Array(data));

    if (this.#chunks.length === 0) {
      return Buffer.alloc(0);
    }

    return this.#combineChunks(this.#chunks);
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
