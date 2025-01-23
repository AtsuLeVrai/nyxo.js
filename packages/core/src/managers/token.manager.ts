import { z } from "zod";
import { fromError, fromZodError } from "zod-validation-error";

export interface TokenParts {
  id: string;
  timestamp: Date | string;
  signature: string;
  raw: {
    id: string;
    timestamp: string;
    signature: string;
  };
}

const TOKEN_PATTERN =
  /^[A-Za-z0-9-_]{23,28}\.[A-Za-z0-9-_]{6,7}\.[A-Za-z0-9-_]{27,}$/;
const BOT_TOKEN_PATTERN =
  /^[A-Za-z0-9-_]{23,28}\.[A-Za-z0-9-_]{6,7}\.[A-Za-z0-9-_]{27,}$/;
const BEARER_TOKEN_PATTERN =
  /^[A-Za-z0-9-_]{23,28}\.[A-Za-z0-9-_]{6,7}\.[A-Za-z0-9-_]{27,}$/;
const MFA_TOKEN_PATTERN = /^mfa\.[A-Za-z0-9-_]{84,}$/;

export const Token = z.string().regex(TOKEN_PATTERN);
export type Token = z.infer<typeof Token>;

export const BotToken = z.string().regex(BOT_TOKEN_PATTERN);
export type BotToken = z.infer<typeof BotToken>;

export const BearerToken = z.string().regex(BEARER_TOKEN_PATTERN);
export type BearerToken = z.infer<typeof BearerToken>;

export const MfaToken = z.string().regex(MFA_TOKEN_PATTERN);
export type MfaToken = z.infer<typeof MfaToken>;

const TokenType = z.enum(["Bot", "Bearer", "MFA"]);
export type TokenType = z.infer<typeof TokenType>;

const TokenOptions = z
  .object({
    type: TokenType.default("Bot"),
    prefix: z.boolean().default(true),
  })
  .default({});

export type TokenOptions = z.infer<typeof TokenOptions>;

export class TokenManager {
  readonly #token: Token;
  readonly #options: z.output<typeof TokenOptions>;

  constructor(token: string, options: z.input<typeof TokenOptions> = {}) {
    try {
      this.#options = TokenOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    switch (this.#options.type) {
      case "Bot":
        this.#token = BotToken.parse(token);
        break;
      case "Bearer":
        this.#token = BearerToken.parse(token);
        break;
      case "MFA":
        this.#token = MfaToken.parse(token);
        break;
      default:
        throw new Error(`Unknown token type: ${this.#options.type}`);
    }
  }

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

  static isValidToken(token: string): boolean {
    return Token.safeParse(token).success;
  }

  static isValidBotToken(token: string): boolean {
    return BotToken.safeParse(token).success;
  }

  static isValidBearerToken(token: string): boolean {
    return BearerToken.safeParse(token).success;
  }

  static isValidMfaToken(token: string): boolean {
    return MfaToken.safeParse(token).success;
  }

  static createBotToken(token: string, prefix = true): TokenManager {
    return new TokenManager(token, { type: "Bot", prefix });
  }

  static createBearerToken(token: string, prefix = true): TokenManager {
    return new TokenManager(token, { type: "Bearer", prefix });
  }

  static createMfaToken(token: string): TokenManager {
    return new TokenManager(token, { type: "MFA" });
  }

  toString(): string {
    return this.#token;
  }

  toAuthorizationString(): string {
    if (!this.#options.prefix) {
      return this.#token;
    }

    switch (this.#options.type) {
      case "Bot":
        return `Bot ${this.#token}`;
      case "Bearer":
        return `Bearer ${this.#token}`;
      case "MFA":
        return this.#token;
      default:
        throw new Error(`Unknown token type: ${this.#options.type}`);
    }
  }

  decode(): TokenParts {
    const [id = "", timestamp = "", signature = ""] = this.#token.split(".");
    if (this.#options.type === "MFA") {
      return {
        id: "",
        timestamp: "",
        signature,
        raw: { id, timestamp, signature },
      };
    }

    return {
      id: atob(id),
      timestamp: new Date(atob(timestamp)),
      signature,
      raw: {
        id,
        timestamp,
        signature,
      },
    };
  }

  getType(): TokenType {
    return this.#options.type;
  }

  isBot(): boolean {
    return this.#options.type === "Bot";
  }

  isBearer(): boolean {
    return this.#options.type === "Bearer";
  }

  isMfa(): boolean {
    return this.#options.type === "MFA";
  }

  validate(): boolean {
    try {
      switch (this.#options.type) {
        case "Bot":
          return BotToken.safeParse(this.#token).success;
        case "Bearer":
          return BearerToken.safeParse(this.#token).success;
        case "MFA":
          return MfaToken.safeParse(this.#token).success;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  equals(other: TokenManager | string): boolean {
    const otherToken = other instanceof TokenManager ? other.toString() : other;
    return this.#token === otherToken;
  }

  toHeaderObject(): Record<string, string> {
    return {
      authorization: this.toAuthorizationString(),
      "user-agent": "DiscordBot",
      "content-type": "application/json",
    };
  }
}
