import erlpack from "erlpack";
import { EventEmitter } from "eventemitter3";
import type { z } from "zod";
import type { EncodingOptions } from "../options/index.js";
import type {
  EncodingType,
  GatewayEvents,
  PayloadEntity,
  ProcessOptions,
} from "../types/index.js";

export class EncodingService extends EventEmitter<GatewayEvents> {
  readonly #options: z.output<typeof EncodingOptions>;

  constructor(options: z.output<typeof EncodingOptions>) {
    super();
    this.#options = options;
  }

  get maxPayloadSize(): number {
    return this.#options.maxPayloadSize;
  }

  get encodingType(): EncodingType {
    return this.#options.encodingType;
  }

  isJson(): boolean {
    return this.#options.encodingType === "json";
  }

  isEtf(): boolean {
    return this.#options.encodingType === "etf";
  }

  encode(data: PayloadEntity): Buffer | string {
    try {
      const result = this.isJson()
        ? this.#encodeJson(data)
        : this.#encodeEtf(data);

      const size = Buffer.isBuffer(result)
        ? result.length
        : Buffer.byteLength(result);

      if (size > this.#options.maxPayloadSize) {
        this.emit("payloadSizeExceeded", size, this.#options.maxPayloadSize);
        throw new Error(
          `Payload size ${size} bytes exceeds maximum ${this.#options.maxPayloadSize} bytes`,
        );
      }

      this.emit("debug", `Encoded successfully - Size: ${size} bytes`);

      return result;
    } catch (error) {
      throw new Error(
        `Failed to encode payload: ${this.#options.encodingType}`,
        {
          cause: error,
        },
      );
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      const result = this.isJson()
        ? this.#decodeJson(data)
        : this.#decodeEtf(data);

      this.emit("debug", `Decoded successfully - Opcode: ${result.op}`);

      return result;
    } catch (error) {
      throw new Error(
        `Failed to decode payload: ${this.#options.encodingType}`,
        {
          cause: error,
        },
      );
    }
  }

  #encodeJson(data: unknown): string {
    const processed = this.#processData(data, {
      processBigInts: this.#options.allowBigInts,
    });

    return JSON.stringify(
      processed,
      this.#options.jsonReplacer,
      this.#options.jsonSpaces,
    );
  }

  #encodeEtf(data: unknown): Buffer {
    const processed = this.#processData(data, {
      validateEtfKeys: !this.#options.etfAllowAtomKeys,
      processBigInts: this.#options.allowBigInts,
    });

    return erlpack.pack(processed);
  }

  #decodeJson(data: Buffer | string): PayloadEntity {
    const strData = typeof data === "string" ? data : data.toString("utf-8");
    return JSON.parse(strData, this.#options.jsonReviver);
  }

  #decodeEtf(data: Buffer | string): PayloadEntity {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return erlpack.unpack(bufferData) as PayloadEntity;
  }

  #processData(data: unknown, options: ProcessOptions = {}): unknown {
    try {
      if (data === null || data === undefined) {
        return data;
      }

      if (options.processBigInts && typeof data === "bigint") {
        return data.toString();
      }

      if (Array.isArray(data)) {
        return data.map((item) => this.#processData(item, options));
      }

      if (typeof data === "object" && data !== null) {
        const processed: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
          if (options.validateEtfKeys && typeof key !== "string") {
            this.emit("invalidEtfKey", key);
            this.emit("debug", "Invalid ETF key type detected");

            if (this.#options.etfStrictMode) {
              throw new Error(`Invalid ETF key: ${key} is not a string`);
            }
            continue;
          }

          processed[key] = this.#processData(value, options);
        }

        return processed;
      }

      return data;
    } catch (error) {
      throw new Error("Failed to process data", { cause: error });
    }
  }
}
