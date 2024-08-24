import type { ApiVersions, GatewayCloseCodes, GatewayIntents, GatewayOpcodes, Integer } from "@nyxjs/core";
import type { UpdatePresenceGatewayPresenceUpdateStructure } from "../events/presences";
import type { GatewayReceiveEvents } from "./events";

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

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayOptions = {
	/**
	 * The optional transport compression of globals packets zlib-stream or zstd-stream
	 */
	compress?: "zlib-stream" | "zstd-stream";
	/**
	 * The encoding of received globals packets json or etf
	 */
	encoding: "etf" | "json";
	/**
	 * The intents for the globals connection.
	 */
	intents: GatewayIntents;
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
	shard?: "auto" | [shardId: number, shardCount: number];
	/**
	 * API version
	 */
	v: ApiVersions;
};

export type GatewayEvents = {
	close: [code: GatewayCloseCodes, reason: string];
	debug: [message: string];
	error: [error: Error];
	warn: [warning: string];
};
