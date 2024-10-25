import type { Integer } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#session-start-limit-object-session-start-limit-structure|Session Start Limit Structure}
 */
export type SessionStartLimitStructure = {
    /**
     * Number of identify requests allowed per 5 seconds.
     */
    max_concurrency: Integer;
    /**
     * Remaining number of session starts the current user is allowed.
     */
    remaining: Integer;
    /**
     * Number of milliseconds after which the limit resets.
     */
    reset_after: Integer;
    /**
     * Total number of session starts the current user is allowed.
     */
    total: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot-json-response|Get Gateway Bot JSON Response}
 */
export type GetGatewayBotJsonResponse = {
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

export class GatewayRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot|Get Gateway Bot}
     */
    static getGatewayBot(): RouteStructure<GetGatewayBotJsonResponse> {
        return {
            method: RestMethods.Get,
            path: "/gateway/bot",
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway#get-gateway|Get Gateway}
     */
    static getGateway(): RouteStructure<{ url: string }> {
        return {
            method: RestMethods.Get,
            path: "/gateway",
        };
    }
}
