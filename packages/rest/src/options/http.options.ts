import { ApiVersion } from "@nyxjs/core";
import type { Pool, ProxyAgent, RetryHandler } from "undici";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/reference#user-agent}
 */
export const DISCORD_USER_AGENT_REGEX =
  /^DiscordBot \(([^,\s]+), (\d+(\.\d+)*)\)$/;

const POOL_DEFAULTS: Pool.Options = {
  allowH2: false,
  connections: 6,
  pipelining: 1,
  maxConcurrentStreams: 100,
  connectTimeout: 30000,
  keepAliveTimeout: 30000,
  keepAliveMaxTimeout: 120000,
  headersTimeout: 60000,
  bodyTimeout: 60000,
  connect: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    ciphers: "HIGH:!aNULL:!MD5:!RC4",
    honorCipherOrder: true,
  },
};

const RETRY_DEFAULTS: RetryHandler.RetryOptions = {
  retryAfter: true,
  maxRetries: 5,
  timeoutFactor: 2,
  minTimeout: 1000,
  maxTimeout: 60000,
  statusCodes: [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ],
  errorCodes: [
    "ECONNRESET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ENETDOWN",
    "ENETUNREACH",
    "EHOSTDOWN",
    "EHOSTUNREACH",
    "EPIPE",
    "EAI_AGAIN",
    "ETIMEDOUT",
    "EPROTO",
    "UND_ERR_SOCKET",
  ],
  methods: ["GET", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  retry: (err, context, cb) => {
    const { state, opts } = context;

    // @ts-expect-error
    if (err?.code === "DISCORD_TOKEN_INVALID") {
      return cb(err);
    }

    // @ts-expect-error
    if (err?.headers?.["retry-after"]) {
      // @ts-expect-error
      state.timeout = Number.parseInt(err.headers["retry-after"], 10) * 1000;
    }

    const jitter = Math.random() * 1000;
    // @ts-expect-error
    state.timeout += jitter;

    // @ts-expect-error
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    if (state.retryCount >= opts.maxRetries!) {
      return cb(new Error("Max retries reached"));
    }

    return cb(null);
  },
};

export const HttpOptions = z.object({
  token: z.string(),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  userAgent: z
    .string()
    .regex(DISCORD_USER_AGENT_REGEX)
    .default("DiscordBot (https://github.com/3tatsu/nyx.js, 1.0.0)"),
  proxy: z.custom<ProxyAgent.Options>().optional(),
  pool: z.custom<Pool.Options>().default(POOL_DEFAULTS),
  retry: z.custom<RetryHandler.RetryOptions>().default(RETRY_DEFAULTS),
});
