import { AuthTypeFlag } from "../types/index.js";

export interface TokenEntity {
  id: string;
  timestamp: string;
  hash: string;
}

export interface ParsedTokenEntity {
  type: AuthTypeFlag;
  parts: TokenEntity;
  value: string;
  botId?: string;
  timestamp?: number;
}

export type TokenInput = string | number | bigint | null;

export const TOKEN_PATTERNS: Record<AuthTypeFlag, RegExp> = {
  [AuthTypeFlag.Bot]: /^[NMOAnmoa][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/,
  [AuthTypeFlag.Bearer]: /^[a-zA-Z0-9_-]{30,}$/,
};

export class TokenManager {
  static EXPIRATION = { days: 7, milliseconds: 7 * 24 * 60 * 60 * 1000 };
  static MASK_LENGTH = 8;

  readonly #token: string | null;
  readonly #parsedData: ParsedTokenEntity | null;

  private constructor(input?: TokenInput) {
    if (input != null) {
      const normalized = TokenManager.normalizeToken(input);
      if (!TokenManager.isValidToken(normalized)) {
        throw new Error("Invalid token provided to constructor");
      }
      this.#token = normalized;
      this.#parsedData = TokenManager.parseToken(normalized);
    } else {
      this.#token = null;
      this.#parsedData = null;
    }
  }

  get value(): string {
    if (!this.#token) {
      throw new Error("No token initialized");
    }
    return this.#token;
  }

  get parsedData(): ParsedTokenEntity {
    if (!this.#parsedData) {
      throw new Error("No valid parsed token data available");
    }
    return this.#parsedData;
  }

  get botId(): string | null {
    return this.#parsedData?.botId ?? null;
  }

  get isExpired(): boolean {
    const timestamp = this.#parsedData?.timestamp;
    if (!timestamp) {
      return true;
    }

    return Date.now() - timestamp > TokenManager.EXPIRATION.milliseconds;
  }

  static create(input: TokenInput): TokenManager {
    return new TokenManager(input);
  }

  static normalizeToken(input?: TokenInput): string {
    if (input === undefined || input === null) {
      throw new Error("Token input cannot be null or undefined");
    }
    return input.toString().trim();
  }

  static isValidToken(
    input?: TokenInput,
    type: AuthTypeFlag = AuthTypeFlag.Bot,
  ): boolean {
    try {
      const token = TokenManager.normalizeToken(input);
      return Boolean(token.length > 0 && TOKEN_PATTERNS[type].test(token));
    } catch {
      return false;
    }
  }

  static getTokenType(token: string): AuthTypeFlag | null {
    return (
      (Object.entries(TOKEN_PATTERNS).find(([, pattern]) =>
        pattern.test(token),
      )?.[0] as AuthTypeFlag | null) ?? null
    );
  }

  static parseToken(input: TokenInput): ParsedTokenEntity | null {
    try {
      const token = TokenManager.normalizeToken(input);
      const type = TokenManager.getTokenType(token);

      if (!type) {
        return null;
      }

      const parts = TokenManager.#extractTokenParts(token);
      const enrichedData = TokenManager.#enrichTokenData(type, parts);

      return { type, parts, value: token, ...enrichedData };
    } catch {
      return null;
    }
  }

  static formatToken(
    token: string,
    maskLength = TokenManager.MASK_LENGTH,
  ): string {
    if (!TokenManager.isValidToken(token)) {
      throw new Error("Invalid token format");
    }

    const parts = TokenManager.#extractTokenParts(token);
    const hasFullParts = parts.id && parts.hash;

    return hasFullParts
      ? `${parts.id.slice(0, maskLength)}...${parts.hash.slice(-3)}`
      : `${token.slice(0, maskLength)}...${token.slice(-3)}`;
  }

  static compareTokens(first?: TokenInput, second?: TokenInput): boolean {
    try {
      return (
        TokenManager.isValidToken(first) &&
        TokenManager.isValidToken(second) &&
        first === second
      );
    } catch {
      return false;
    }
  }

  static #extractTokenParts(token: string): TokenEntity {
    const [id = "", timestamp = "", hash = ""] = token.split(".");
    return { id, timestamp, hash };
  }

  static #enrichTokenData(
    type: AuthTypeFlag,
    parts: TokenEntity,
  ): Record<string, unknown> {
    if (type !== AuthTypeFlag.Bot) {
      return {};
    }

    try {
      return {
        botId: atob(parts.id),
        timestamp: new Date(atob(parts.timestamp)).getTime(),
      };
    } catch {
      return {};
    }
  }

  format(maskLength = TokenManager.MASK_LENGTH): string {
    if (!this.#token) {
      throw new Error("No token to format");
    }
    return TokenManager.formatToken(this.#token, maskLength);
  }

  equals(other?: TokenInput): boolean {
    return TokenManager.compareTokens(this.#token, other);
  }
}
