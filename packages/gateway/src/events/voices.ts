import type { EmojiStructure, Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export interface VoiceServerUpdateEventFields {
    /**
     * Voice server host
     */
    endpoint: string | null;
    /**
     * Guild this voice server update is for
     */
    guild_id: Snowflake;
    /**
     * Voice connection token
     */
    token: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationTypes {
    /**
     * A fun animation, sent by a Nitro subscriber
     */
    Premium = 0,
    /**
     * The standard animation
     */
    Basic = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEventFields {
    /**
     * The ID of the emoji animation, for emoji reaction and soundboard effects
     */
    animation_id?: number;
    /**
     * The interface of emoji animation, for emoji reaction and soundboard effects
     */
    animation_type?: VoiceChannelEffectSendAnimationTypes | null;
    /**
     * ID of the channel the effect was sent in
     */
    channel_id: Snowflake;
    /**
     * The emoji sent, for emoji reaction and soundboard effects
     */
    emoji?: EmojiStructure | null;
    /**
     * ID of the guild the effect was sent in
     */
    guild_id: Snowflake;
    /**
     * The ID of the soundboard sound, for soundboard effects
     */
    sound_id?: Integer | Snowflake;
    /**
     * The volume of the soundboard sound, from 0 to 1, for soundboard effects
     */
    sound_volume?: Integer;
    /**
     * ID of the user who sent the effect
     */
    user_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export interface UpdateVoiceStateGatewayVoiceStateUpdateStructure {
    /**
     * ID of the voice channel client wants to join (null if disconnecting)
     */
    channel_id: Snowflake | null;
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * Whether the client deafened
     */
    self_deaf: boolean;
    /**
     * Whether the client is muted
     */
    self_mute: boolean;
}
