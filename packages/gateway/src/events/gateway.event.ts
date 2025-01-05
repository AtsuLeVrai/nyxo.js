import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";
import { ActivitySchema } from "./presence.event.js";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export const UpdateVoiceStateSchema = z
  .object({
    guild_id: SnowflakeSchema,
    channel_id: SnowflakeSchema.nullable(),
    self_mute: z.boolean(),
    self_deaf: z.boolean(),
  })
  .strict();

export type UpdateVoiceStateEntity = z.infer<typeof UpdateVoiceStateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export const UpdatePresenceStatusTypeSchema = z.union([
  z.literal("online"),
  z.literal("dnd"),
  z.literal("idle"),
  z.literal("invisible"),
  z.literal("offline"),
]);

export type UpdatePresenceStatusType = z.infer<
  typeof UpdatePresenceStatusTypeSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export const UpdatePresenceSchema = z
  .object({
    since: z.number().nullable(),
    activities: z.array(ActivitySchema),
    status: UpdatePresenceStatusTypeSchema,
    afk: z.boolean(),
  })
  .strict();

export type UpdatePresenceEntity = z.infer<typeof UpdatePresenceSchema>;
