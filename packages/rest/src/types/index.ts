import type { Buffer } from "node:buffer";
import type { DiscordHeaders, Integer, Snowflake } from "@nyxjs/core";
import type { Dispatcher } from "undici";

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
