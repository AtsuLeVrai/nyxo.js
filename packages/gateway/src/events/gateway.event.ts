import { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { ActivityEntity } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export const UpdateVoiceStateEntity = z.object({
  guild_id: Snowflake,
  channel_id: Snowflake.nullable(),
  self_mute: z.boolean(),
  self_deaf: z.boolean(),
});

export type UpdateVoiceStateEntity = z.infer<typeof UpdateVoiceStateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export const UpdatePresenceStatusType = z.enum([
  "online",
  "dnd",
  "idle",
  "invisible",
  "offline",
]);

export type UpdatePresenceStatusType = z.infer<typeof UpdatePresenceStatusType>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export const UpdatePresenceEntity = z.object({
  since: z.number().nullable(),
  activities: z.array(ActivityEntity),
  status: UpdatePresenceStatusType,
  afk: z.boolean(),
});

export type UpdatePresenceEntity = z.infer<typeof UpdatePresenceEntity>;
