import { OptionalDeps } from "@nyxojs/core";
import { z } from "zod";
import type { PayloadEntity } from "../types/index.js";

/**
 * Maximum size of payload in bytes before rejection.
 * Discord's gateway limit to prevent abuse and ensure efficiency.
 *
 * @internal
 */
const MAX_PAYLOAD_SIZE = 4096;

/**
 * Supported Gateway payload encoding types.
 * Controls serialization format for Gateway communication.
 *
 * @public
 */
export const EncodingType = z.enum(["json", "etf"]);
export type EncodingType = z.infer<typeof EncodingType>;

/**
 * Service responsible for encoding and decoding Gateway payloads.
 * Handles serialization between JavaScript objects and wire formats.
 *
 * @example
 * ```typescript
 * const encoding = new EncodingService("json");
 * await encoding.initialize();
 *
 * const encoded = encoding.encode(payload);
 * const decoded = encoding.decode(data);
 * ```
 *
 * @public
 */
export class EncodingService {
  /**
   * Encoding type currently used by this service.
   * Either "json" or "etf" format.
   *
   * @readonly
   * @public
   */
  readonly type: EncodingType;

  /**
   * Erlpack module reference for ETF operations.
   * Null if not initialized or using JSON encoding.
   *
   * @internal
   */
  #erlpack: typeof import("erlpack") | null = null;

  /**
   * Creates a new EncodingService instance.
   * Must call initialize() before using the service.
   *
   * @param type - Encoding type to use ("json" or "etf")
   *
   * @example
   * ```typescript
   * const service = new EncodingService("etf");
   * await service.initialize();
   * ```
   *
   * @public
   */
  constructor(type: EncodingType) {
    this.type = type;
  }

  /**
   * Checks if service uses JSON encoding.
   * Useful for conditional logic without string comparisons.
   *
   * @returns True if using JSON encoding
   *
   * @public
   */
  get isJson(): boolean {
    return this.type === "json";
  }

  /**
   * Checks if service uses ETF encoding.
   * Useful for conditional logic without string comparisons.
   *
   * @returns True if using ETF encoding
   *
   * @public
   */
  get isEtf(): boolean {
    return this.type === "etf";
  }

  /**
   * Initializes encoding service by loading required modules.
   * Must be called before using service for encoding or decoding.
   *
   * @throws {Error} If initialization fails due to missing dependencies
   *
   * @example
   * ```typescript
   * const service = new EncodingService("etf");
   * await service.initialize();
   * // Service is now ready for encoding/decoding
   * ```
   *
   * @public
   */
  async initialize(): Promise<void> {
    if (this.isJson || this.#erlpack) {
      return;
    }

    try {
      const result =
        await OptionalDeps.safeImport<typeof import("erlpack")>("erlpack");

      if (!result.success) {
        throw new Error(
          "The erlpack module is required for ETF encoding but is not available. " +
            "Please install it with: npm install erlpack",
        );
      }

      this.#erlpack = result.data;
    } catch (error) {
      throw new Error(`Failed to initialize ${this.type} encoding service`, {
        cause: error,
      });
    }
  }

  /**
   * Encodes payload entity into string or buffer representation.
   * Validates payload size to ensure Discord compatibility.
   *
   * @param data - Payload object to encode
   * @returns Encoded data as string (JSON) or Buffer (ETF)
   *
   * @throws {Error} If encoding fails, payload too large, or service not initialized
   *
   * @example
   * ```typescript
   * const encoded = service.encode({
   *   op: 1,
   *   d: null,
   *   s: null,
   *   t: null
   * });
   * ```
   *
   * @public
   */
  encode(data: PayloadEntity): Buffer | string {
    try {
      if (this.isEtf && !this.#erlpack) {
        throw new Error(
          "Service not initialized. Call initialize() before using encode().",
        );
      }

      const result = this.isEtf
        ? // biome-ignore lint/style/noNonNullAssertion: It's safe to assert that #erlpack is not null here
          this.#erlpack!.pack(data)
        : JSON.stringify(data);

      this.#validatePayloadSize(result);

      return result;
    } catch (error) {
      throw new Error(`Failed to encode ${this.type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Decodes string or buffer into payload entity.
   * Deserializes data from Discord's Gateway into JavaScript object.
   *
   * @param data - Encoded data to decode (string or Buffer)
   * @returns Decoded payload entity as JavaScript object
   *
   * @throws {Error} If decoding fails or service not initialized
   *
   * @example
   * ```typescript
   * const payload = service.decode(receivedData);
   * console.log(`Received opcode: ${payload.op}`);
   * ```
   *
   * @public
   */
  decode(data: Buffer | string): PayloadEntity {
    try {
      if (this.isEtf) {
        if (!this.#erlpack) {
          throw new Error(
            "Service not initialized. Call initialize() before using decode().",
          );
        }

        return this.#erlpack.unpack(
          Buffer.isBuffer(data) ? data : Buffer.from(data),
        );
      }

      return JSON.parse(
        typeof data === "string" ? data : data.toString("utf-8"),
      );
    } catch (error) {
      throw new Error(`Failed to decode ${this.type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by encoding service.
   * Should be called when service is no longer needed.
   *
   * @example
   * ```typescript
   * service.destroy();
   * // Service must be re-initialized before next use
   * ```
   *
   * @public
   */
  destroy(): void {
    this.#erlpack = null;
  }

  /**
   * Validates payload size is within acceptable limits.
   * Ensures encoded payloads don't exceed Discord's 4096 byte limit.
   *
   * @param data - Encoded payload to validate (Buffer or string)
   *
   * @throws {Error} If payload exceeds maximum size limit
   *
   * @internal
   */
  #validatePayloadSize(data: Buffer | string): void {
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

    if (size > MAX_PAYLOAD_SIZE) {
      throw new Error(
        `Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes (actual: ${size} bytes). Consider splitting large payloads or removing unnecessary data.`,
      );
    }
  }
}
