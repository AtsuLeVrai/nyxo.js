import type { Integer } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#session-start-limit-object-session-start-limit-structure}
 */
export type SessionStartLimitStructure = {
    /**
     * Number of identify requests allowed per 5 seconds
     */
    max_concurrency: Integer;
    /**
     * Remaining number of session starts the current user is allowed
     */
    remaining: Integer;
    /**
     * Number of milliseconds after which the limit resets
     */
    reset_after: Integer;
    /**
     * Total number of session starts the current user is allowed
     */
    total: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot-json-response}
 */
export type GetGatewayBotResponse = {
    /**
     * Information on the current session start limit
     */
    session_start_limit: SessionStartLimitStructure;
    /**
     * Recommended number of shards to use when connecting
     */
    shards: Integer;
    /**
     * WSS URL that can be used for connecting to the Gateway
     */
    url: string;
};

export const GatewayRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot}
     */
    getGatewayBot: (): RestRequestOptions<GetGatewayBotResponse> => ({
        method: "GET",
        path: "/gateway/bot",
        disableCache: true,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway}
     */
    getGateway: (): RestRequestOptions<{ url: string }> => ({
        method: "GET",
        path: "/gateway",
    }),
};
