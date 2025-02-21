import { OptionalDeps } from "@nyxjs/core";
import type { Decompress } from "fzstd";
import type { Inflate } from "zlib-sync";
import type { CompressionType } from "../options/index.js";

interface CompressionModules {
  zlib?: typeof import("zlib-sync");
  zstd?: typeof import("fzstd");
}

const ZLIB_FLUSH = Buffer.from([0x00, 0x00, 0xff, 0xff]);

export class CompressionService {
  #zstdStream: Decompress | null = null;
  #zlibInflate: Inflate | null = null;
  #modules: CompressionModules | null = null;
  #chunks: Uint8Array[] = [];

  readonly #type?: CompressionType;

  constructor(type?: CompressionType) {
    this.#type = type;
  }

  get type(): CompressionType | undefined {
    return this.#type;
  }

  isInitialized(): boolean {
    return this.#zlibInflate !== null || this.#zstdStream !== null;
  }

  async initialize(): Promise<void> {
    this.destroy();

    try {
      this.#modules = await this.#createCompressionService();

      if (this.type === "zlib-stream") {
        this.#initializeZlib();
      } else if (this.type === "zstd-stream") {
        this.#initializeZstd();
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${this.type} compression`, {
        cause: error,
      });
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
    this.#modules = null;
    this.#chunks = [];
  }

  #initializeZlib(): void {
    if (!(this.type === "zlib-stream" && this.#modules?.zlib)) {
      throw new Error("Zlib compression options or module not available");
    }

    this.#zlibInflate = new this.#modules.zlib.Inflate({
      chunkSize: 128 * 1024,
      windowBits: 15,
    });

    if (!this.#zlibInflate || this.#zlibInflate.err) {
      throw new Error("Failed to create Zlib inflater");
    }
  }

  #initializeZstd(): void {
    if (!(this.type === "zstd-stream" && this.#modules?.zstd)) {
      throw new Error("Zstd compression options or module not available");
    }

    this.#zstdStream = new this.#modules.zstd.Decompress((chunk) =>
      this.#chunks.push(chunk),
    );

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

    this.#zlibInflate.push(data, this.#modules?.zlib?.Z_SYNC_FLUSH);

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

  async #createCompressionService(): Promise<CompressionModules> {
    const modules: CompressionModules = {};

    if (this.type === "zlib-stream") {
      const zlibModule = await OptionalDeps.import("zlib-sync");
      if (zlibModule) {
        modules.zlib = zlibModule as typeof import("zlib-sync");
      }
    } else if (this.type === "zstd-stream") {
      const zstdModule = await OptionalDeps.import("fzstd");
      if (zstdModule) {
        modules.zstd = zstdModule as typeof import("fzstd");
      }
    }

    if (this.type === "zlib-stream" && !modules.zlib) {
      throw new Error("zlib-sync module required but not available");
    }

    if (this.type === "zstd-stream" && !modules.zstd) {
      throw new Error("fzstd module required but not available");
    }

    return modules;
  }
}
