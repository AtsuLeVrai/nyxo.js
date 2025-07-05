import { OptionalDeps } from "@nyxojs/core";
import { z } from "zod/v4";
import type { PayloadEntity } from "../types/index.js";

/**
 * Maximum size of a payload in bytes before it's rejected.
 * Discord's gateway has a limit of 4096 bytes per payload to prevent abuse
 * and ensure efficient message processing.
 *
 * This constant is used to validate encoded payloads before sending them to Discord.
 * Exceeding this limit will result in an error, as Discord would reject the payload anyway.
 *
 * Note: After compression, payloads may be significantly smaller than this limit.
 *
 * @constant {number}
 * @see {@link https://discord.com/developers/docs/events/gateway#sending-events}
 */
const MAX_PAYLOAD_SIZE = 4096;

/**
 * Supported Gateway payload encoding types.
 *
 * - json: Standard JSON encoding
 *   - Universal compatibility across all environments
 *   - Human-readable format for easier debugging
 *   - Larger payload size compared to binary formats
 *   - No additional dependencies required
 *
 * - etf: Erlang Term Format
 *   - Binary format used by Discord's backend (based on Erlang/Elixir)
 *   - Significantly smaller payload size (20-30% reduction vs JSON)
 *   - Faster encoding/decoding performance (up to 2-3x faster)
 *   - Requires the optional 'erlpack' dependency
 *
 * ETF encoding reduces bandwidth usage and improves performance for high-volume connections,
 * but requires the optional erlpack dependency to be installed.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#encoding-and-compression}
 * @see {@link https://github.com/discord/erlpack} For more information about ETF and erlpack
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
 * Key features:
 * - Transparent encoding/decoding between JavaScript objects and wire formats
 * - Support for both text-based (JSON) and binary (ETF) formats
 * - Automatic size validation to prevent oversized payloads
 * - Lazy loading of optional dependencies
 *
 * Performance considerations:
 * - JSON: ~500-800 MB/s encoding, ~250-400 MB/s decoding
 * - ETF: ~800-1200 MB/s encoding, ~600-900 MB/s decoding
 * - ETF payloads are typically 20-30% smaller than equivalent JSON
 *
 * ETF encoding is more efficient than JSON for high-volume applications but requires
 * the optional 'erlpack' npm package to be installed.
 */
export class EncodingService {
  /**
   * Gets the encoding type currently used by this service.
   *
   * This property is useful for checking the encoding type
   * without needing to compare with string literals.
   *
   * @returns The current encoding type ("json" or "etf")
   */
  readonly type: EncodingType;

  /**
   * The erlpack module reference if available
   * Used for ETF encoding/decoding operations
   * Null if not initialized or using JSON encoding
   * @internal
   */
  #erlpack: typeof import("erlpack") | null = null;

  /**
   * Creates a new EncodingService instance.
   *
   * Note that you must call {@link initialize} before using the service.
   * The constructor only configures the service but doesn't load dependencies
   * or verify their availability.
   *
   * @param type - The encoding type to use ("json" or "etf")
   */
  constructor(type: EncodingType) {
    this.type = type;
  }

  /**
   * Determines if this service uses JSON encoding.
   *
   * Useful for conditional logic based on the encoding type
   * without having to directly compare with string literals.
   *
   * @returns `true` if using JSON encoding, `false` if using ETF
   */
  get isJson(): boolean {
    return this.type === "json";
  }

  /**
   * Determines if this service uses ETF encoding.
   *
   * Useful for conditional logic based on the encoding type
   * without having to directly compare with string literals.
   *
   * @returns `true` if using ETF encoding, `false` if using JSON
   */
  get isEtf(): boolean {
    return this.type === "etf";
  }

  /**
   * Initializes the encoding service by loading required modules.
   *
   * For ETF encoding, this will:
   * - Attempt to load the erlpack module
   * - Verify the module is properly functional
   * - Store a reference for future encoding/decoding operations
   *
   * For JSON encoding, this resolves immediately as no external modules are required.
   *
   * This method must be called before using the service for encoding or decoding.
   * It's recommended to call this during application startup to ensure
   * dependencies are available before handling gateway traffic.
   *
   * @throws {Error} If initialization fails due to missing dependencies or other errors
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Early return if using JSON encoding or if erlpack is already loaded
    if (this.isJson || this.#erlpack) {
      return;
    }

    try {
      // Attempt to dynamically import the erlpack module
      const result =
        await OptionalDeps.safeImport<typeof import("erlpack")>("erlpack");

      // Check if the import was successful
      if (!result.success) {
        throw new Error(
          "The erlpack module is required for ETF encoding but is not available. " +
            "Please install it with: npm install erlpack",
        );
      }

      // Store the erlpack module reference for later use
      this.#erlpack = result.data;
    } catch (error) {
      // Wrap and rethrow errors with additional context
      throw new Error(`Failed to initialize ${this.type} encoding service`, {
        cause: error,
      });
    }
  }

  /**
   * Encodes a payload entity into its string or buffer representation.
   *
   * This method serializes a JavaScript object (Gateway payload) into
   * either a JSON string or an ETF binary buffer, depending on the
   * configured encoding type.
   *
   * The method also validates the size of the encoded payload to ensure
   * it doesn't exceed Discord's maximum allowed size (4096 bytes).
   *
   * For JSON encoding:
   * - Returns a JSON string representation
   * - No special handling required for WebSocket transmission
   *
   * For ETF encoding:
   * - Returns a binary Buffer containing ETF data
   * - Can be sent directly over WebSocket as binary data
   *
   * @param data - The payload object to encode
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

      // Encode the payload using the appropriate format
      const result = this.isEtf
        ? // biome-ignore lint/style/noNonNullAssertion: It's safe to assert that #erlpack is not null here
          this.#erlpack!.pack(data)
        : JSON.stringify(data);

      // Validate the size of the encoded payload
      this.#validatePayloadSize(result);

      return result;
    } catch (error) {
      // Wrap and rethrow errors with additional context
      throw new Error(`Failed to encode ${this.type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Decodes a string or buffer into a payload entity.
   *
   * This method deserializes data received from Discord's Gateway
   * into a JavaScript object (PayloadEntity) that can be processed
   * by the application.
   *
   * The method handles different input types based on the encoding format:
   *
   * For JSON encoding:
   * - Accepts either a string or a UTF-8 encoded Buffer
   * - Converts Buffer to string if necessary before parsing
   *
   * For ETF encoding:
   * - Accepts a Buffer containing ETF binary data
   * - Converts string inputs to Buffer if necessary
   * - Uses erlpack to unpack the binary data
   *
   * @param data - The encoded data to decode (string or Buffer)
   * @returns The decoded payload entity as a JavaScript object
   * @throws {Error} If decoding fails or the service wasn't initialized
   */
  decode(data: Buffer | string): PayloadEntity {
    try {
      // ETF decoding path
      if (this.isEtf) {
        // Verify the service is properly initialized
        if (!this.#erlpack) {
          throw new Error(
            "Service not initialized. Call initialize() before using decode().",
          );
        }

        // Ensure we're working with a Buffer (convert string if necessary)
        return this.#erlpack.unpack(
          Buffer.isBuffer(data) ? data : Buffer.from(data),
        );
      }

      // JSON decoding path - parse string or convert Buffer to string first
      return JSON.parse(
        typeof data === "string" ? data : data.toString("utf-8"),
      );
    } catch (error) {
      // Wrap and rethrow errors with additional context
      throw new Error(`Failed to decode ${this.type} payload`, {
        cause: error,
      });
    }
  }

  /**
   * Cleans up resources used by the encoding service.
   *
   * This method should be called when the service is no longer needed
   * to prevent memory leaks, especially in long-running applications.
   * It releases references to dynamically loaded modules.
   *
   * After calling destroy(), the service must be re-initialized with
   * initialize() before it can be used again.
   */
  destroy(): void {
    // Release reference to the erlpack module
    this.#erlpack = null;
  }

  /**
   * Validates that the payload size is within acceptable limits.
   *
   * Discord imposes a 4096 byte limit on Gateway payloads. This method
   * ensures that encoded payloads don't exceed this limit before they're
   * sent to Discord, preventing rejected messages and potential rate limiting.
   *
   * The size calculation depends on the data type:
   * - For Buffers (ETF): Uses the buffer's length property
   * - For strings (JSON): Calculates byte length accounting for UTF-8 encoding
   *
   * @param data - The encoded payload to validate (Buffer or string)
   * @throws {Error} If the payload exceeds the maximum size limit, with detailed size information
   * @internal
   */
  #validatePayloadSize(data: Buffer | string): void {
    // Calculate the size in bytes
    // For strings, we need to get the actual UTF-8 byte length, not character count
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

    // Check if payload exceeds Discord's size limit
    if (size > MAX_PAYLOAD_SIZE) {
      throw new Error(
        `Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes (actual: ${size} bytes). Consider splitting large payloads or removing unnecessary data.`,
      );
    }
  }
}
