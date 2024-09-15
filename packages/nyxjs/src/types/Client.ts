import type { ApiVersions, GatewayIntents } from "@nyxjs/core";
import type { RestOptions } from "@nyxjs/rest";
import type { GatewayOptions } from "@nyxjs/ws";

export type ClientOptions = {
    intents: GatewayIntents[];
    presence?: GatewayOptions["presence"];
    rest?: Partial<Pick<RestOptions, "auth_type" | "cache_life_time" | "user_agent">>;
    shard?: GatewayOptions["shard"];
    version?: ApiVersions;
    ws?: Partial<Pick<GatewayOptions, "compress" | "encoding" | "large_threshold">>;
};
