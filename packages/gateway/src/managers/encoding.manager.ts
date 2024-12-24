import erlpack from "erlpack";
import { EncodingType, type PayloadEntity } from "../types/index.js";

export class EncodingManager {
  #encodingType: EncodingType;

  constructor(encodingType: EncodingType = EncodingType.Json) {
    if (!Object.values(EncodingType).includes(encodingType)) {
      throw new Error(`Unsupported encoding type: ${encodingType}`);
    }

    this.#encodingType = encodingType;
  }

  encode(data: PayloadEntity): Buffer | string {
    try {
      let encodedData = {} as Buffer | string;

      switch (this.#encodingType) {
        case "json": {
          const processedData = this.#processBigInt(data);
          encodedData = JSON.stringify(processedData);
          break;
        }

        case "etf": {
          if (data.d && typeof data.d === "object") {
            this.#validateEtfKeys(data.d);
          }

          const processedData = this.#processBigInt(data);
          encodedData = erlpack.pack(processedData);
          break;
        }

        default:
          throw new Error(`Unsupported encoding type: ${this.#encodingType}`);
      }

      return encodedData;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      let decodedData = {} as PayloadEntity;

      switch (this.#encodingType) {
        case "json": {
          decodedData = Buffer.isBuffer(data)
            ? JSON.parse(data.toString("utf-8"))
            : JSON.parse(data);
          break;
        }

        case "etf": {
          decodedData = erlpack.unpack(
            Buffer.isBuffer(data) ? data : Buffer.from(data),
          );
          break;
        }

        default:
          throw new Error(`Unsupported encoding type: ${this.#encodingType}`);
      }

      return decodedData;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  getEncodingType(): EncodingType {
    return this.#encodingType;
  }

  setEncodingType(type: EncodingType): void {
    if (!Object.values(EncodingType).includes(type)) {
      throw new Error(`Unsupported encoding type: ${type}`);
    }
    this.#encodingType = type;
  }

  #validateEtfKeys(data: unknown): void {
    if (data === null || data === undefined) {
      return;
    }

    this.#validateEtfArray(data);
    this.#validateEtfObject(data);
  }

  #validateEtfArray(data: unknown): void {
    if (!Array.isArray(data)) {
      return;
    }

    for (const item of data) {
      if (this.#isObject(item)) {
        this.#validateEtfKeys(item);
      }
    }
  }

  #validateEtfObject(data: unknown): void {
    if (!this.#isObject(data) || Array.isArray(data)) {
      return;
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof key !== "string") {
        throw new Error("ETF encoding requires string keys");
      }

      if (this.#isObject(value)) {
        this.#validateEtfKeys(value);
      }
    }
  }

  #isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null;
  }

  #processBigInt(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === "bigint") {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.#processBigInt(item));
    }

    if (typeof data === "object") {
      const processed: { [key: string]: unknown } = {};
      for (const [key, value] of Object.entries(data)) {
        processed[key] = this.#processBigInt(value);
      }
      return processed;
    }

    return data;
  }
}
