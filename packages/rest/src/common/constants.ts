import { ApiVersions, HttpResponseCodes, JsonErrorCodes } from "@nyxjs/core";
import type { Pool, RetryHandler } from "undici";
import type { RestOptions } from "../core/Rest";

export const DISCORD_API_URL = "https://discord.com";

export const DISCORD_CDN_URL = "https://cdn.discordapp.com";

export const REST_DEFAULT_OPTIONS: RestOptions = {
    version: ApiVersions.V10,
};

export const POOL_OPTIONS: Pool.Options = {
    connections: 10,
    pipelining: 6,
    keepAliveTimeout: 20_000,
    keepAliveMaxTimeout: 30_000,
    connect: { timeout: 30_000 },
    allowH2: true,
};

export const RETRY_AGENT_OPTIONS: RetryHandler.RetryOptions = {
    retryAfter: true,
    minTimeout: 500,
    maxTimeout: 10_000,
    timeoutFactor: 2,
    methods: ["GET", "DELETE", "PUT", "PATCH", "POST"],
    statusCodes: Object.values(HttpResponseCodes).map(Number),
    errorCodes: Object.values(JsonErrorCodes).map(String),
};
