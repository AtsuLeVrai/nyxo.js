import { loadNativeAddon } from "../utils/index.js";

const native = loadNativeAddon<NativeZlibModule>({
  name: "nyxojs",
  requiredExports: ["ZlibStream", "ZLIB_SUFFIX", "DEFAULT_CHUNK_SIZE", "ZLIB_VERSION"],
  validate: (addon) => {
    const a = addon as Record<string, unknown>;
    if (typeof a["ZlibStream"] !== "function") {
      throw new Error("ZlibStream must be a constructor function");
    }
    if (!Buffer.isBuffer(a["ZLIB_SUFFIX"])) {
      throw new Error("ZLIB_SUFFIX must be a Buffer");
    }
  },
});

export interface ZlibStreamOptions {
  windowBits?: number;

  chunkSize?: number;
}

interface NativeZlibModule {
  ZlibStream: new (options?: ZlibStreamOptions) => NativeZlibStream;
  ZLIB_SUFFIX: Buffer;
  DEFAULT_CHUNK_SIZE: number;
  ZLIB_VERSION: string;
}

interface NativeZlibStream {
  readonly error: number;
  readonly message: string | null;
  readonly finished: boolean;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  reset(): void;

  close(): void;

  getBuffer(): Buffer;

  clearBuffer(): void;
}

export class ZlibStream {
  private readonly stream: NativeZlibStream;

  constructor(options?: ZlibStreamOptions) {
    this.stream = new native.ZlibStream(options);
  }

  get error(): number {
    return this.stream.error;
  }

  get message(): string | null {
    return this.stream.message;
  }

  get finished(): boolean {
    return this.stream.finished;
  }

  push(buffer: Buffer | Uint8Array): boolean {
    return this.stream.push(buffer);
  }

  flush(): void {
    this.stream.flush();
  }

  reset(): void {
    this.stream.reset();
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
}

export const ZLIB_SUFFIX: Buffer = native.ZLIB_SUFFIX;

export const DEFAULT_CHUNK_SIZE: number = native.DEFAULT_CHUNK_SIZE;

export const ZLIB_VERSION: string = native.ZLIB_VERSION;

function validateBuffer(buffer: unknown): asserts buffer is Buffer | Uint8Array {
  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw new TypeError("Expected Buffer or Uint8Array");
  }
}

export function inflateSync(buffer: Buffer | Uint8Array, options?: ZlibStreamOptions): Buffer {
  validateBuffer(buffer);

  const stream = new ZlibStream(options);
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

export function hasZlibSuffix(buffer: Buffer | Uint8Array): boolean {
  validateBuffer(buffer);

  if (buffer.length < ZLIB_SUFFIX.length) {
    return false;
  }

  const suffix = buffer.subarray(-ZLIB_SUFFIX.length);
  return ZLIB_SUFFIX.every((byte, index) => byte === suffix[index]);
}

export function createInflateStream(
  options?: ZlibStreamOptions,
  onData?: (data: Buffer) => void,
  onError?: (error: Error) => void,
): InflateStreamController {
  const stream = new ZlibStream(options);
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

    close(): void {
      if (!closed) {
        stream.close();
        closed = true;
      }
    },

    get finished(): boolean {
      return stream.finished;
    },
  };
}

export interface InflateStreamController {
  readonly finished: boolean;

  push(buffer: Buffer | Uint8Array): boolean;

  flush(): void;

  close(): void;
}

export function isZlibStreamOptions(value: unknown): value is ZlibStreamOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const opts = value as Record<string, unknown>;

  if ("windowBits" in opts && typeof opts["windowBits"] !== "number") {
    return false;
  }

  if ("chunkSize" in opts && typeof opts["chunkSize"] !== "number") {
    return false;
  }

  return true;
}
