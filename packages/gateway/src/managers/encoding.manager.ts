import erlpack from "erlpack";
import { EventEmitter } from "eventemitter3";
import type {
  EncodingType,
  GatewayEvents,
  PayloadEntity,
} from "../types/index.js";

interface ProcessOptions {
  validateEtfKeys?: boolean;
  processBigInts?: boolean;
  validateSnowflakes?: boolean;
}

interface EncodingErrorDetails {
  encoding: EncodingType;
  payloadSize: number;
  operation: "encode" | "decode";
  dataType: string;
}

export class EncodingError extends Error {
  readonly code: string;
  readonly details: EncodingErrorDetails;
  readonly error?: string;

  constructor(message: string, details: EncodingErrorDetails, error?: unknown) {
    super(message);
    this.name = "EncodingError";
    this.code = "ENCODING_ERROR";
    this.details = details;
    this.error = error instanceof Error ? error.message : String(error);
  }

  override toString(): string {
    const { encoding, payloadSize, operation, dataType } = this.details;
    return `EncodingError: ${this.message}
    - Encoding Type: ${encoding}
    - Operation: ${operation}
    - Payload Size: ${payloadSize} bytes
    - Data Type: ${dataType}`;
  }
}

export class EncodingManager extends EventEmitter<GatewayEvents> {
  #lastProcessedSize = 0;
  readonly #maxPayloadSize = 4096;

  readonly #encodingType: EncodingType;

  constructor(encodingType: EncodingType) {
    super();
    this.#encodingType = encodingType;
  }

  get encodingType(): EncodingType {
    return this.#encodingType;
  }

  encode(data: PayloadEntity): Buffer | string {
    const dataType = Array.isArray(data) ? "array" : typeof data;

    try {
      this.emit(
        "debug",
        `[Gateway:Encoding] Starting encoding process - Type: ${this.#encodingType}, Data Type: ${dataType}`,
      );

      const result =
        this.#encodingType === "json"
          ? this.#encodeJson(data)
          : this.#encodeEtf(data);

      const size = Buffer.isBuffer(result)
        ? result.length
        : Buffer.byteLength(result);

      this.#validatePayloadSize(size);
      this.#lastProcessedSize = size;

      this.emit(
        "debug",
        `[Gateway:Encoding] Successfully encoded data - Size: ${size} bytes`,
      );
      return result;
    } catch (error) {
      const encodingError = new EncodingError(
        "Encoding failed",
        {
          encoding: this.#encodingType,
          payloadSize: this.#lastProcessedSize,
          operation: "encode",
          dataType: dataType,
        },
        error,
      );

      this.emit("error", encodingError);
      throw encodingError;
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      const size = Buffer.isBuffer(data)
        ? data.length
        : Buffer.byteLength(data);

      this.emit(
        "debug",
        `[Gateway:Encoding] Starting decoding process - Type: ${this.#encodingType}, Size: ${size} bytes`,
      );

      const result =
        this.#encodingType === "json"
          ? this.#decodeJson(data)
          : this.#decodeEtf(data);

      this.emit(
        "debug",
        `[Gateway:Encoding] Successfully decoded data - Opcode: ${result.op}`,
      );
      return result;
    } catch (error) {
      const encodingError = new EncodingError(
        "Decoding failed",
        {
          encoding: this.#encodingType,
          payloadSize: this.#lastProcessedSize,
          operation: "decode",
          dataType: Buffer.isBuffer(data) ? "buffer" : typeof data,
        },
        error,
      );

      this.emit("error", encodingError);
      throw encodingError;
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
    const payload: PayloadEntity = JSON.parse(strData);

    if (!this.#isValidPayload(payload)) {
      throw new Error("Invalid JSON payload structure");
    }

    return payload;
  }

  #encodeEtf(data: PayloadEntity): Buffer {
    const processed = this.#processData(data, {
      validateEtfKeys: true,
      processBigInts: true,
      validateSnowflakes: true,
    });

    return erlpack.pack(processed);
  }

  #decodeEtf(data: Buffer | string): PayloadEntity {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const payload: PayloadEntity = erlpack.unpack(bufferData);

    if (!this.#isValidPayload(payload)) {
      throw new Error("Invalid ETF payload structure");
    }

    return payload;
  }

  #validatePayloadSize(size: number): void {
    if (size > this.#maxPayloadSize) {
      throw new Error(
        `Payload size of ${size} bytes exceeds maximum size of ${this.#maxPayloadSize} bytes`,
      );
    }
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
          this.emit(
            "debug",
            "[Gateway:Encoding] Invalid ETF key type detected",
          );
          throw new Error("ETF encoding requires string keys");
        }

        processed[key] = this.#processData(value, options);
      }

      return processed;
    }

    return data;
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
