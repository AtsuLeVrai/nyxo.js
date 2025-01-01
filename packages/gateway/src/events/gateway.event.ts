import type { Snowflake } from "@nyxjs/core";
import type { ActivityEntity } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export interface UpdateVoiceStateEntity {
  guild_id: Snowflake;
  channel_id: Snowflake | null;
  self_mute: boolean;
  self_deaf: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export type UpdatePresenceStatusType =
  | "online"
  | "dnd"
  | "idle"
  | "invisible"
  | "offline";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export interface UpdatePresenceEntity {
  since: number | null;
  activities: ActivityEntity[];
  status: UpdatePresenceStatusType;
  afk: boolean;
}
