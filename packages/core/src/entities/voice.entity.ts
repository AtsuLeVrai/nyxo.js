import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure}
 */
export const VoiceRegionEntity = z.object({
  id: z.string(),
  name: z.string(),
  optimal: z.boolean(),
  deprecated: z.boolean(),
  custom: z.boolean(),
});

export type VoiceRegionEntity = z.infer<typeof VoiceRegionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure}
 */
export const VoiceStateEntity = z.object({
  guild_id: Snowflake.optional(),
  channel_id: Snowflake.nullable(),
  user_id: Snowflake,
  member: GuildMemberEntity.optional(),
  session_id: z.string(),
  deaf: z.boolean(),
  mute: z.boolean(),
  self_deaf: z.boolean(),
  self_mute: z.boolean(),
  self_stream: z.boolean().optional(),
  self_video: z.boolean(),
  suppress: z.boolean(),
  request_to_speak_timestamp: z.string().datetime().nullable(),
});

export type VoiceStateEntity = z.infer<typeof VoiceStateEntity>;
