import type { ApiVersions, Integer, MimeTypes, Snowflake } from "@nyxjs/core";
import type { Dispatcher } from "undici";
import type { AuthTypes } from "./auth";

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
export type RouteStructure<T> = Omit<Dispatcher.DispatchOptions, "method" | "path"> & {
    /**
     * Whether to disable caching for this request.
     */
    disable_cache?: boolean;
    /**
     * Headers to send with the request.
     */
    headers?: RestHttpDiscordHeaders;
    /**
     * Method to use for the request.
     */
    method: RestMethods;
    /**
     * Path to the endpoint to send the request to.
     */
    path: `/${string}`;
};

/**
 * Headers for a REST HTTP request to Discord.
 */
export type RestHttpDiscordHeaders = {
    /**
     * Authorization header containing the authentication type and token.
     */
    Authorization?: `${AuthTypes} ${string}`;
    /**
     * MIME type of the content being sent.
     */
    "Content-Type"?: MimeTypes;
    /**
     * User agent string identifying the client.
     */
    "User-Agent"?: string;
    /**
     * Reason for the action, to be logged in the audit log.
     */
    "X-Audit-Log-Reason"?: string;
    /**
     * Rate limit bucket identifier.
     */
    "X-RateLimit-Bucket"?: string;
    /**
     * Indicates if the rate limit is global.
     */
    "X-RateLimit-Global"?: string;
    /**
     * Maximum number of requests that can be made.
     */
    "X-RateLimit-Limit"?: string;
    /**
     * Number of requests remaining in the current rate limit window.
     */
    "X-RateLimit-Remaining"?: string;
    /**
     * Timestamp when the rate limit resets.
     */
    "X-RateLimit-Reset"?: string;
    /**
     * Time in seconds until the rate limit resets.
     */
    "X-RateLimit-Reset-After"?: string;
    /**
     * Scope of the rate limit.
     */
    "X-RateLimit-Scope"?: "global" | "shared" | "user";
    /**
     * Ed25519 signature for request validation.
     */
    "X-Signature-Ed25519"?: string;
    /**
     * Timestamp for the Ed25519 signature.
     */
    "X-Signature-Timestamp"?: string;
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
     * The type of authentication to use.
     */
    auth_type: AuthTypes;
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
