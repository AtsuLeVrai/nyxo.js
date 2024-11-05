import type { ApiVersions, Integer, MimeTypes, Snowflake } from "@nyxjs/core";
import type { IncomingHttpHeaders } from "undici/types/header.js";

/**
 * Represents the types of HTTP methods that can be used.
 */
export enum RestMethods {
    Connect = "CONNECT",
    Delete = "DELETE",
    Get = "GET",
    Head = "HEAD",
    Options = "OPTIONS",
    Patch = "PATCH",
    Post = "POST",
    Put = "PUT",
    Trace = "TRACE",
}

/**
 * Route structure for a REST request.
 */
export type RouteStructure<T> = {
    /**
     * Body of the request.
     */
    body?: Buffer;
    /**
     * Headers to send with the request.
     */
    headers?: IncomingHttpHeaders;
    /**
     * HTTP method to be used for the request.
     */
    method: RestMethods;
    /**
     * Path of the request.
     */
    path: `/${string}`;
    /**
     * Query string parameters for the request.
     */
    query?: Record<string, unknown>;
    /**
     * Response type for the request.
     */
    response?: T;
};

/**
 * Represents the types of authentication that can be used.
 */
export type AuthTypes = "Bearer" | "Bot";

/**
 * Headers for a REST HTTP request to Discord.
 */
export type RestHttpDiscordHeaders = {
    /**
     * Authorization header containing the authentication type and token.
     */
    authorization?: `${AuthTypes} ${string}`;
    /**
     * MIME type of the content being sent.
     */
    "content-type"?: MimeTypes;
    /**
     * User agent string identifying the client.
     */
    "user-agent"?: string;
    /**
     * Reason for the action, to be logged in the audit log.
     */
    "x-audit-log-reason"?: string;
    /**
     * Rate limit bucket identifier.
     */
    "x-ratelimit-bucket"?: string;
    /**
     * Indicates if the rate limit is global.
     */
    "x-ratelimit-global"?: string;
    /**
     * Maximum number of requests that can be made.
     */
    "x-ratelimit-limit"?: string;
    /**
     * Number of requests remaining in the current rate limit window.
     */
    "x-ratelimit-remaining"?: string;
    /**
     * Timestamp when the rate limit resets.
     */
    "x-ratelimit-reset"?: string;
    /**
     * Time in seconds until the rate limit resets.
     */
    "x-ratelimit-reset-after"?: string;
    /**
     * Scope of the rate limit.
     */
    "x-ratelimit-scope"?: "global" | "shared" | "user";
    /**
     * Ed25519 signature for request validation.
     */
    "x-signature-ed25519"?: string;
    /**
     * Timestamp for the Ed25519 signature.
     */
    "x-signature-timestamp"?: string;
};

/**
 * Query string parameters for a REST request.
 */
export type QueryStringParams = {
    /**
     * List subscriptions after this ID
     */
    after?: Snowflake;
    /**
     * List subscriptions before this ID
     */
    before?: Snowflake;
    /**
     * Number of results to return (1-100)
     */
    limit?: Integer;
    /**
     * ID of the thread the message is in
     */
    thread_id?: Snowflake;
};

/**
 * Options for configuring the REST client.
 */
export type RestOptions = {
    /**
     * Maximum number of retries for a request.
     */
    maxRetries?: number;
    /**
     * Number of retries for rate-limited requests.
     */
    rateLimitRetries?: number;
    /**
     * Timeout for a request in milliseconds.
     */
    timeout?: number;
    /**
     * User agent string identifying the client.
     */
    userAgent?: string;
    /**
     * Version of the API to use.
     */
    version: ApiVersions;
};

/**
 * Information about the rate limit.
 */
export type RateLimitInfo = {
    /**
     * The maximum number of requests that can be made in a given time period.
     */
    limit: number;
    /**
     * The HTTP method used for the request.
     */
    method: string;
    /**
     * The path of the request.
     */
    path: string;
    /**
     * The route of the request.
     */
    route: string;
    /**
     * The timeout duration in milliseconds.
     */
    timeout: number;
};

/**
 * Events emitted by the REST client.
 */
export type RestEvents = {
    /**
     * Debug event with a message.
     */
    debug: [message: string];
    /**
     * Error event with an error object.
     */
    error: [error: Error];
    /**
     * Rate limit event with rate limit information.
     */
    rateLimit: [rateLimitInfo: RateLimitInfo];
    /**
     * Warning event with a message.
     */
    warn: [message: string];
};
