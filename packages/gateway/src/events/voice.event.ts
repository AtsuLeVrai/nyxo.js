import { EmojiEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export const VoiceServerUpdateEntity = z
  .object({
    token: z.string(),
    guild_id: Snowflake,
    endpoint: z.string().nullable(),
  })
  .strict();

export type VoiceServerUpdateEntity = z.infer<typeof VoiceServerUpdateEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationType {
  Premium = 0,
  Basic = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export const VoiceChannelEffectSendEntity = z
  .object({
    channel_id: Snowflake,
    guild_id: Snowflake,
    user_id: Snowflake,
    emoji: EmojiEntity.nullish(),
    animation_type: z
      .nativeEnum(VoiceChannelEffectSendAnimationType)
      .optional(),
    animation_id: z.number().int().optional(),
    sound_id: z.union([Snowflake, z.number()]).nullish(),
    sound_volume: z.number().optional(),
  })
  .strict();

export type VoiceChannelEffectSendEntity = z.infer<
  typeof VoiceChannelEffectSendEntity
>;
