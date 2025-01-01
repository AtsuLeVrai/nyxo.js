import { AuthTypeFlag } from "../types/index.js";

interface TokenEntity {
  id: string;
  timestamp: string;
  hash: string;
}

interface ParsedTokenEntity {
  type: AuthTypeFlag;
  parts: TokenEntity;
  value: string;
  botId?: string;
  timestamp?: number;
}

const TOKEN_PATTERNS: Record<AuthTypeFlag, RegExp> = {
  [AuthTypeFlag.bot]: /^[\w-]{20,}\.[\w-]{6}\.[\w-]{27,}$/,
  [AuthTypeFlag.bearer]: /^[a-zA-Z0-9_-]{30,}$/,
} as const;

export class TokenManager {
  static readonly EXPIRATION = {
    days: 7,
    milliseconds: 7 * 24 * 60 * 60 * 1000,
  } as const;

  static readonly MASK_LENGTH = 8;

  readonly #token: string;
  readonly #parsedData: ParsedTokenEntity | null;

  constructor(input: string) {
    const normalized = TokenManager.normalizeToken(input);
    if (!TokenManager.isValidToken(normalized)) {
      throw new Error("Invalid token format provided");
    }

    this.#token = normalized;
    this.#parsedData = TokenManager.parseToken(normalized);
  }

  get value(): string {
    if (!this.#token) {
      throw new Error("No token initialized");
    }
    return this.#token;
  }

  get parsedValue(): ParsedTokenEntity {
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

  static normalizeToken(input: string): string {
    return input.trim();
  }

  static isValidToken(
    input: string,
    type: AuthTypeFlag = AuthTypeFlag.bot,
  ): boolean {
    return TOKEN_PATTERNS[type].test(input);
  }

  static formatToken(
    token: string,
    maskLength = TokenManager.MASK_LENGTH,
  ): string {
    if (!TokenManager.isValidToken(token)) {
      throw new Error("Invalid token format");
    }

    const parts = TokenManager.#extractTokenParts(token);
    const hasParts = parts.id && parts.hash;

    if (hasParts) {
      return `${parts.id.slice(0, maskLength)}...${parts.hash.slice(-3)}`;
    }
    return `${token.slice(0, maskLength)}...${token.slice(-3)}`;
  }

  static parseToken(input: string): ParsedTokenEntity | null {
    try {
      const token = TokenManager.normalizeToken(input);
      const type = TokenManager.#getTokenType(token);

      if (!type) {
        return null;
      }

      const parts = TokenManager.#extractTokenParts(token);
      const enrichedData = TokenManager.#enrichTokenData(type, parts);

      return {
        type,
        parts,
        value: token,
        ...enrichedData,
      };
    } catch {
      return null;
    }
  }

  static compareTokens(first?: string, second?: string): boolean {
    if (!(first && second)) {
      return false;
    }

    return TokenManager.isValidToken(first) && first === second;
  }

  static #getTokenType(token: string): AuthTypeFlag | null {
    const match = Object.entries(TOKEN_PATTERNS).find(([, pattern]) =>
      pattern.test(token),
    );
    return (match?.[0] as AuthTypeFlag) ?? null;
  }

  static #extractTokenParts(token: string): TokenEntity {
    const [id = "", timestamp = "", hash = ""] = token.split(".");
    return { id, timestamp, hash };
  }

  static #enrichTokenData(
    type: AuthTypeFlag,
    parts: TokenEntity,
  ): Partial<ParsedTokenEntity> {
    if (type !== AuthTypeFlag.bot) {
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

  equals(other?: string): boolean {
    return TokenManager.compareTokens(this.#token, other);
  }
}
