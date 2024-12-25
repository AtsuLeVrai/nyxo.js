import type { Integer, Snowflake } from "@nyxjs/core";

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
export enum UpdatePresenceStatusType {
  Online = "online",
  Dnd = "dnd",
  Idle = "idle",
  Invisible = "invisible",
  Offline = "offline",
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export interface UpdatePresenceEntity {
  since: Integer | null;
  activities: object[];
  status: UpdatePresenceStatusType;
  afk: boolean;
}
