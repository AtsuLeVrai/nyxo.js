import { z } from "zod";
import { fromError, fromZodError } from "zod-validation-error";

/**
 * Regular expression pattern for general Discord tokens.
 *
 * This pattern matches the basic structure of Discord tokens with three parts:
 * - First part: Base64-encoded user/bot ID
 * - Second part: Base64-encoded timestamp
 * - Third part: Signature for verification
 *
 * Format: id.timestamp.signature
 *
 * Use this pattern for initial validation when the specific token type is unknown.
 */
export const TOKEN_PATTERN =
  /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/;

/**
 * Regular expression pattern for Discord bot tokens.
 *
 * Bot tokens are used by applications to authenticate with the Discord API.
 * They have a specific length profile:
 * - First part: 24-26 characters (base64-encoded bot ID)
 * - Second part: 6-7 characters (base64-encoded timestamp)
 * - Third part: 27-38 characters (signature)
 *
 * Example: "NzI5NzA5MjE4NjQwOTU1NDUy.XwLLkg.vE-edZYQ0RaWb-gVwAWcKH4Xj4Q"
 */
export const BOT_TOKEN_PATTERN =
  /^[A-Za-z0-9_-]{24,26}\.[A-Za-z0-9_-]{6,7}\.[A-Za-z0-9_-]{27,38}$/;

/**
 * Regular expression pattern for Discord bearer tokens.
 *
 * Bearer tokens are used for OAuth2 authentication, typically for user accounts.
 * They have a different length profile than bot tokens:
 * - First part: 28-32 characters (base64-encoded user ID)
 * - Second part: 6 characters (base64-encoded timestamp)
 * - Third part: 38-42 characters (signature)
 *
 * Bearer tokens are obtained through the OAuth2 authorization flow and are used
 * to make API requests on behalf of a user.
 */
export const BEARER_TOKEN_PATTERN =
  /^[A-Za-z0-9_-]{28,32}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{38,42}$/;

/**
 * Zod schema representing the raw, unprocessed parts of a Discord token.
 *
 * Discord tokens consist of three parts separated by periods:
 * - id: The first part, typically a base64-encoded user or bot ID
 * - timestamp: The second part, typically a base64-encoded creation timestamp
 * - signature: The third part, a cryptographic signature to validate the token
 *
 * This schema stores these parts in their original encoded form before any decoding.
 */
export const TokenRawParts = z.object({
  /** The first part of the token (encoded ID) */
  id: z.string(),

  /** The second part of the token (encoded timestamp) */
  timestamp: z.string(),

  /** The third part of the token (signature) */
  signature: z.string(),
});

/**
 * Zod schema representing the decoded and processed parts of a Discord token.
 *
 * This schema contains both the decoded values and the original raw parts:
 * - id: The decoded user/bot ID (typically a numeric string)
 * - timestamp: The decoded timestamp as a Date object (or string if parsing failed)
 * - signature: The signature part (not decoded as it's not base64)
 * - raw: The original raw token parts before decoding
 *
 * This schema is used by the TokenManager.decode() method to provide a
 * structured representation of a token's components.
 */
export const TokenParts = z.object({
  /**
   * The decoded user or bot ID
   * After decoding, this is typically a numeric string
   */
  id: z.string().describe("Decoded user/bot ID"),

  /**
   * The decoded timestamp
   * This will be a Date object if parsing succeeded, or
   * a string if the timestamp couldn't be converted to a valid date
   */
  timestamp: z.union([
    z.date().describe("Timestamp as Date object"),
    z.string().describe("Timestamp as string if parsing failed"),
  ]),

  /**
   * The cryptographic signature part
   * This part is not encoded in base64 and is left as-is
   */
  signature: z.string().describe("Cryptographic signature part"),

  /**
   * The original raw parts of the token before decoding
   * Useful for debugging or when decoding fails
   */
  raw: TokenRawParts.describe("Raw parts before decoding"),
});

/**
 * Type representing the decoded parts of a Discord token.
 *
 * @see TokenParts for the schema definition and validation rules
 */
export type TokenParts = z.infer<typeof TokenParts>;

/**
 * Zod schema for validating a generic Discord token.
 *
 * This schema validates that a string conforms to the basic structure of a Discord token
 * (three parts separated by periods with appropriate character sets). It provides the foundation
 * for more specific token validations.
 *
 * Use this for initial validation when the exact token type is unknown.
 */
export const Token = z
  .string()
  .regex(TOKEN_PATTERN, "Invalid Discord token format");

/**
 * Type representing a validated Discord token string.
 *
 * This is a branded type that indicates a string has been validated
 * against the Token schema.
 */
export type Token = z.infer<typeof Token>;

/**
 * Zod schema for validating a Discord bot token.
 *
 * Bot tokens are used for bot authentication with the Discord API.
 * This schema enforces the specific format requirements for bot tokens,
 * which have distinct length patterns for each section of the token.
 *
 * Use this for validating tokens that will be used for bot authentication.
 */
export const BotToken = z
  .string()
  .regex(BOT_TOKEN_PATTERN, "Invalid Discord bot token format");

/**
 * Type representing a validated Discord bot token string.
 *
 * This is a branded type that indicates a string has been validated
 * against the BotToken schema.
 */
export type BotToken = z.infer<typeof BotToken>;

/**
 * Zod schema for validating a Discord bearer token.
 *
 * Bearer tokens are used for OAuth2 authentication on behalf of users.
 * This schema enforces the specific format requirements for bearer tokens,
 * which have different length patterns compared to bot tokens.
 *
 * Use this for validating tokens obtained through the OAuth2 flow.
 */
export const BearerToken = z
  .string()
  .regex(BEARER_TOKEN_PATTERN, "Invalid Discord bearer token format");

/**
 * Type representing a validated Discord bearer token string.
 *
 * This is a branded type that indicates a string has been validated
 * against the BearerToken schema.
 */
export type BearerToken = z.infer<typeof BearerToken>;

/**
 * Zod enum schema representing the supported Discord token types.
 *
 * Currently supports:
 * - "Bot": For application bot tokens
 * - "Bearer": For user OAuth2 tokens
 *
 * This enum is used to specify the token type when creating a TokenManager
 * or when configuring token validation options.
 */
export const TokenType = z.enum(["Bot", "Bearer"]);

/**
 * Union type representing the possible Discord token types.
 *
 * Can be either "Bot" or "Bearer".
 */
export type TokenType = z.infer<typeof TokenType>;

/**
 * Options for token handling
 */
export const TokenOptions = z
  .object({
    /**
     * The type of token (Bot or Bearer)
     * @default "Bot"
     */
    type: TokenType.default("Bot"),

    /**
     * Whether to include the token type prefix in authorization headers
     * @default true
     */
    prefix: z.boolean().default(true),
  })
  .default({});

export type TokenOptions = z.infer<typeof TokenOptions>;

/**
 * Class for managing and validating Discord tokens.
 *
 * This class handles different types of Discord tokens (Bot and Bearer) and
 * provides methods for validating, parsing, and using them in API requests.
 * Optimized for Node.js environments.
 *
 * @example
 * ```typescript
 * // Create a bot token
 * const botToken = TokenManager.createBotToken("MTIzNDU2Nzg5MDEyMzQ1Njc4.abcdef.ghijklmnopqrstuvwxyz1234567890");
 *
 * // Get token information
 * const userId = botToken.id;
 * const tokenParts = botToken.decode();
 * ```
 */
export class TokenManager {
  /** The validated token string */
  readonly #token: Token;

  /** The token type (Bot or Bearer) */
  readonly #tokenType: TokenType;

  /** Whether to include the prefix in authorization headers */
  readonly #usePrefix: boolean;

  /**
   * Creates a new TokenManager instance.
   *
   * @param token - The token string to manage
   * @param options - Options for token handling
   * @throws {Error} If the token is invalid for the specified type
   */
  constructor(token: string, options: z.input<typeof TokenOptions> = {}) {
    try {
      const parsedOptions = TokenOptions.parse(options);
      this.#tokenType = parsedOptions.type;
      this.#usePrefix = parsedOptions.prefix;
    } catch (error) {
      throw new Error(`Invalid token options: ${fromError(error).message}`);
    }

    // Validate the token based on its type
    try {
      switch (this.#tokenType) {
        case "Bot":
          BotToken.parse(token);
          break;
        case "Bearer":
          BearerToken.parse(token);
          break;
        default:
          throw new Error(`Unknown token type: ${this.#tokenType}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid ${this.#tokenType} token: ${fromZodError(error).message}`,
        );
      }
      throw error;
    }

    // Set the token if all validations pass
    this.#token = token;
  }

  /**
   * Gets the user/bot ID from the token.
   */
  get id(): string {
    return this.decode().id;
  }

  /**
   * Gets the timestamp when the token was created.
   */
  get timestamp(): Date | string {
    return this.decode().timestamp;
  }

  /**
   * Gets the cryptographic signature part of the token.
   */
  get signature(): string {
    return this.decode().signature;
  }

  /**
   * Creates a TokenManager from an authorization header string.
   *
   * @param header - The authorization header (e.g., "Bot xxx.yyy.zzz")
   * @returns A new TokenManager instance
   * @throws {Error} If the header format is invalid
   */
  static fromAuthorizationHeader(header: string): TokenManager {
    try {
      const [type, token] = z
        .string()
        .min(1, "Authorization header cannot be empty")
        .transform((str) => str.split(" "))
        .refine(
          (arr) => arr.length === 2,
          "Invalid authorization header format",
        )
        .parse(header);

      if (!(type && token)) {
        throw new Error("Invalid authorization header format");
      }

      switch (type.toLowerCase()) {
        case "bot":
          return new TokenManager(token, { type: "Bot" });
        case "bearer":
          return new TokenManager(token, { type: "Bearer" });
        default:
          throw new Error(`Unknown authorization type: ${type}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Checks if a string is a valid Discord token of any type.
   *
   * @param token - The token string to validate
   * @returns True if the token is valid
   */
  static isValidToken(token: string): boolean {
    return Token.safeParse(token).success;
  }

  /**
   * Checks if a string is a valid Discord bot token.
   *
   * @param token - The token string to validate
   * @returns True if the token is a valid bot token
   */
  static isValidBotToken(token: string): boolean {
    return BotToken.safeParse(token).success;
  }

  /**
   * Checks if a string is a valid Discord bearer token.
   *
   * @param token - The token string to validate
   * @returns True if the token is a valid bearer token
   */
  static isValidBearerToken(token: string): boolean {
    return BearerToken.safeParse(token).success;
  }

  /**
   * Creates a TokenManager for a bot token.
   *
   * @param token - The bot token string
   * @param prefix - Whether to include the "Bot" prefix in authorization headers
   * @returns A new TokenManager instance
   */
  static createBotToken(token: string, prefix = true): TokenManager {
    return new TokenManager(token, { type: "Bot", prefix });
  }

  /**
   * Creates a TokenManager for a bearer token.
   *
   * @param token - The bearer token string
   * @param prefix - Whether to include the "Bearer" prefix in authorization headers
   * @returns A new TokenManager instance
   */
  static createBearerToken(token: string, prefix = true): TokenManager {
    return new TokenManager(token, { type: "Bearer", prefix });
  }

  /**
   * Returns the token as a string.
   *
   * @returns The token string
   */
  toString(): string {
    return this.#token;
  }

  /**
   * Formats the token for use in an Authorization header.
   *
   * @returns The formatted authorization string (e.g., "Bot xxx.yyy.zzz")
   */
  toAuthorizationString(): string {
    if (!this.#usePrefix) {
      return this.#token;
    }

    switch (this.#tokenType) {
      case "Bot":
        return `Bot ${this.#token}`;
      case "Bearer":
        return `Bearer ${this.#token}`;
      default:
        throw new Error(`Unknown token type: ${this.#tokenType}`);
    }
  }

  /**
   * Decodes the token parts.
   *
   * For Discord tokens, decodes the base64 parts.
   *
   * @returns An object containing the decoded token parts
   */
  decode(): TokenParts {
    // Split the token into its parts
    const [id = "", timestamp = "", signature = ""] = this.#token.split(".");

    const rawParts = {
      id,
      timestamp,
      signature,
    };

    try {
      // For Node.js, use Buffer to decode base64
      const decodedId = Buffer.from(id, "base64").toString();

      let parsedTimestamp: Date | string;
      try {
        const decodedTimestamp = Buffer.from(timestamp, "base64").toString();
        parsedTimestamp = new Date(Number(decodedTimestamp));

        // Check if the date is valid
        if (Number.isNaN(parsedTimestamp.getTime())) {
          parsedTimestamp = decodedTimestamp;
        }
      } catch {
        parsedTimestamp = timestamp;
      }

      return TokenParts.parse({
        id: decodedId,
        timestamp: parsedTimestamp,
        signature,
        raw: rawParts,
      });
    } catch (_error) {
      // If decoding fails, return the raw parts with minimal processing
      return TokenParts.parse({
        id,
        timestamp,
        signature,
        raw: rawParts,
      });
    }
  }

  /**
   * Gets the type of this token.
   *
   * @returns The token type (Bot or Bearer)
   */
  getType(): TokenType {
    return this.#tokenType;
  }

  /**
   * Checks if this is a bot token.
   *
   * @returns True if this is a bot token
   */
  isBot(): boolean {
    return this.#tokenType === "Bot";
  }

  /**
   * Checks if this is a bearer token.
   *
   * @returns True if this is a bearer token
   */
  isBearer(): boolean {
    return this.#tokenType === "Bearer";
  }

  /**
   * Validates that the token matches its expected format.
   *
   * @returns True if the token is valid for its type
   */
  validate(): boolean {
    try {
      switch (this.#tokenType) {
        case "Bot":
          return BotToken.safeParse(this.#token).success;
        case "Bearer":
          return BearerToken.safeParse(this.#token).success;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Compares this token to another token or string.
   *
   * @param other - The token to compare with
   * @returns True if the tokens are equal
   */
  equals(other: TokenManager | string): boolean {
    const otherToken = other instanceof TokenManager ? other.toString() : other;
    return this.#token === otherToken;
  }
}
