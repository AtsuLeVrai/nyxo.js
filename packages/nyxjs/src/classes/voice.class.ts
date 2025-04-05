import type {
  EmojiEntity,
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import {
  type GuildMemberAddEntity,
  VoiceChannelEffectSendAnimationType,
  type VoiceChannelEffectSendEntity,
} from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";
import { GuildMember } from "./guild.class.js";

/**
 * Represents a user's voice connection status in Discord.
 *
 * Voice states track users' connections to voice channels - including their
 * settings (mute, deaf, etc.) and permissions (suppress).
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
export class VoiceState extends BaseClass<VoiceStateEntity> {
  /**
   * The guild ID this voice state is for, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The channel ID this user is connected to (null if disconnected)
   */
  get channelId(): Snowflake | null {
    return this.data.channel_id;
  }

  /**
   * The user ID this voice state is for
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * The guild member this voice state is for, if applicable
   * @returns A GuildMember instance or undefined if no member data
   */
  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return new GuildMember(
      this.client,
      this.data.member as GuildMemberAddEntity,
    );
  }

  /**
   * The session ID for this voice state
   */
  get sessionId(): string {
    return this.data.session_id;
  }

  /**
   * Whether this user is deafened by the server
   */
  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  /**
   * Whether this user is muted by the server
   */
  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  /**
   * Whether this user is locally deafened
   */
  get selfDeaf(): boolean {
    return Boolean(this.data.self_deaf);
  }

  /**
   * Whether this user is locally muted
   */
  get selfMute(): boolean {
    return Boolean(this.data.self_mute);
  }

  /**
   * Whether this user is streaming using "Go Live"
   */
  get selfStream(): boolean {
    return Boolean(this.data.self_stream);
  }

  /**
   * Whether this user's camera is enabled
   */
  get selfVideo(): boolean {
    return Boolean(this.data.self_video);
  }

  /**
   * Whether this user's permission to speak is denied
   */
  get suppress(): boolean {
    return Boolean(this.data.suppress);
  }

  /**
   * The time at which the user requested to speak
   * @returns ISO8601 timestamp or null if no request to speak
   */
  get requestToSpeakTimestamp(): string | null {
    return this.data.request_to_speak_timestamp;
  }

  /**
   * Whether the user is currently in a voice channel
   */
  get isInVoiceChannel(): boolean {
    return this.channelId !== null;
  }

  /**
   * Disconnects the user from their voice channel
   * This is only applicable for the current user or users in guilds where the bot has permission
   *
   * @returns Promise resolving when the user is disconnected
   * @throws Error if trying to disconnect another user without proper permissions
   */
  async disconnect(): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot disconnect from a non-guild voice state");
    }

    if (this.userId === this.client.user.id) {
      // Current user, use VoiceStateUpdate
      return this.client.gateway.updateVoiceState({
        guild_id: this.guildId,
        channel_id: null,
        self_deaf: this.selfDeaf,
        self_mute: this.selfMute,
      });
    }
    // Other user, try to move them (requires MOVE_MEMBERS permission)
    await this.client.rest.guilds.modifyGuildMember(this.guildId, this.userId, {
      channel_id: null,
    });
  }

  /**
   * Mutes or unmutes the user in the voice channel
   * Note: This requires the MUTE_MEMBERS permission
   *
   * @param mute - Whether to mute (true) or unmute (false) the user
   * @param reason - Optional audit log reason
   * @returns Promise resolving when the operation is complete
   * @throws Error if missing permissions
   */
  async setMute(mute: boolean, reason?: string): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot mute/unmute in a non-guild voice state");
    }

    await this.client.rest.guilds.modifyGuildMember(
      this.guildId,
      this.userId,
      { mute },
      reason,
    );
  }

  /**
   * Deafens or undeafens the user in the voice channel
   * Note: This requires the DEAFEN_MEMBERS permission
   *
   * @param deaf - Whether to deafen (true) or undeafen (false) the user
   * @param reason - Optional audit log reason
   * @returns Promise resolving when the operation is complete
   * @throws Error if missing permissions
   */
  async setDeaf(deaf: boolean, reason?: string): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot deafen/undeafen in a non-guild voice state");
    }

    await this.client.rest.guilds.modifyGuildMember(
      this.guildId,
      this.userId,
      { deaf },
      reason,
    );
  }

  /**
   * Toggles the user's suppress state in a stage channel
   * Note: This requires the MUTE_MEMBERS permission
   * Caveats:
   * - The user must already be in a stage channel
   * - When unsuppressed, non-bot users will have their request_to_speak_timestamp set to current time
   * - When suppressed, the user will have their request_to_speak_timestamp removed
   *
   * @param suppress - Whether to suppress the user
   * @returns Promise resolving when the operation is complete
   * @throws Error if not in a stage channel or missing permissions
   */
  setSuppress(suppress: boolean): Promise<void> {
    if (!this.guildId) {
      throw new Error(
        "Cannot modify suppress state in a non-guild voice state",
      );
    }

    if (this.userId === this.client.user.id) {
      // Current user
      return this.client.rest.voice.modifyCurrentUserVoiceState(this.guildId, {
        channel_id: this.channelId,
        suppress,
      });
    }

    return this.client.rest.voice.modifyUserVoiceState(
      this.guildId,
      this.userId,
      {
        channel_id: this.channelId,
        suppress,
      },
    );
  }

  /**
   * Sets a request to speak for the current user in a stage channel
   * Note: This requires the REQUEST_TO_SPEAK permission
   * Caveats:
   * - The current user must already be in a stage channel
   * - You can set request_to_speak_timestamp to any present or future time
   * - You can always clear your own request to speak
   *
   * @param requestTimestamp - ISO8601 timestamp to set as the request, or null to clear
   * @returns Promise resolving when the operation is complete
   * @throws Error if not the current user, not in a stage channel, or missing permissions
   */
  requestToSpeak(
    requestTimestamp: string | null = new Date().toISOString(),
  ): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot request to speak in a non-guild voice state");
    }

    if (this.userId !== this.client.user.id) {
      throw new Error("Can only modify request to speak for the current user");
    }

    return this.client.rest.voice.modifyCurrentUserVoiceState(this.guildId, {
      channel_id: this.channelId,
      request_to_speak_timestamp: requestTimestamp,
    });
  }

  /**
   * Moves the user to another voice channel
   * Note: This requires the MOVE_MEMBERS permission
   *
   * @param channelId - The ID of the channel to move the user to
   * @returns Promise resolving when the user is moved
   * @throws Error if missing permissions
   */
  async moveToChannel(channelId: Snowflake): Promise<void> {
    if (!this.guildId) {
      throw new Error("Cannot move users in a non-guild voice state");
    }

    if (this.userId === this.client.user.id) {
      // Current user, use updateVoiceState
      return this.client.gateway.updateVoiceState({
        guild_id: this.guildId,
        channel_id: channelId,
        self_deaf: this.selfDeaf,
        self_mute: this.selfMute,
      });
    }

    // Other user
    await this.client.rest.guilds.modifyGuildMember(this.guildId, this.userId, {
      channel_id: channelId,
    });
  }

  /**
   * Checks if this user has requested to speak
   *
   * @returns Whether the user has requested to speak
   */
  hasRequestedToSpeak(): boolean {
    if (!this.requestToSpeakTimestamp) {
      return false;
    }

    // Check if the timestamp is in the future or past
    const requestTime = new Date(this.requestToSpeakTimestamp).getTime();
    const now = Date.now();

    return requestTime >= now;
  }
}

/**
 * Represents a Discord voice region that can be used when setting a voice
 * or stage channel's RTC region.
 *
 * Voice regions determine the physical server location for voice connections,
 * which affects latency and audio quality for users.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
 */
export class VoiceRegion extends BaseClass<VoiceRegionEntity> {
  /**
   * Unique ID for the region
   */
  get id(): string {
    return this.data.id;
  }

  /**
   * Name of the region
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * True for a single server that is closest to the current user's client
   */
  get optimal(): boolean {
    return Boolean(this.data.optimal);
  }

  /**
   * Whether this is a deprecated voice region (avoid switching to these)
   */
  get deprecated(): boolean {
    return Boolean(this.data.deprecated);
  }

  /**
   * Whether this is a custom voice region (used for events/etc)
   */
  get custom(): boolean {
    return Boolean(this.data.custom);
  }

  /**
   * Checks if this region is recommended for use
   *
   * @returns Whether the region is recommended (non-deprecated and either optimal or custom)
   */
  isRecommended(): boolean {
    return !this.deprecated && (this.optimal || this.custom);
  }
}

/**
 * Represents a voice channel effect send event.
 * Sent when someone sends an effect, such as an emoji reaction or a soundboard sound,
 * in a voice channel the current user is connected to.
 */
export class VoiceChannelEffectSend extends BaseClass<VoiceChannelEffectSendEntity> {
  /**
   * ID of the channel the effect was sent in
   */
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  /**
   * ID of the guild the effect was sent in
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * ID of the user who sent the effect
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * The emoji sent, for emoji reaction and soundboard effects
   */
  get emoji(): EmojiEntity | null | undefined {
    return this.data.emoji;
  }

  /**
   * The type of emoji animation, for emoji reaction and soundboard effects
   */
  get animationType(): VoiceChannelEffectSendAnimationType | undefined {
    return this.data.animation_type;
  }

  /**
   * The ID of the emoji animation, for emoji reaction and soundboard effects
   */
  get animationId(): number | undefined {
    return this.data.animation_id;
  }

  /**
   * The ID of the soundboard sound, for soundboard effects
   */
  get soundId(): Snowflake | number | undefined {
    return this.data.sound_id;
  }

  /**
   * The volume of the soundboard sound, from 0 to 1, for soundboard effects
   */
  get soundVolume(): number | undefined {
    return this.data.sound_volume;
  }

  /**
   * Whether this effect is an emoji reaction
   */
  get isEmojiReaction(): boolean {
    return Boolean(this.data.emoji && !this.data.sound_id);
  }

  /**
   * Whether this effect is a soundboard sound
   */
  get isSoundboardSound(): boolean {
    return Boolean(this.data.sound_id);
  }

  /**
   * Whether this effect has an animation
   */
  get hasAnimation(): boolean {
    return (
      this.data.animation_type !== undefined &&
      this.data.animation_id !== undefined
    );
  }

  /**
   * Whether this effect is a premium animation (Nitro subscriber)
   */
  get isPremiumAnimation(): boolean {
    return (
      this.data.animation_type === VoiceChannelEffectSendAnimationType.Premium
    );
  }

  /**
   * Whether this effect is a basic animation
   */
  get isBasicAnimation(): boolean {
    return (
      this.data.animation_type === VoiceChannelEffectSendAnimationType.Basic
    );
  }
}
