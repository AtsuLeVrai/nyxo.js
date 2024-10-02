import type { ApiVersions, GatewayIntents, Integer } from "@nyxjs/core";
import type { UpdatePresenceGatewayPresenceUpdateStructure } from "../events/presences";

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
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayManagerOptions = {
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
    intents: GatewayIntents | Integer;
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
    shard?: "auto" | [shardId: Integer, numShards: Integer];
    /**
     * API version
     */
    v: ApiVersions;
};
