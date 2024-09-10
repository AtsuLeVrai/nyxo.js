import type {ApiVersions, GatewayCloseCodes, GatewayOpcodes, Integer} from "@nyxjs/core";
import type {UpdatePresenceGatewayPresenceUpdateStructure} from "../events/presences";
import type {GatewayReceiveEvents} from "./events";

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

export enum CompressTypes {
    /**
     * Transport compression using zlib-stream
     */
    ZlibStream = "zlib-stream",
    /**
     * Transport compression using zstd-stream
     *
     * @deprecated Use `CompressTypes.ZlibStream` instead
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
    shard?: "auto" | [shardId: Integer, shardCount: Integer];
    /**
     * API version
     */
    v: ApiVersions;
};

type GatewayDispatchEvents<K extends keyof GatewayReceiveEvents> = {
    /**
     * Event triggered when a globals event is received.
     *
     * @param event - The event name.
     * @param data - The event data.
     */
    dispatch: [event: K, ...data: GatewayReceiveEvents[K]];
};

export type GatewayEvents = GatewayDispatchEvents<keyof GatewayReceiveEvents> & {
    /**
     * Event triggered when the connection is closed.
     *
     * @param code - The close code.
     * @param reason - The reason for the closure.
     */
    close: [code: GatewayCloseCodes, reason: string];
    /**
     * Event triggered for debugging messages.
     *
     * @param message - The debug message.
     */
    debug: [message: string];
    /**
     * Event triggered when an error occurs.
     *
     * @param error - The error object.
     */
    error: [error: Error];
    /**
     * Event triggered for warnings.
     *
     * @param warning - The warning message.
     */
    warn: [warning: string];
};
