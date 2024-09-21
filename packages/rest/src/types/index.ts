import type { ApiVersions, AuthTypes, DiscordHeaders, Float, HttpCodes, Integer } from "@nyxjs/core";
import type { Dispatcher } from "undici";

export type RestOptions = {
    /**
     * The type of authentication to use.
     */
    auth_type?: AuthTypes;
    /**
     * The time-to-live (in milliseconds) of the cache.
     */
    cache_life_time?: Integer;
    /**
     * The user agent to use.
     */
    user_agent?: string;
    /**
     * The version of the API to use.
     */
    version: ApiVersions;
};

export type RestEvents = {
    /**
     * Emitted when a debug message is logged.
     */
    debug: [message: string];
    /**
     * Emitted when an error occurs.
     */
    error: [error: Error];
    /**
     * Emitted when a request is sent.
     */
    ready: [];
};

export type RestRequestOptions<T> = Omit<Dispatcher.DispatchOptions, "headers"> & {
    /**
     * Whether to disable caching for this request.
     */
    disable_cache?: boolean;
    /**
     * The path to send the request to.
     */
    headers?: DiscordHeaders;
    /**
     * Whether to disable caching for this request.
     */
    readonly type?: T;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure|Rate Limit Response Structure}
 */
export type RateLimitResponseStructure = {
    /**
     * An error code for some limits
     */
    code?: HttpCodes;
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

export type RateLimitInfo = {
    /**
     * The maximum number of requests that can be made in a given time frame.
     */
    bucket: string;
    /**
     * The number of requests remaining in the current time frame.
     */
    limit: Integer;
    /**
     * The time at which the current time frame resets.
     */
    remaining: Integer;
    /**
     * The time at which the current time frame resets.
     */
    reset: Integer;
    /**
     * The time in milliseconds after which the current time frame resets.
     */
    resetAfter: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/reference#signed-attachment-cdn-urls-attachment-cdn-url-parameters}
 */
export type AttachmentCdnUrlParameters = {
    /**
     * Hex timestamp indicating when an attachment CDN URL will expire
     */
    ex: string;
    /**
     * Unique signature that remains valid until the URL's expiration
     */
    hm: string;
    /**
     * Hex timestamp indicating when the URL was issued
     */
    is: string;
};
