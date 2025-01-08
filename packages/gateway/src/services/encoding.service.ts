import erlpack from "erlpack";
import { EventEmitter } from "eventemitter3";
import {
  EncodingOptions,
  type EncodingType,
  PayloadEntity,
  ProcessOptions,
} from "../schemas/index.js";
import type { GatewayEvents } from "../types/index.js";

export class EncodingService extends EventEmitter<GatewayEvents> {
  readonly #options: EncodingOptions;

  constructor(options: Partial<EncodingOptions> = {}) {
    super();
    this.#options = EncodingOptions.parse(options);
  }

  get encodingType(): EncodingType {
    return this.#options.encodingType;
  }

  get maxPayloadSize(): number {
    return this.#options.maxPayloadSize;
  }

  get isJson(): boolean {
    return this.#options.encodingType === "json";
  }

  get isEtf(): boolean {
    return this.#options.encodingType === "etf";
  }

  get currentOptions(): Readonly<EncodingOptions> {
    return Object.freeze({ ...this.#options });
  }

  encode(data: PayloadEntity): Buffer | string {
    const result = this.isJson ? this.#encodeJson(data) : this.#encodeEtf(data);

    const size = Buffer.isBuffer(result)
      ? result.length
      : Buffer.byteLength(result);
    this.#validatePayloadSize(size);

    this.emit(
      "debug",
      `[Gateway:Encoding] Encoded successfully - Size: ${size} bytes`,
    );

    return result;
  }

  decode(data: Buffer | string): PayloadEntity {
    const result = this.isJson ? this.#decodeJson(data) : this.#decodeEtf(data);

    this.emit(
      "debug",
      `[Gateway:Encoding] Decoded successfully - Opcode: ${result.op}`,
    );

    return result;
  }

  #encodeJson(data: PayloadEntity): string {
    const processed = this.#processData(data, {
      processBigInts: this.#options.allowBigInts,
      validateSnowflakes: this.#options.validateSnowflakes,
    });

    return JSON.stringify(
      processed,
      this.#options.jsonReplacer,
      this.#options.jsonSpaces,
    );
  }

  #encodeEtf(data: PayloadEntity): Buffer {
    const processed = this.#processData(data, {
      validateEtfKeys: !this.#options.etfAllowAtomKeys,
      processBigInts: this.#options.allowBigInts,
      validateSnowflakes: this.#options.validateSnowflakes,
    });

    return erlpack.pack(processed);
  }

  #decodeJson(data: Buffer | string): PayloadEntity {
    const strData = typeof data === "string" ? data : data.toString("utf-8");
    const payload: PayloadEntity = JSON.parse(
      strData,
      this.#options.jsonReviver,
    );

    if (this.#options.validateKeys && !PayloadEntity.parse(payload)) {
      throw new Error("Invalid JSON payload structure");
    }

    return payload;
  }

  #decodeEtf(data: Buffer | string): PayloadEntity {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const payload: PayloadEntity = erlpack.unpack(bufferData);

    if (this.#options.validateKeys && !PayloadEntity.parse(payload)) {
      throw new Error("Invalid ETF payload structure");
    }

    return payload;
  }

  #validatePayloadSize(size: number): void {
    if (size > this.#options.maxPayloadSize) {
      throw new Error(
        `Payload size ${size} bytes exceeds maximum ${this.#options.maxPayloadSize} bytes`,
      );
    }
  }

  #processData(data: unknown, options: ProcessOptions = {}): unknown {
    const validatedOptions = ProcessOptions.parse(options);

    if (data === null || data === undefined) {
      return data;
    }

    if (validatedOptions.processBigInts && typeof data === "bigint") {
      return data.toString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.#processData(item, validatedOptions));
    }

    if (typeof data === "object" && data !== null) {
      const processed: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        if (validatedOptions.validateEtfKeys && typeof key !== "string") {
          this.emit(
            "debug",
            "[Gateway:Encoding] Invalid ETF key type detected",
          );

          if (this.#options.etfStrictMode) {
            throw new Error("ETF encoding requires string keys");
          }
          continue;
        }
        processed[key] = this.#processData(value, validatedOptions);
      }

      return processed;
    }

    return data;
  }
}
