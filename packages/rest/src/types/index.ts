import type { ApiVersions, AuthTypes, DiscordHeaders, Integer, Snowflake } from "@nyxjs/core";
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

export type RestRequestOptions<T> = Omit<Dispatcher.DispatchOptions, "headers"> & {
    /**
     * Whether to disable caching for this request.
     */
    disable_cache?: boolean;
    /**
     * The path to send the request to.
     */
    headers?: DiscordHeaders | Dispatcher.DispatchOptions["headers"];
    /**
     * Whether to disable caching for this request.
     */
    readonly type?: T;
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
};

export type FileInput = Blob | Buffer | string;
