import type { Integer } from "@nyxjs/core";
import type { UpdatePresenceGatewayPresenceUpdateStructure } from "./presences.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#identify-identify-connection-properties}
 */
export interface IdentifyConnectionProperties {
    /**
     * Your library name
     */
    browser: string;
    /**
     * Your library name
     */
    device: string;
    /**
     * Your operating system
     */
    os: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#identify-identify-structure}
 */
export interface IdentifyStructure {
    /**
     * Whether this connection supports compression of packets
     */
    compress?: boolean;
    /**
     * Gateway Intents you wish to receive
     */
    intents: Integer;
    /**
     * Value between 50 and 250, total number of members where the globals will stop sending offline members in the guild member list
     */
    large_threshold?: Integer;
    /**
     * Presence structure for initial presence information
     */
    presence?: UpdatePresenceGatewayPresenceUpdateStructure;
    /**
     * Connection properties
     */
    properties: IdentifyConnectionProperties;
    /**
     * Used for Guild Sharding
     */
    shard?: [shard_id: Integer, num_shards: number];
    /**
     * Authentication token
     */
    token: string;
}
