import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { GuildMemberSchema } from "./guild.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure}
 */
export const VoiceRegionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    optimal: z.boolean(),
    deprecated: z.boolean(),
    custom: z.boolean(),
  })
  .strict();

export type VoiceRegionEntity = z.infer<typeof VoiceRegionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure}
 */
export const VoiceStateSchema = z
  .object({
    guild_id: SnowflakeSchema.optional(),
    channel_id: SnowflakeSchema.nullable(),
    user_id: SnowflakeSchema,
    member: GuildMemberSchema.optional(),
    session_id: SnowflakeSchema,
    deaf: z.boolean(),
    mute: z.boolean(),
    self_deaf: z.boolean(),
    self_mute: z.boolean(),
    self_stream: z.boolean().optional(),
    self_video: z.boolean(),
    suppress: z.boolean(),
    request_to_speak_timestamp: z.string().datetime().nullable(),
  })
  .strict();

export type VoiceStateEntity = z.infer<typeof VoiceStateSchema>;
