import { EventEmitter } from "eventemitter3";
import { Decompress } from "fzstd";
import zlib from "zlib-sync";
import type { CompressionType, GatewayEvents } from "../types/index.js";

export interface CompressionErrorDetails {
  type: CompressionType;
  chunks: number;
  totalSize: number;
  chunkSize: number;
  windowBits: number;
}

export class CompressionError extends Error {
  readonly code: string;
  readonly details: CompressionErrorDetails;
  readonly error?: string;

  constructor(
    message: string,
    details: CompressionErrorDetails,
    error?: unknown,
  ) {
    super(message);
    this.name = "CompressionError";
    this.code = "COMPRESSION_ERROR";
    this.details = details;
    this.error = error instanceof Error ? error.message : String(error);
  }

  override toString(): string {
    const { type, chunks, totalSize, chunkSize, windowBits } = this.details;
    return `CompressionError: ${this.message}
    - Compression Type: ${type}
    - Chunks Count: ${chunks}
    - Total Size: ${totalSize} bytes
    - Chunk Size: ${chunkSize} bytes
    - Window Bits: ${windowBits}`;
  }
}

export class CompressionManager extends EventEmitter<GatewayEvents> {
  #chunks: Uint8Array[] = [];
  #totalProcessedSize = 0;
  #zstdStream: Decompress | null = null;
  #zlibInflate: zlib.Inflate | null = null;
  readonly #zlibFlushBytes = Buffer.from([0x00, 0x00, 0xff, 0xff]);
  readonly #zlibChunkSize = 128 * 1024;
  readonly #zlibWindowBits = 15;

  readonly #compressionType: CompressionType;

  constructor(compressionType: CompressionType) {
    super();
    this.#compressionType = compressionType;
  }

  get compressionType(): CompressionType {
    return this.#compressionType;
  }

  get isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  get totalProcessedSize(): number {
    return this.#totalProcessedSize;
  }

  get chunksCount(): number {
    return this.#chunks.length;
  }

  initializeCompression(): void {
    try {
      this.destroy();

      switch (this.#compressionType) {
        case "zlib-stream": {
          this.#initializeZlib();
          break;
        }
        case "zstd-stream": {
          this.#initializeZstd();
          break;
        }
        default: {
          throw new Error("Invalid compression type");
        }
      }
    } catch (error) {
      const compressionError = new CompressionError(
        "Failed to initialize compression",
        this.#getErrorDetails(),
        error,
      );

      this.emit("error", compressionError);
      throw compressionError;
    }
  }

  decompress(data: Buffer | Uint8Array): Buffer {
    if (!this.isInitialized) {
      throw new CompressionError(
        "Compression not initialized",
        this.#getErrorDetails(),
      );
    }

    const buffer = Buffer.from(data);
    this.#totalProcessedSize += buffer.length;

    this.emit(
      "debug",
      `[Gateway:Compression] Processing data - Size: ${buffer.length} bytes, Total: ${this.#totalProcessedSize} bytes`,
    );

    try {
      const result =
        this.#compressionType === "zlib-stream"
          ? this.#decompressZlib(buffer)
          : this.#decompressZstd(buffer);

      this.emit(
        "debug",
        `[Gateway:Compression] Decompression successful - Result size: ${result.length} bytes`,
      );
      return result;
    } catch (error) {
      const compressionError = new CompressionError(
        `Decompression failed: ${error instanceof Error ? error.message : String(error)}`,
        this.#getErrorDetails(),
      );

      this.emit("error", compressionError);
      throw compressionError;
    }
  }

  destroy(): void {
    this.#zlibInflate = null;
    this.#zstdStream = null;
    this.#chunks = [];

    this.#totalProcessedSize = 0;

    this.emit(
      "warn",
      `[Gateway:Compression] Destroying manager - Type: ${this.#compressionType}`,
    );
  }

  #initializeZlib(): void {
    this.emit(
      "debug",
      `[Gateway:Compression] Initializing Zlib - WindowBits: ${this.#zlibWindowBits}, ChunkSize: ${this.#zlibChunkSize}`,
    );

    this.#zlibInflate = new zlib.Inflate({
      chunkSize: this.#zlibChunkSize,
      windowBits: this.#zlibWindowBits,
    });

    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error(`Zlib initialization failed: ${this.#zlibInflate?.msg}`);
    }

    this.emit("debug", "[Gateway:Compression] Zlib initialization successful");
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
    const finalBuffer = Buffer.isBuffer(result)
      ? result
      : Buffer.from(result ?? []);

    this.emit(
      "debug",
      `[Gateway:Compression] Zlib decompression successful - Result size: ${finalBuffer.length} bytes`,
    );

    return finalBuffer;
  }

  #isZlibFlushMarker(data: Buffer): data is Buffer {
    if (data.length < this.#zlibFlushBytes.length) {
      return false;
    }

    const suffixStart = data.length - this.#zlibFlushBytes.length;
    return data.subarray(suffixStart).equals(this.#zlibFlushBytes);
  }

  #initializeZstd(): void {
    this.emit("debug", "[Gateway:Compression] Initializing Zstd stream");

    this.#zstdStream = new Decompress((chunk) => {
      this.#chunks.push(chunk);
      this.emit(
        "debug",
        `[Gateway:Compression] Zstd chunk processed - Size: ${chunk.length} bytes`,
      );
    });

    if (!this.#zstdStream) {
      throw new Error("Zstd initialization failed");
    }

    this.emit("debug", "[Gateway:Compression] Zstd initialization successful");
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

    const result = this.#combineChunks(this.#chunks);

    this.emit(
      "debug",
      `[Gateway:Compression] Zstd decompression successful - Chunks: ${this.#chunks.length}, Total size: ${result.length} bytes`,
    );

    return result;
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

  #getErrorDetails(): CompressionErrorDetails {
    return {
      type: this.#compressionType,
      chunks: this.#chunks.length,
      totalSize: this.#totalProcessedSize,
      chunkSize: this.#zlibChunkSize,
      windowBits: this.#zlibWindowBits,
    };
  }
}
