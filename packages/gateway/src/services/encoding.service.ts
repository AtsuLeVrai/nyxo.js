import { OptionalDeps } from "@nyxjs/core";
import type { EncodingType } from "../options/index.js";
import type { PayloadEntity } from "../types/index.js";

/**
 * Maximum size of a payload in bytes before it's rejected
 */
const MAX_PAYLOAD_SIZE = 4096;

/**
 * Service responsible for encoding and decoding Gateway payloads
 * Supports JSON and ETF (Erlang Term Format) encodings
 */
export class EncodingService {
  /** The erlpack module if available */
  #erlpack: typeof import("erlpack") | null = null;

  /** The encoding type being used */
  readonly #type: EncodingType;

  /**
   * Creates a new EncodingService
   *
   * @param type - The encoding type to use (json or etf)
   */
  constructor(type: EncodingType) {
    this.#type = type;
  }

  /**
   * Gets the encoding type used by this service
   */
  get type(): EncodingType {
    return this.#type;
  }

  /**
   * Initializes the encoding service by loading required modules
   *
   * This must be called before using the service.
   *
   * @throws {Error} If initialization fails or required modules are not available
   */
  async initialize(): Promise<void> {
    if (this.#type !== "etf" || this.#erlpack) {
      return;
    }

    try {
      const erlpackModule = await OptionalDeps.import("erlpack");
      if (erlpackModule) {
        this.#erlpack = erlpackModule as typeof import("erlpack");
      } else {
        throw new Error(
          "erlpack module required for ETF encoding but not available",
        );
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${this.#type} encoding service`, {
        cause: error,
      });
    }
  }

  /**
   * Encodes a payload entity into its string or buffer representation
   *
   * @param data - The payload to encode
   * @returns The encoded data as a string (JSON) or Buffer (ETF)
   * @throws {Error} If encoding fails or the payload is too large
   */
  encode(data: PayloadEntity): Buffer | string {
    try {
      const result = this.#encodeData(data);
      this.#validatePayloadSize(result);
      return result;
    } catch (error) {
      throw new Error(`Failed to encode ${this.#type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Decodes a string or buffer into a payload entity
   *
   * @param data - The encoded data to decode
   * @returns The decoded payload entity
   * @throws {Error} If decoding fails
   */
  decode(data: Buffer | string): PayloadEntity {
    try {
      if (this.#type === "json") {
        return JSON.parse(
          typeof data === "string" ? data : data.toString("utf-8"),
        );
      }

      if (!this.#erlpack) {
        throw new Error("erlpack module not initialized");
      }

      return this.#erlpack.unpack(
        Buffer.isBuffer(data) ? data : Buffer.from(data),
      );
    } catch (error) {
      throw new Error(`Failed to decode ${this.#type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by the encoding service
   *
   * Should be called when the service is no longer needed.
   */
  destroy(): void {
    this.#erlpack = null;
  }

  /**
   * Internal method to encode data into the appropriate format
   */
  #encodeData(data: unknown): Buffer | string {
    if (this.#type === "json") {
      return JSON.stringify(data);
    }

    if (!this.#erlpack) {
      throw new Error("erlpack module not initialized");
    }

    return this.#erlpack.pack(data);
  }

  /**
   * Validates that the payload size is within acceptable limits
   */
  #validatePayloadSize(data: Buffer | string): void {
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

    if (size > MAX_PAYLOAD_SIZE) {
      throw new Error(
        `Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes (actual: ${size} bytes)`,
      );
    }
  }
}
