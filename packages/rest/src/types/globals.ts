import type {ApiVersions, AuthTypes, DiscordHeaders, Float, Integer, RestHttpResponseCodes} from "@nyxjs/core";
import type {Dispatcher} from "undici";

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
