import type { ApiVersions, Float, Integer, RestHttpResponseCodes } from "@nyxjs/core";
import type { Dispatcher } from "undici";

/**
 * @see {@link https://discord.com/developers/docs/reference#authentication}
 */
export type AuthTypes = "Bearer" | "Bot";

export type DiscordHeaders = {
    Authorization?: `${AuthTypes} ${string}`;
    "Content-Type"?:
        | "application/json"
        | "application/ld+json"
        | "application/msword"
        | "application/pdf"
        | "application/sql"
        | "application/vnd.api+json"
        | "application/vnd.microsoft.portable-executable"
        | "application/vnd.ms-excel"
        | "application/vnd.ms-powerpoint"
        | "application/vnd.oasis.opendocument.text"
        | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        | "application/x-www-form-urlencoded"
        | "application/xml"
        | "application/zip"
        | "application/zstd"
        | "audio/mpeg"
        | "audio/ogg"
        | "image/avif"
        | "image/jpeg"
        | "image/png"
        | "image/svg+xml"
        | "image/tiff"
        | "model/obj"
        | "multipart/form-data"
        | "text/css"
        | "text/csv"
        | "text/html"
        | "text/javascript"
        | "text/plain"
        | "text/xml";
    "User-Agent"?: string;
    "X-Audit-Log-Reason"?: string;
    "X-RateLimit-Bucket"?: string;
    "X-RateLimit-Global"?: string;
    "X-RateLimit-Limit"?: string;
    "X-RateLimit-Remaining"?: string;
    "X-RateLimit-Reset"?: string;
    "X-RateLimit-Reset-After"?: string;
    "X-RateLimit-Scope"?: "global" | "shared" | "user";
    "X-Signature-Ed25519"?: string;
    "X-Signature-Timestamp"?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export type RateLimitResponseStructure = {
    /**
     * An error code for some limits
     */
    code?: RestHttpResponseCodes;
    /**
     * A value indicating if you are being globally rate limited or not
     */
    global: boolean;
    /**
     * A message saying you are being rate limited.
     */
    message: string;
    /**
     * The number of seconds to wait before submitting another request.
     */
    retry_after: Float;
};

/**
 * Options for configuring the Rest client.
 */
export type RestOptions = {
    /**
     * The type of authentication to use (e.g., Bot, Bearer).
     */
    auth_type?: AuthTypes;
    /**
     * The cache lifetime in seconds.
     */
    cache_life_time?: Integer;
    /**
     * The User-Agent string to use for requests.
     */
    user_agent?: string;
    /**
     * The API version to use for requests.
     */
    version?: ApiVersions;
};

/**
 * Events emitted by the Rest client.
 */
export type RestEvents = {
    /**
     * Emitted for debugging purposes.
     *
     * @param message - The debug message.
     */
    debug: [message: string];
    /**
     * Emitted when an error occurs.
     *
     * @param error - The error that occurred.
     */
    error: [error: Error];
    /**
     * Emitted when a global rate limit is encountered.
     *
     * @param retryAfter - The number of seconds to wait before retrying.
     */
    globalRateLimit: [retryAfter: Float];
    /**
     * Emitted when a rate limit is encountered.
     *
     * @param retryAfter - The number of seconds to wait before retrying.
     */
    rateLimit: [retryAfter: Float];
};

/**
 * Options for making a request with the Rest client.
 *
 * @template T - The type of the response data.
 */
export type RestRequestOptions<T> = Omit<Dispatcher.DispatchOptions, "headers"> & {
    /**
     * Whether to disable caching for this request.
     */
    disableCache?: boolean;
    /**
     * Headers to include in the request.
     */
    headers?: DiscordHeaders;
    /**
     * The type of the response data.
     */
    readonly type?: T;
};
