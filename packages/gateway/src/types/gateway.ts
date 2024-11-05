import type { ApiVersions, GatewayOpcodes, Integer } from "@nyxjs/core";
import type { UpdatePresenceGatewayPresenceUpdateStructure } from "../events/index.js";
import type { GatewayReceiveEvents } from "./events.js";

export enum CompressTypes {
    /**
     * Transport compression using zlib-stream
     */
    ZlibStream = "zlib-stream",
    /**
     * Transport compression using zstd-stream
     *
     * @deprecated Use `CompressTypes.ZlibStream` instead. Node.js does not support Zstd.
     */
    ZstdStream = "zstd-stream",
}

export enum EncodingTypes {
    /**
     * Encoding type for Erlang Term Format (ETF)
     */
    Etf = "etf",
    /**
     * Encoding type for JSON
     */
    Json = "json",
}

/**
 * The shard information for the globals connection.
 */
export type ShardConfig = {
    /**
     * The total number of shards.
     */
    shardCount: Integer;
    /**
     * The shard ID.
     */
    shardId: Integer;
};

/**
 * The shard information for the globals connection.
 */
export type GatewayShardTypes = ShardConfig | "auto" | [shardId: Integer, numShards: Integer];

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayOptions = {
    /**
     * The optional transport compression of globals packets zlib-stream or zstd-stream
     */
    compress?: CompressTypes;
    /**
     * The encoding of received globals packets json or etf
     */
    encoding: EncodingTypes;
    /**
     * The intents for the globals connection.
     */
    intents: Integer;
    /**
     * The large threshold for the globals connection.
     */
    large_threshold?: Integer;
    /**
     * The presence update structure for the globals connection.
     */
    presence?: UpdatePresenceGatewayPresenceUpdateStructure;
    /**
     * The shard information for the globals connection.
     * Can be an array with shard ID and shard count, or "auto".
     */
    shard?: GatewayShardTypes;
    /**
     * API version
     */
    v: ApiVersions;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#payload-structure}
 */
export type GatewayPayload = {
    /**
     * Event data
     */
    d: unknown;
    /**
     * Gateway opcode, which indicates the payload type
     */
    op: GatewayOpcodes;
    /**
     * Sequence number of event used for resuming sessions and heartbeating
     */
    s: Integer | null;
    /**
     * Event name
     */
    t: keyof GatewayReceiveEvents | null;
};
