import erlpack from "erlpack";
import type { EncodingType } from "../options/index.js";
import type { PayloadEntity } from "../types/index.js";

const MAX_PAYLOAD_SIZE = 4096;

export class EncodingService {
  readonly #encodingType: EncodingType;

  constructor(encodingType: EncodingType) {
    this.#encodingType = encodingType;
  }

  get encodingType(): EncodingType {
    return this.#encodingType;
  }

  encode(data: PayloadEntity): Buffer | string {
    try {
      const result =
        this.#encodingType === "json"
          ? JSON.stringify(this.#processData(data))
          : erlpack.pack(this.#processData(data));

      const size = Buffer.isBuffer(result)
        ? result.length
        : Buffer.byteLength(result);
      if (size > MAX_PAYLOAD_SIZE) {
        throw new Error(`Payload exceeds ${MAX_PAYLOAD_SIZE} bytes`);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to encode ${this.#encodingType}`, {
        cause: error,
      });
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      return this.#encodingType === "json"
        ? JSON.parse(typeof data === "string" ? data : data.toString("utf-8"))
        : erlpack.unpack(Buffer.isBuffer(data) ? data : Buffer.from(data));
    } catch (error) {
      throw new Error(`Failed to decode ${this.#encodingType}`, {
        cause: error,
      });
    }
  }

  #processData(data: unknown): unknown {
    if (!data || typeof data !== "object") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.#processData(item));
    }

    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.#encodingType === "etf" && typeof key !== "string") {
        throw new Error("ETF keys must be strings");
      }
      processed[key] = this.#processData(value);
    }

    return processed;
  }
}
