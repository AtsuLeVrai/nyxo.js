import erlpack from "erlpack";
import type { EncodingType, PayloadEntity } from "../types/index.js";

interface ProcessOptions {
  validateEtfKeys?: boolean;
  processBigInts?: boolean;
  validateSnowflakes?: boolean;
}

export class EncodingManager {
  static readonly VALID_ENCODING_TYPES = new Set<EncodingType>(["json", "etf"]);

  readonly #encoding: EncodingType;

  constructor(encoding: EncodingType) {
    this.#encoding = this.#validateEncodingType(encoding);
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
      throw new Error(
        `Encoding failed: ${error instanceof Error ? error.message : String(error)}`,
      );
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
      throw new Error(
        `Decoding failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  #encodeJson(data: PayloadEntity): string {
    const processed = this.#processData(data, {
      processBigInts: true,
      validateSnowflakes: true,
    });

    return JSON.stringify(processed);
  }

  #decodeJson(data: Buffer | string): PayloadEntity {
    const strData = typeof data === "string" ? data : data.toString("utf-8");
    const payload = JSON.parse(strData);

    if (!this.#isValidPayload(payload)) {
      throw new Error("Invalid payload structure");
    }

    return payload;
  }

  #encodeEtf(data: PayloadEntity): Buffer {
    const processed = this.#processData(data, {
      validateEtfKeys: true,
      processBigInts: true,
      validateSnowflakes: true,
    });

    try {
      return erlpack.pack(processed);
    } catch {
      throw new Error("ETF encoding failed - check key types");
    }
  }

  #decodeEtf(data: Buffer | string): PayloadEntity {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const payload = erlpack.unpack(bufferData);

    if (!this.#isValidPayload(payload)) {
      throw new Error("Invalid ETF payload structure");
    }

    return payload;
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

  #validateEncodingType(encoding: EncodingType): EncodingType {
    if (!EncodingManager.VALID_ENCODING_TYPES.has(encoding)) {
      throw new Error(
        `Invalid encoding type: ${encoding}. Must be one of: ${[...EncodingManager.VALID_ENCODING_TYPES].join(", ")}`,
      );
    }

    return encoding;
  }

  #isValidPayload(value: unknown): value is PayloadEntity {
    if (!this.#isObject(value)) {
      return false;
    }

    const hasRequiredFields = "op" in value && "d" in value;
    const hasValidTypes =
      typeof value.op === "number" &&
      (value.s === null || typeof value.s === "number") &&
      (value.t === null || typeof value.t === "string");

    return hasRequiredFields && hasValidTypes;
  }

  #isObject(
    value: unknown,
  ): value is Record<string | number | symbol, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
