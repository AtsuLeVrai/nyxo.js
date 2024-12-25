import erlpack from "erlpack";
import { EncodingType, type PayloadEntity } from "../types/index.js";

interface ProcessOptions {
  validateEtfKeys?: boolean;
  processBigInts?: boolean;
}

export class EncodingManager {
  static readonly ENCODING_TYPES = ["json", "etf"] as const;
  static readonly DEFAULT_ENCODING: EncodingType.Json =
    EncodingType.Json as const;

  readonly #encoding: EncodingType;

  constructor(encoding: EncodingType = EncodingManager.DEFAULT_ENCODING) {
    this.#validateEncodingType(encoding);
    this.#encoding = encoding;
  }

  get encodingType(): EncodingType {
    return this.#encoding;
  }

  encode(data: PayloadEntity): Buffer | string {
    try {
      switch (this.#encoding) {
        case "json":
          return this.#encodeJson(data);
        case "etf":
          return this.#encodeEtf(data);
        default:
          throw new Error(`Invalid encoding type: ${this.#encoding}`);
      }
    } catch (error) {
      throw this.#wrapError("Encoding failed", error);
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      switch (this.#encoding) {
        case "json":
          return this.#decodeJson(data);
        case "etf":
          return this.#decodeEtf(data);
        default:
          throw new Error(`Invalid encoding type: ${this.#encoding}`);
      }
    } catch (error) {
      throw this.#wrapError("Decoding failed", error);
    }
  }

  #encodeJson(data: PayloadEntity): string {
    const processed = this.#processData(data, {
      processBigInts: true,
    });

    return JSON.stringify(processed);
  }

  #decodeJson(data: Buffer | string): PayloadEntity {
    const strData = typeof data === "string" ? data : data.toString("utf-8");
    return JSON.parse(strData) as PayloadEntity;
  }

  #encodeEtf(data: PayloadEntity): Buffer {
    const processed = this.#processData(data, {
      validateEtfKeys: true,
      processBigInts: true,
    });

    return erlpack.pack(processed);
  }

  #decodeEtf(data: Buffer | string): PayloadEntity {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return erlpack.unpack(bufferData) as PayloadEntity;
  }

  #processData(data: unknown, options: ProcessOptions = {}): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (options.processBigInts && typeof data === "bigint") {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.#processData(item, options));
    }

    if (this.#isObject(data)) {
      const processed: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        if (options.validateEtfKeys && typeof key !== "string") {
          throw new Error("ETF encoding requires string keys");
        }

        processed[key] = this.#processData(value, options);
      }

      return processed;
    }

    return data;
  }

  #validateEncodingType(encoding: EncodingType): void {
    if (!EncodingManager.ENCODING_TYPES.includes(encoding)) {
      throw new Error(
        `Invalid encoding type: ${encoding}. Supported types: ${EncodingManager.ENCODING_TYPES.join(", ")}`,
      );
    }
  }

  #isObject(
    value: unknown,
  ): value is Record<string | number | symbol, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  #wrapError(message: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${message}: ${errorMessage}`);
  }
}
