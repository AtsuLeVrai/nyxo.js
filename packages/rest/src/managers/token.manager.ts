interface TokenEntity {
  id: string;
  timestamp: string;
  hash: string;
}

interface ParsedTokenEntity {
  parts: TokenEntity;
  value: string;
  botId?: string;
  timestamp?: number;
}

export class TokenManager {
  static readonly TOKEN_PATTERN = /^[\w-]{20,}\.[\w-]{6}\.[\w-]{27,}$/;
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

  static isValidToken(input: string): boolean {
    return TokenManager.TOKEN_PATTERN.test(input);
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

      const parts = TokenManager.#extractTokenParts(token);
      const enrichedData = TokenManager.#enrichTokenData(parts);

      return {
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

  static #extractTokenParts(token: string): TokenEntity {
    const [id = "", timestamp = "", hash = ""] = token.split(".");
    return { id, timestamp, hash };
  }

  static #enrichTokenData(parts: TokenEntity): Partial<ParsedTokenEntity> {
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
