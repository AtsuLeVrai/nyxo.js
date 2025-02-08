import { ApiVersion } from "@nyxjs/core";

export const API_CONSTANTS = {
  DEFAULTS: {
    VERSION: ApiVersion.V10 as const,
    USER_AGENT: "DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)" as const,
    BASE_URL: "https://discord.com" as const,
    AUTH_TYPE: "Bot" as const,
  },
  PATTERNS: {
    USER_AGENT: /^DiscordBot \((.+), ([0-9.]+)\)$/,
  },
  RATE_LIMIT: {
    CLEANUP_INTERVAL: 60_000,
    SAFETY_MARGIN: 1_000,
  },
  RETRY: {
    TIMING: {
      MAX_RETRIES: 3,
      BACKOFF_FACTOR: 2,
      MAX_DELAY: 5000,
      JITTER_FACTOR: 0.1,
    },
    STATUS_CODES: {
      RETRYABLE: [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
      ],
      NON_RETRYABLE: [
        401, // Unauthorized
        403, // Forbidden
        404, // Not Found
      ],
    } as const,
    ERROR_CODES: {
      RETRYABLE: [
        "ECONNRESET", // Connection forcibly closed
        "ETIMEDOUT", // Connection timed out
        "ECONNREFUSED", // Connection refused
        "EPIPE", // Broken pipe
        "ENOTFOUND", // DNS lookup failed
        "ENETUNREACH", // Network unreachable
      ],
      NON_RETRYABLE: [
        "ERR_INVALID_TOKEN", // Invalid token
        "ERR_INVALID_AUTH", // Invalid auth
      ],
    } as const,
  },
} as const;

export type ApiConstants = (typeof API_CONSTANTS)[keyof typeof API_CONSTANTS];
