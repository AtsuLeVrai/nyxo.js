import { loadNativeAddon } from "../utils/index.js";

const native = loadNativeAddon<NativeZstdModule>({
  name: "nyxojs",
  requiredExports: [
    "ZstdStream",
    "DEFAULT_IN_BUFFER_SIZE",
    "DEFAULT_OUT_BUFFER_SIZE",
    "ZSTD_VERSION",
  ],
  validate: (addon) => {
    const a = addon as Record<string, unknown>;
    if (typeof a["ZstdStream"] !== "function") {
      throw new Error("ZstdStream must be a constructor function");
    }
    if (typeof a["DEFAULT_IN_BUFFER_SIZE"] !== "number") {
      throw new Error("DEFAULT_IN_BUFFER_SIZE must be a number");
    }
  },
});

export interface ZstdStreamOptions {
  inputBufferSize?: number;

  outputBufferSize?: number;
}

export interface ZstdStreamStats {
  bytesRead: number;

  bytesWritten: number;

  framesProcessed: number;

  compressionRatio: number;
}

interface NativeZstdModule {
  ZstdStream: new (options?: ZstdStreamOptions) => NativeZstdStream;
  DEFAULT_IN_BUFFER_SIZE: number;
  DEFAULT_OUT_BUFFER_SIZE: number;
  ZSTD_VERSION: string;
}

interface NativeZstdStream {
  readonly error: number;
  readonly message: string | null;
  readonly bytesRead: number;
  readonly bytesWritten: number;
  readonly finished: boolean;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  reset(): void;

  close(): void;

  getBuffer(): Buffer;

  clearBuffer(): void;
}

export class ZstdStream {
  private readonly stream: NativeZstdStream;

  private frameCount = 0;

  constructor(options?: ZstdStreamOptions) {
    this.stream = new native.ZstdStream(options);
  }

  get error(): number {
    return this.stream.error;
  }

  get message(): string | null {
    return this.stream.message;
  }

  get bytesRead(): number {
    return this.stream.bytesRead;
  }

  get bytesWritten(): number {
    return this.stream.bytesWritten;
  }

  get finished(): boolean {
    return this.stream.finished;
  }

  push(buffer: Buffer | Uint8Array): boolean {
    const result = this.stream.push(buffer);
    if (result) {
      this.frameCount++;
    }
    return result;
  }

  flush(): void {
    this.stream.flush();
  }

  reset(): void {
    this.stream.reset();
    this.frameCount = 0;
  }

  close(): void {
    this.stream.close();
  }

  getBuffer(): Buffer {
    return this.stream.getBuffer();
  }

  clearBuffer(): void {
    this.stream.clearBuffer();
  }

  getStats(): ZstdStreamStats {
    const bytesRead = this.stream.bytesRead;
    const bytesWritten = this.stream.bytesWritten;

    return {
      bytesRead,
      bytesWritten,
      framesProcessed: this.frameCount,
      compressionRatio: bytesRead > 0 ? bytesWritten / bytesRead : 0,
    };
  }
}

export const DEFAULT_IN_BUFFER_SIZE: number = native.DEFAULT_IN_BUFFER_SIZE;

export const DEFAULT_OUT_BUFFER_SIZE: number = native.DEFAULT_OUT_BUFFER_SIZE;

export const ZSTD_VERSION: string = native.ZSTD_VERSION;

function validateBuffer(buffer: unknown): asserts buffer is Buffer | Uint8Array {
  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw new TypeError("Expected Buffer or Uint8Array");
  }
}

export function decompressSync(buffer: Buffer | Uint8Array, options?: ZstdStreamOptions): Buffer {
  validateBuffer(buffer);

  const stream = new ZstdStream(options);
  try {
    stream.push(buffer);
    stream.flush();

    if (stream.error !== 0) {
      throw new Error(`Decompression failed: ${stream.message ?? "Unknown error"}`);
    }

    return stream.getBuffer();
  } finally {
    stream.close();
  }
}

export function decompressWithStats(
  buffer: Buffer | Uint8Array,
  options?: ZstdStreamOptions,
): { data: Buffer; stats: ZstdStreamStats } {
  validateBuffer(buffer);

  const stream = new ZstdStream(options);
  try {
    stream.push(buffer);
    stream.flush();

    if (stream.error !== 0) {
      throw new Error(`Decompression failed: ${stream.message ?? "Unknown error"}`);
    }

    return {
      data: stream.getBuffer(),
      stats: stream.getStats(),
    };
  } finally {
    stream.close();
  }
}

export function createDecompressStream(
  options?: ZstdStreamOptions,
  onData?: (data: Buffer) => void,
  onError?: (error: Error) => void,
): DecompressStreamController {
  const stream = new ZstdStream(options);
  let closed = false;

  return {
    push(buffer: Buffer | Uint8Array): boolean {
      if (closed) {
        throw new Error("Stream is closed");
      }

      try {
        const processed = stream.push(buffer);

        if (stream.error !== 0) {
          const error = new Error(`Decompression error: ${stream.message ?? "Unknown"}`);
          onError?.(error);
          return false;
        }

        if (processed && onData) {
          const output = stream.getBuffer();
          if (output.length > 0) {
            onData(output);
            stream.clearBuffer();
          }
        }

        return processed;
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    },

    flush(): void {
      if (closed) {
        throw new Error("Stream is closed");
      }

      stream.flush();

      if (onData) {
        const output = stream.getBuffer();
        if (output.length > 0) {
          onData(output);
          stream.clearBuffer();
        }
      }
    },

    getStats(): ZstdStreamStats {
      return stream.getStats();
    },

    close(): void {
      if (!closed) {
        stream.close();
        closed = true;
      }
    },

    get finished(): boolean {
      return stream.finished;
    },

    get bytesRead(): number {
      return stream.bytesRead;
    },

    get bytesWritten(): number {
      return stream.bytesWritten;
    },
  };
}

export interface DecompressStreamController {
  readonly finished: boolean;

  readonly bytesRead: number;

  readonly bytesWritten: number;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  getStats(): ZstdStreamStats;

  close(): void;
}

export function isZstdStreamOptions(value: unknown): value is ZstdStreamOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const opts = value as Record<string, unknown>;

  if ("inputBufferSize" in opts && typeof opts["inputBufferSize"] !== "number") {
    return false;
  }

  if ("outputBufferSize" in opts && typeof opts["outputBufferSize"] !== "number") {
    return false;
  }

  return true;
}

export function isZstdStreamStats(value: unknown): value is ZstdStreamStats {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const stats = value as Record<string, unknown>;

  return (
    typeof stats["bytesRead"] === "number" &&
    typeof stats["bytesWritten"] === "number" &&
    typeof stats["framesProcessed"] === "number" &&
    typeof stats["compressionRatio"] === "number"
  );
}
