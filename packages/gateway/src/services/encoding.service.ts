import { OptionalDeps } from "@nyxjs/core";
import { z } from "zod";
import type { PayloadEntity } from "../types/index.js";

/**
 * Maximum size of a payload in bytes before it's rejected.
 * Discord's gateway has a limit of 4096 bytes per payload to prevent abuse
 * and ensure efficient message processing.
 *
 * @constant {number}
 */
const MAX_PAYLOAD_SIZE = 4096;

/**
 * Supported Gateway payload encoding types.
 *
 * - json: Standard JSON encoding - universal compatibility, human-readable but less efficient
 * - etf: Erlang Term Format - binary format used by Discord's backend, more efficient but requires erlpack
 *
 * ETF encoding reduces bandwidth usage and improves performance for high-volume connections,
 * but requires the optional erlpack dependency to be installed.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#encoding-and-compression}
 */
export const EncodingType = z.enum(["json", "etf"]);

export type EncodingType = z.infer<typeof EncodingType>;

/**
 * Service responsible for encoding and decoding Gateway payloads.
 *
 * This service handles the serialization and deserialization of data sent to and
 * received from Discord's Gateway WebSocket connection. It supports both JSON (default)
 * and ETF (Erlang Term Format) encoding schemes.
 *
 * ETF encoding is more efficient than JSON for high-volume applications but requires
 * the optional 'erlpack' npm package to be installed.
 *
 * @example
 * ```typescript
 * // Create and initialize a JSON encoder (most compatible)
 * const jsonEncoder = new EncodingService("json");
 * await jsonEncoder.initialize();
 *
 * // Create and initialize an ETF encoder (more efficient)
 * const etfEncoder = new EncodingService("etf");
 * await etfEncoder.initialize();
 *
 * // Encode a payload
 * const payload = { op: 1, d: { heartbeat: 251 } };
 * const encoded = jsonEncoder.encode(payload);
 *
 * // Decode a payload
 * const decoded = jsonEncoder.decode(encoded);
 * ```
 */
export class EncodingService {
  /** The erlpack module reference if available */
  #erlpack: typeof import("erlpack") | null = null;

  /** The current encoding type being used by this service instance */
  readonly #type: EncodingType;

  /**
   * Creates a new EncodingService instance.
   *
   * Note that you must call {@link initialize} before using the service.
   *
   * @param type - The encoding type to use ("json" or "etf")
   */
  constructor(type: EncodingType) {
    this.#type = type;
  }

  /**
   * Gets the encoding type currently used by this service.
   *
   * @returns The current encoding type ("json" or "etf")
   */
  get type(): EncodingType {
    return this.#type;
  }

  /**
   * Determines if this service uses ETF encoding.
   *
   * @returns `true` if using ETF encoding, `false` if using JSON
   */
  get isEtf(): boolean {
    return this.#type === "etf";
  }

  /**
   * Initializes the encoding service by loading required modules.
   *
   * For ETF encoding, this will attempt to load the erlpack module.
   * For JSON encoding, this resolves immediately as no external modules are required.
   *
   * This method must be called before using the service.
   *
   * @throws {Error} If initialization fails or required modules are not available
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Early return if using JSON encoding or if erlpack is already loaded
    if (!this.isEtf || this.#erlpack) {
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
      throw new Error(`Failed to initialize ${this.#type} encoding service`, {
        cause: error,
      });
    }
  }

  /**
   * Encodes a payload entity into its string or buffer representation.
   *
   * For JSON encoding, this returns a string.
   * For ETF encoding, this returns a Buffer.
   *
   * @param data - The payload to encode
   * @returns The encoded data as a string (JSON) or Buffer (ETF)
   * @throws {Error} If encoding fails, the payload is too large, or the service wasn't initialized
   */
  encode(data: PayloadEntity): Buffer | string {
    try {
      // Verify erlpack is loaded for ETF encoding
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
      throw new Error(`Failed to encode ${this.#type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Decodes a string or buffer into a payload entity.
   *
   * For JSON encoding, this accepts either a string or a UTF-8 Buffer.
   * For ETF encoding, this accepts a Buffer.
   *
   * @param data - The encoded data to decode
   * @returns The decoded payload entity
   * @throws {Error} If decoding fails or the service wasn't initialized
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

      // JSON decoding path
      return JSON.parse(
        typeof data === "string" ? data : data.toString("utf-8"),
      );
    } catch (error) {
      throw new Error(`Failed to decode ${this.#type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by the encoding service.
   *
   * This method should be called when the service is no longer needed
   * to prevent memory leaks, especially in long-running applications.
   */
  destroy(): void {
    this.#erlpack = null;
  }

  /**
   * Validates that the payload size is within acceptable limits.
   *
   * Discord imposes a 4096 byte limit on Gateway payloads. This method
   * ensures that encoded payloads don't exceed this limit.
   *
   * @param data - The encoded payload to validate
   * @throws {Error} If the payload exceeds the maximum size limit
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
