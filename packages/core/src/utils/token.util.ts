/**
 * Represents information extracted from a Discord token.
 *
 * Discord uses different types of tokens for authentication with its API.
 * This interface provides a structured way to access token information
 * after it has been decoded or analyzed.
 *
 * @see {@link https://discord.com/developers/docs/reference#authentication} Discord Authentication Documentation
 */
export interface TokenInfo {
  /**
   * The type of token, which determines how it should be used with the API.
   * Common types include "Bot" and "Bearer".
   */
  type: "Bot" | "Bearer" | "Unknown";

  /**
   * Original token string value.
   */
  value: string;

  /**
   * For Bot tokens, this can be the application ID extracted from the token.
   * For Bearer tokens, this can be the user ID if available.
   * Optional as it might not always be possible to extract an ID.
   */
  id?: string;

  /**
   * Timestamp when the token was created or issued, if this information
   * can be extracted from the token.
   */
  createdAt?: Date;

  /**
   * Expiration timestamp for OAuth2 Bearer tokens.
   * Bot tokens typically don't expire.
   */
  expiresAt?: Date;

  /**
   * Additional token metadata that might be available.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Regular expression to validate a Bot token format.
 * Bot tokens typically follow a specific pattern with three segments separated by dot separators.
 * The lengths of these segments can vary, but they generally follow a pattern of longer first segment,
 * shorter middle segment, and longer last segment.
 * This is not an exhaustive validation, but catches common format issues.
 */
export const BOT_TOKEN_REGEX = /^[\w-]{20,30}\.[\w-]{4,8}\.[\w-]{20,40}$/;

/**
 * Regular expression to validate a Bearer token format.
 * Bearer tokens (OAuth2) typically have a different format than Bot tokens.
 * We need to prioritize Bot token detection over Bearer token detection,
 * since the Bearer regex is more general and could match Bot tokens too.
 */
export const BEARER_TOKEN_REGEX =
  /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

/**
 * Utility class for handling Discord authentication tokens
 *
 * This utility provides methods for working with Discord tokens, including
 * validation, formatting, masking, and extracting information from different
 * token types used for Discord API authentication.
 *
 * @example
 * // Check if a string is a valid token
 * const isValid = TokenUtil.isValid('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
 * console.log(isValid); // true
 *
 * // Get an authorization header for a token
 * const header = TokenUtil.getAuthorizationHeader('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
 * console.log(header); // 'Authorization: Bot MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs'
 */
export const TokenUtil = {
  /**
   * Checks if a string appears to be a valid Discord token.
   * This is a surface-level validation of token format, not a verification of token validity with Discord.
   *
   * @param token - The token string to validate
   * @returns `true` if the token appears to be a valid Discord token, `false` otherwise
   *
   * @example
   * TokenUtil.isValid('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs'); // true
   * TokenUtil.isValid('not-a-token'); // false
   */
  isValid(token: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    // Check against known token formats
    return BOT_TOKEN_REGEX.test(token) || BEARER_TOKEN_REGEX.test(token);
  },

  /**
   * Determines the type of a Discord token.
   *
   * @param token - The token string to analyze
   * @returns The token type: "Bot", "Bearer", or "Unknown"
   *
   * @example
   * TokenUtil.getTokenType('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs'); // "Bot"
   * TokenUtil.getTokenType('CZhtkLDpNYXgPH9Ml6shqh2OwykChw'); // "Bearer"
   */
  getTokenType(token: string): "Bot" | "Bearer" | "Unknown" {
    if (!token || typeof token !== "string") {
      return "Unknown";
    }

    // Check for Bot token first - these have specific format with 3 parts
    if (BOT_TOKEN_REGEX.test(token)) {
      return "Bot";
    }

    // Additional check for Bot tokens - if it has 3 segments and the first is a valid base64 ID
    const parts = token.split(".");
    if (parts.length === 3) {
      try {
        // Try to decode the first part as base64
        const firstPart = Buffer.from(parts[0] as string, "base64").toString();
        // If it's all digits, it's likely a Bot token (user/app ID)
        if (/^\d+$/.test(firstPart)) {
          return "Bot";
        }
      } catch {
        // Ignore decoding errors
      }
    }

    // Check for Bearer token last, as its pattern is more general
    if (BEARER_TOKEN_REGEX.test(token)) {
      return "Bearer";
    }

    return "Unknown";
  },

  /**
   * Creates a properly formatted HTTP Authorization header for the given token.
   *
   * @param token - The token to format into a header
   * @param forceType - Optional type to override automatic type detection
   * @returns Formatted Authorization header value
   *
   * @example
   * // Automatic type detection
   * TokenUtil.getAuthorizationHeader('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
   * // Returns: "Bot MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs"
   *
   * // Force a specific type
   * TokenUtil.getAuthorizationHeader('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs', "Bearer");
   * // Returns: "Bearer MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs"
   */
  getAuthorizationHeader(token: string, forceType?: "Bot" | "Bearer"): string {
    if (!token) {
      throw new Error("Token cannot be empty");
    }

    const tokenType = forceType || this.getTokenType(token);

    if (tokenType === "Unknown" && !forceType) {
      throw new Error("Invalid token format");
    }

    return `${tokenType} ${token}`;
  },

  /**
   * Masks a token for secure display in logs or user interfaces.
   * Reveals only a small part of the token while hiding the majority.
   *
   * @param token - The token to mask
   * @param visibleStart - Number of characters to show at the beginning
   * @param visibleEnd - Number of characters to show at the end
   * @returns Masked token string
   *
   * @example
   * TokenUtil.maskToken('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
   * // Returns: "MTk4***kKWs"
   */
  maskToken(token: string, visibleStart = 4, visibleEnd = 3): string {
    if (!token || typeof token !== "string") {
      return "[invalid token]";
    }

    if (token.length <= visibleStart + visibleEnd) {
      return "***";
    }

    const start = token.substring(0, visibleStart);
    const end = token.substring(token.length - visibleEnd);

    return `${start}***${end}`;
  },

  /**
   * Attempts to decode a Bot token to extract basic information.
   * Note: This does not verify the token's signature or validity with Discord.
   *
   * @param token - The Bot token to decode
   * @returns TokenInfo object with extracted information
   *
   * @example
   * const info = TokenUtil.decodeToken('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
   * console.log(info);
   * // {
   * //   type: "Bot",
   * //   value: "MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs",
   * //   id: "198622483471925248",
   * //   createdAt: [Date object]
   * // }
   */
  decodeToken(token: string): TokenInfo {
    if (!this.isValid(token)) {
      return {
        type: "Unknown",
        value: token,
      };
    }

    const tokenType = this.getTokenType(token);
    const result: TokenInfo = {
      type: tokenType,
      value: token,
    };

    if (tokenType === "Bot") {
      try {
        // For Bot tokens, the first part is a base64-encoded user ID
        const parts = token.split(".");
        if (parts.length > 0) {
          const idBuffer = Buffer.from(parts[0] as string, "base64");
          const id = idBuffer.toString();

          if (/^\d+$/.test(id)) {
            result.id = id;

            // If the ID is a valid snowflake, we can derive a creation timestamp
            if (id.length >= 17 && id.length <= 20) {
              const timestamp = Number(BigInt(id) >> 22n) + 1420070400000;
              result.createdAt = new Date(timestamp);
            }
          }
        }
      } catch (_error) {
        // Silently fail if we can't decode the token
      }
    } else if (tokenType === "Bearer") {
      try {
        // For Bearer tokens, try to parse as JWT if it has the format
        const parts = token.split(".");
        if (parts.length >= 2) {
          try {
            const payload = JSON.parse(
              Buffer.from(parts[1] as string, "base64").toString(),
            );

            if (payload.exp) {
              result.expiresAt = new Date(payload.exp * 1000);
            }

            if (payload.iat) {
              result.createdAt = new Date(payload.iat * 1000);
            }

            if (payload.sub) {
              result.id = payload.sub;
            }

            result.metadata = payload;
          } catch (_e) {
            // Not a valid JWT or couldn't be parsed
          }
        }
      } catch (_error) {
        // Silently fail if we can't decode the token
      }
    }

    return result;
  },

  /**
   * Checks if a token has expired.
   * Only Bearer tokens with an expiration date can expire.
   * Bot tokens typically do not expire unless revoked.
   *
   * @param token - The token to check
   * @returns `true` if the token has expired, `false` otherwise or if expiration cannot be determined
   *
   * @example
   * TokenUtil.isExpired('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTcyODE0MDB9.X');
   * // Returns: true or false depending on the current date
   */
  isExpired(token: string): boolean {
    const tokenInfo = this.decodeToken(token);

    if (!tokenInfo.expiresAt) {
      // If no expiration can be determined, assume not expired
      return false;
    }

    return tokenInfo.expiresAt.getTime() < Date.now();
  },

  /**
   * Extracts an Application ID from a Bot token, if possible.
   * This is useful for operations that require the application ID.
   *
   * @param token - The Bot token to analyze
   * @returns The application ID as a string, or undefined if it cannot be extracted
   *
   * @example
   * const appId = TokenUtil.getApplicationId('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs');
   * console.log(appId); // "198622483471925248"
   */
  getApplicationId(token: string): string | undefined {
    const tokenInfo = this.decodeToken(token);
    return tokenInfo.id;
  },

  /**
   * Validates if a token is a valid Bot token with proper format.
   *
   * @param token - The token to validate
   * @returns `true` if the token appears to be a valid Bot token, `false` otherwise
   *
   * @example
   * TokenUtil.isBotToken('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs'); // true
   * TokenUtil.isBotToken('CZhtkLDpNYXgPH9Ml6shqh2OwykChw'); // false
   */
  isBotToken(token: string): boolean {
    return BOT_TOKEN_REGEX.test(token);
  },

  /**
   * Validates if a token is a valid Bearer (OAuth2) token with proper format.
   *
   * @param token - The token to validate
   * @returns `true` if the token appears to be a valid Bearer token, `false` otherwise
   *
   * @example
   * TokenUtil.isBearerToken('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs'); // false
   * TokenUtil.isBearerToken('CZhtkLDpNYXgPH9Ml6shqh2OwykChw'); // true
   */
  isBearerToken(token: string): boolean {
    return BEARER_TOKEN_REGEX.test(token);
  },

  /**
   * Creates a random token-like string for testing or placeholder purposes.
   * Note: This does NOT create a valid Discord token.
   *
   * @param type - The type of token format to mimic
   * @returns A string that resembles the specified token type's format
   *
   * @example
   * TokenUtil.createMockToken("Bot"); // Creates a string resembling a Bot token
   * TokenUtil.createMockToken("Bearer"); // Creates a string resembling a Bearer token
   */
  createMockToken(type: "Bot" | "Bearer"): string {
    const randomBase64 = (length: number): string => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    if (type === "Bot") {
      // Format: <base64 ID>.<base64 first part>.<base64 second part>
      return `${randomBase64(24)}.${randomBase64(6)}.${randomBase64(27)}`;
    }
    // Format similar to a JWT: <header>.<payload>.<signature>
    return `${randomBase64(16)}.${randomBase64(32)}.${randomBase64(43)}`;
  },

  /**
   * Formats a token string by revealing or redacting parts based on the context.
   * Useful for displaying tokens in different contexts with appropriate security.
   *
   * @param token - The token to format
   * @param context - The context in which the token will be displayed
   * @returns Appropriately formatted token string for the given context
   *
   * @example
   * // For secure display in logs
   * TokenUtil.formatForContext('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs', 'log');
   * // Returns: "MTk4***kKWs"
   *
   * // For development console with more visibility
   * TokenUtil.formatForContext('MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs', 'dev');
   * // Returns: "MTk4NjIy...Cq4se7kKWs"
   */
  formatForContext(
    token: string,
    context: "log" | "dev" | "debug" | "sensitive",
  ): string {
    if (!token) {
      return "[empty token]";
    }

    switch (context) {
      case "log":
        // For general logs, show minimal information
        return this.maskToken(token, 4, 4);

      case "dev": {
        // For development, show a bit more but still secure
        if (token.length <= 16) {
          return this.maskToken(token);
        }
        return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
      }

      case "debug": {
        // For debugging, show most parts but protect critical segments
        const parts = token.split(".");
        if (parts.length >= 3) {
          // For something like a JWT or Bot token with multiple segments
          return `${parts[0]}.${(parts[1] as string).substring(0, 3)}...${(parts[2] as string).substring(0, 3)}...`;
        }
        // For simple tokens
        return `${token.substring(0, token.length / 3)}...${token.substring(token.length - token.length / 3)}`;
      }

      case "sensitive":
        // For highly sensitive contexts, show absolute minimum
        return "********";

      default:
        // Default to the most secure option
        return this.maskToken(token);
    }
  },
} as const;
