import type { GatewayIntentsBits } from "../types/index.js";
import type { UpdatePresenceEntity } from "./gateway.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export interface IdentifyConnectionPropertiesEntity {
  os: string;
  browser: string;
  device: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export interface IdentifyEntity {
  token: string;
  properties: IdentifyConnectionPropertiesEntity;
  compress?: boolean;
  large_threshold?: number;
  shard?: [shardId: number, numShards: number];
  presence?: UpdatePresenceEntity;
  intents: GatewayIntentsBits;
}
