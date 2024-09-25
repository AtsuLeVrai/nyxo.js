import type { GatewayIntents, Integer } from "@nyxjs/core";
import { BitfieldManager } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";
import type { ClientOptions } from "../client/Client";
import { DEFAULT_API_VERSION, DEFAULT_ENCODING } from "./constants";

export function calculateIntents(intents: GatewayIntents[] | Integer): number {
    if (Array.isArray(intents)) {
        return Number(BitfieldManager.from(intents).valueOf());
    } else {
        return intents;
    }
}

export function wsOptions(options: ClientOptions): GatewayOptions {
    return {
        presence: options.presence,
        shard: options.shard,
        v: options.version ?? DEFAULT_API_VERSION,
        intents: calculateIntents(options.intents),
        encoding: options.ws?.encoding ?? DEFAULT_ENCODING,
        compress: options.ws?.compress,
        large_threshold: options.ws?.large_threshold,
    };
}

export function restOptions(options: ClientOptions): RestOptions {
    return {
        auth_type: options.rest?.auth_type,
        cache_life_time: options.rest?.cache_life_time,
        user_agent: options.rest?.user_agent,
        version: options.version ?? DEFAULT_API_VERSION,
    };
}
