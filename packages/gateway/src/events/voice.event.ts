import { EmojiSchema, SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export const VoiceServerUpdateSchema = z
  .object({
    token: z.string(),
    guild_id: SnowflakeSchema,
    endpoint: z.string().nullable(),
  })
  .strict();

export type VoiceServerUpdateEntity = z.infer<typeof VoiceServerUpdateSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export const VoiceChannelEffectSendAnimationType = {
  premium: 0,
  basic: 1,
} as const;

export type VoiceChannelEffectSendAnimationType =
  (typeof VoiceChannelEffectSendAnimationType)[keyof typeof VoiceChannelEffectSendAnimationType];

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export const VoiceChannelEffectSendSchema = z
  .object({
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    user_id: SnowflakeSchema,
    emoji: EmojiSchema.nullish(),
    animation_type: z
      .nativeEnum(VoiceChannelEffectSendAnimationType)
      .optional(),
    animation_id: z.number().int().optional(),
    sound_id: z.union([SnowflakeSchema, z.number()]).nullish(),
    sound_volume: z.number().optional(),
  })
  .strict();

export type VoiceChannelEffectSendEntity = z.infer<
  typeof VoiceChannelEffectSendSchema
>;
