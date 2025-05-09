import type { Snowflake, VoiceStateEntity } from "@nyxojs/core";
import type {
  VoiceChannelEffectSendAnimationType,
  VoiceChannelEffectSendEntity,
} from "@nyxojs/gateway";
import type {
  OtherVoiceStateUpdateOptions,
  VoiceStateUpdateOptions,
} from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import { GuildStageVoiceChannel, GuildVoiceChannel } from "./channel.class.js";
import { Emoji } from "./emoji.class.js";
import { GuildMember } from "./guild.class.js";
import { User } from "./user.class.js";

/**
 * Represents a user's voice connection state in a Discord voice channel.
 *
 * The VoiceState class provides a comprehensive wrapper around Discord's voice state API, offering:
 * - Access to a user's current voice connection status (mute/deaf, suppression, etc.)
 * - Methods to interact with and modify voice state properties
 * - Stage channel-specific functionality for managing speakers
 * - Utility methods for checking voice status conditions
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
@Cacheable<VoiceStateEntity>(
  "voiceStates",
  (data) => `${data.guild_id ?? "dm"}-${data.user_id}`,
)
export class VoiceState
  extends BaseClass<VoiceStateEntity>
  implements Enforce<PropsToCamel<VoiceStateEntity>>
{
  /**
   * The cached user object for this voice state.
   * @private
   */
  #user: User | null = null;

  /**
   * The cached guild member object for this voice state.
   * @private
   */
  #member: GuildMember | null = null;

  /**
   * The cached voice channel object for this voice state.
   * @private
   */
  #channel: GuildVoiceChannel | GuildStageVoiceChannel | null = null;

  /**
   * Gets the ID of the guild this voice state is for.
   *
   * This may be undefined for direct message voice channels which exist outside of guilds.
   *
   * @returns The guild ID as a Snowflake string, or undefined if in a DM voice channel
   */
  get guildId(): Snowflake | undefined {
    return this.rawData.guild_id;
  }

  /**
   * Gets the ID of the channel this user is connected to.
   *
   * Will be null if the user is not currently connected to a voice channel.
   *
   * @returns The channel ID as a Snowflake string, or null if not connected
   */
  get channelId(): Snowflake | null {
    return this.rawData.channel_id;
  }

  /**
   * Gets the ID of the user this voice state belongs to.
   *
   * This identifies which user's voice connection is represented by this state.
   *
   * @returns The user's ID as a Snowflake string
   */
  get userId(): Snowflake {
    return this.rawData.user_id;
  }

  /**
   * Gets the guild member object for this voice state, if available.
   *
   * Contains additional information about the user in the context of the guild.
   * This is only present for voice states in guild channels.
   *
   * @returns The guild member object in camelCase format, or undefined if not in a guild
   */
  get member(): GuildMember | undefined {
    return this.rawData.member
      ? new GuildMember(this.client, {
          ...this.rawData.member,
          guild_id: this.guildId as Snowflake,
        })
      : undefined;
  }

  /**
   * Gets the session ID for this voice state.
   *
   * This is a unique identifier for this specific voice connection,
   * used internally by Discord for voice connection management.
   *
   * @returns The session ID string
   */
  get sessionId(): string {
    return this.rawData.session_id;
  }

  /**
   * Indicates whether this user is deafened by the server.
   *
   * When true, the user cannot hear anyone and others cannot hear them.
   * This is enforced by the server and requires the DEAFEN_MEMBERS permission to change.
   *
   * @returns True if server-deafened, false otherwise
   */
  get deaf(): boolean {
    return this.rawData.deaf;
  }

  /**
   * Indicates whether this user is muted by the server.
   *
   * When true, others cannot hear the user, but they can still hear others.
   * This is enforced by the server and requires the MUTE_MEMBERS permission to change.
   *
   * @returns True if server-muted, false otherwise
   */
  get mute(): boolean {
    return this.rawData.mute;
  }

  /**
   * Indicates whether this user has chosen to deafen themselves locally.
   *
   * When true, the user has chosen not to hear anyone in the voice channel.
   * This is controlled by the user themselves and cannot be changed by others.
   *
   * @returns True if self-deafened, false otherwise
   */
  get selfDeaf(): boolean {
    return this.rawData.self_deaf;
  }

  /**
   * Indicates whether this user has chosen to mute themselves locally.
   *
   * When true, the user has chosen not to speak in the voice channel.
   * This is controlled by the user themselves and cannot be changed by others.
   *
   * @returns True if self-muted, false otherwise
   */
  get selfMute(): boolean {
    return this.rawData.self_mute;
  }

  /**
   * Indicates whether this user is streaming using Discord's "Go Live" feature.
   *
   * When true, the user is sharing their screen or application in the voice channel.
   *
   * @returns True if streaming, false otherwise
   */
  get selfStream(): boolean {
    return Boolean(this.rawData.self_stream);
  }

  /**
   * Indicates whether this user has their camera enabled.
   *
   * When true, the user is broadcasting video from their camera in the voice channel.
   *
   * @returns True if camera is enabled, false otherwise
   */
  get selfVideo(): boolean {
    return this.rawData.self_video;
  }

  /**
   * Indicates whether this user's permission to speak is denied.
   *
   * In stage channels, this indicates whether the user is a speaker (false) or audience (true).
   * Changing this status for other users requires the MUTE_MEMBERS permission.
   *
   * @returns True if suppressed (cannot speak), false otherwise
   */
  get suppress(): boolean {
    return this.rawData.suppress;
  }

  /**
   * Gets the timestamp when the user requested to speak in a stage channel.
   *
   * This is used in stage channels when audience members want to become speakers.
   * It's set to the current time when a user requests to speak, and null when cleared.
   *
   * @returns ISO8601 timestamp string, or null if not requesting to speak
   */
  get requestToSpeakTimestamp(): string | null {
    return this.rawData.request_to_speak_timestamp;
  }

  /**
   * Gets the date object representing when the user requested to speak.
   *
   * This is useful for formatting and calculating time differences.
   *
   * @returns Date object, or null if not requesting to speak
   */
  get requestToSpeakAt(): Date | null {
    return this.requestToSpeakTimestamp
      ? new Date(this.requestToSpeakTimestamp)
      : null;
  }

  /**
   * Indicates whether the user is currently in a voice channel.
   *
   * @returns True if connected to a voice channel, false otherwise
   */
  get isConnected(): boolean {
    return this.channelId !== null;
  }

  /**
   * Indicates whether the user is completely silent due to muting or deafening.
   *
   * A user is considered silent if they are server-muted, self-muted,
   * server-deafened, self-deafened, or suppressed.
   *
   * @returns True if the user cannot be heard, false otherwise
   */
  get isSilent(): boolean {
    return (
      this.mute || this.selfMute || this.deaf || this.selfDeaf || this.suppress
    );
  }

  /**
   * Indicates whether the user can hear others in the voice channel.
   *
   * A user cannot hear others if they are server-deafened or self-deafened.
   *
   * @returns True if the user can hear others, false otherwise
   */
  get canHear(): boolean {
    return !(this.deaf || this.selfDeaf);
  }

  /**
   * Indicates whether the user can speak in the voice channel.
   *
   * A user cannot speak if they are server-muted, self-muted, or suppressed.
   *
   * @returns True if the user can speak, false otherwise
   */
  get canSpeak(): boolean {
    return !(this.mute || this.selfMute || this.suppress);
  }

  /**
   * Indicates whether the user is currently requesting to speak in a stage channel.
   *
   * @returns True if requesting to speak, false otherwise
   */
  get isRequestingToSpeak(): boolean {
    return this.requestToSpeakTimestamp !== null;
  }

  /**
   * Indicates whether this voice state represents the current authenticated user.
   *
   * This is useful for determining if operations that require self-authorization
   * can be performed.
   *
   * @returns True if this voice state belongs to the current user, false otherwise
   */
  get isSelf(): boolean {
    return this.userId === this.client.user.id;
  }

  /**
   * Indicates whether this voice state is in a guild (server) or direct message.
   *
   * @returns True if in a guild, false if in a direct message
   */
  get isInGuild(): boolean {
    return this.guildId !== undefined;
  }

  /**
   * Indicates whether this voice state is in a stage channel.
   *
   * This requires fetching the channel first, so it returns a promise.
   *
   * @returns A promise resolving to true if in a stage channel, false otherwise
   */
  async isInStageChannel(): Promise<boolean> {
    const channel = await this.fetchChannel();
    return channel instanceof GuildStageVoiceChannel;
  }

  /**
   * Gets the User object for this voice state.
   *
   * This method lazily loads and caches the User object.
   *
   * @returns A promise resolving to the User object
   * @throws Error if the user could not be fetched
   */
  async fetchUser(): Promise<User> {
    if (this.#user) {
      return this.#user;
    }

    try {
      const user = await this.client.rest.users.fetchUser(this.userId);
      return new User(this.client, user);
    } catch (error) {
      throw new Error(`Failed to fetch user for voice state: ${error}`);
    }
  }

  /**
   * Gets the GuildMember object for this voice state.
   *
   * This method lazily loads and caches the GuildMember object.
   *
   * @returns A promise resolving to the GuildMember object
   * @throws Error if not in a guild or the member could not be fetched
   */
  async fetchMember(): Promise<GuildMember> {
    if (!this.isInGuild) {
      throw new Error("Voice state is not in a guild");
    }

    if (this.#member) {
      return this.#member;
    }

    try {
      const user = await this.fetchUser();
      this.#member = await user.fetchGuildMember(this.guildId as Snowflake);
      return this.#member;
    } catch (error) {
      throw new Error(`Failed to fetch guild member for voice state: ${error}`);
    }
  }

  /**
   * Gets the voice channel for this voice state.
   *
   * This method lazily loads and caches the voice channel object.
   *
   * @returns A promise resolving to the voice channel
   * @throws Error if not connected to a channel or the channel could not be fetched
   */
  async fetchChannel(): Promise<GuildVoiceChannel | GuildStageVoiceChannel> {
    if (!this.isConnected) {
      throw new Error("User is not connected to a voice channel");
    }

    if (this.#channel) {
      return this.#channel;
    }

    try {
      const data = await this.client.rest.channels.fetchChannel(
        this.channelId as Snowflake,
      );
      const channel = channelFactory(this.client, data);

      if (
        channel instanceof GuildVoiceChannel ||
        channel instanceof GuildStageVoiceChannel
      ) {
        this.#channel = channel;
        return this.#channel;
      }

      throw new Error("Channel is not a voice or stage channel");
    } catch (error) {
      throw new Error(`Failed to fetch voice channel: ${error}`);
    }
  }

  /**
   * Refreshes this voice state's data from the API.
   *
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if the voice state couldn't be fetched
   */
  async refresh(): Promise<VoiceState> {
    if (!this.isInGuild) {
      throw new Error("Cannot refresh voice state outside of a guild");
    }

    try {
      const voiceState = this.isSelf
        ? await this.client.rest.voice.fetchCurrentVoiceState(
            this.guildId as Snowflake,
          )
        : await this.client.rest.voice.fetchUserVoiceState(
            this.guildId as Snowflake,
            this.userId,
          );

      this.patch(voiceState);
      return this;
    } catch (error) {
      throw new Error(`Failed to refresh voice state: ${error}`);
    }
  }

  /**
   * Updates the current user's voice state.
   *
   * This method is particularly useful for stage channels where suppression
   * and speaker requests are important.
   *
   * @param options - Options for updating the voice state
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if this isn't the current user or the update failed
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  async updateSelf(options: VoiceStateUpdateOptions): Promise<VoiceState> {
    if (!this.isSelf) {
      throw new Error("You can only update your own voice state");
    }

    if (!this.isInGuild) {
      throw new Error("Cannot update voice state outside of a guild");
    }

    try {
      await this.client.rest.voice.updateCurrentVoiceState(
        this.guildId as Snowflake,
        options,
      );
      await this.refresh();
      return this;
    } catch (error) {
      throw new Error(`Failed to update voice state: ${error}`);
    }
  }

  /**
   * Updates another user's voice state.
   *
   * This method requires the MUTE_MEMBERS permission and is primarily used
   * for managing speakers in stage channels.
   *
   * @param options - Options for updating the voice state
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if this is the current user or the update failed
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   */
  async updateUser(options: OtherVoiceStateUpdateOptions): Promise<VoiceState> {
    if (this.isSelf) {
      throw new Error("Use updateSelf() to update your own voice state");
    }

    if (!this.isInGuild) {
      throw new Error("Cannot update voice state outside of a guild");
    }

    try {
      await this.client.rest.voice.updateUserVoiceState(
        this.guildId as Snowflake,
        this.userId,
        options,
      );

      await this.refresh();
      return this;
    } catch (error) {
      throw new Error(`Failed to update user voice state: ${error}`);
    }
  }

  /**
   * Requests to speak in a stage channel.
   *
   * This sets the request_to_speak_timestamp to the current time,
   * indicating that the user wants to become a speaker.
   *
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if not in a stage channel or not the current user
   */
  async requestToSpeak(): Promise<VoiceState> {
    if (!this.isSelf) {
      throw new Error("You can only request to speak for yourself");
    }

    if (!this.isInGuild) {
      throw new Error("Cannot request to speak outside of a guild");
    }

    const isStage = await this.isInStageChannel();
    if (!isStage) {
      throw new Error("Can only request to speak in stage channels");
    }

    return this.updateSelf({
      channel_id: this.channelId,
      request_to_speak_timestamp: new Date().toISOString(),
    });
  }

  /**
   * Cancels a request to speak in a stage channel.
   *
   * This sets the request_to_speak_timestamp to null,
   * indicating that the user no longer wants to become a speaker.
   *
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if not in a stage channel or not the current user
   */
  cancelRequestToSpeak(): Promise<VoiceState> {
    if (!this.isSelf) {
      throw new Error("You can only cancel speak requests for yourself");
    }

    if (!this.isInGuild) {
      throw new Error("Cannot cancel speak requests outside of a guild");
    }

    return this.updateSelf({
      channel_id: this.channelId,
      request_to_speak_timestamp: null,
    });
  }

  /**
   * Makes the user a speaker in a stage channel.
   *
   * This sets suppress to false, allowing the user to speak.
   * Requires the MUTE_MEMBERS permission if modifying another user.
   *
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if not in a stage channel or lacking permissions
   */
  async makeStageChannelSpeaker(): Promise<VoiceState> {
    if (!this.isInGuild) {
      throw new Error("Cannot modify stage speakers outside of a guild");
    }

    const isStage = await this.isInStageChannel();
    if (!isStage) {
      throw new Error("Can only modify speakers in stage channels");
    }

    if (this.isSelf) {
      return this.updateSelf({
        channel_id: this.channelId,
        suppress: false,
        request_to_speak_timestamp: null,
      });
    }
    return this.updateUser({
      channel_id: this.channelId,
      suppress: false,
    });
  }

  /**
   * Makes the user an audience member in a stage channel.
   *
   * This sets suppress to true, preventing the user from speaking.
   * Requires the MUTE_MEMBERS permission if modifying another user.
   *
   * @returns A promise resolving to the updated VoiceState instance
   * @throws Error if not in a stage channel or lacking permissions
   */
  async makeStageChannelAudience(): Promise<VoiceState> {
    if (!this.isInGuild) {
      throw new Error("Cannot modify stage audience outside of a guild");
    }

    const isStage = await this.isInStageChannel();
    if (!isStage) {
      throw new Error("Can only modify audience in stage channels");
    }

    if (this.isSelf) {
      return this.updateSelf({
        channel_id: this.channelId,
        suppress: true,
        request_to_speak_timestamp: null,
      });
    }
    return this.updateUser({
      channel_id: this.channelId,
      suppress: true,
    });
  }

  /**
   * Checks if the user is a stage channel speaker.
   *
   * A user is considered a speaker if they are in a stage channel and not suppressed.
   *
   * @returns A promise resolving to true if the user is a speaker, false otherwise
   */
  async isStageSpeaker(): Promise<boolean> {
    if (!(this.isInGuild && this.isConnected)) {
      return false;
    }

    try {
      const isStage = await this.isInStageChannel();
      return isStage && !this.suppress;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the user is a stage channel audience member.
   *
   * A user is considered an audience member if they are in a stage channel and suppressed.
   *
   * @returns A promise resolving to true if the user is an audience member, false otherwise
   */
  async isStageAudience(): Promise<boolean> {
    if (!(this.isInGuild && this.isConnected)) {
      return false;
    }

    try {
      const isStage = await this.isInStageChannel();
      return isStage && this.suppress;
    } catch {
      return false;
    }
  }

  /**
   * Gets the time elapsed since the user requested to speak.
   *
   * @returns The time in milliseconds since the request, or null if not requesting
   */
  getTimeSinceRequestToSpeak(): number | null {
    if (!this.requestToSpeakAt) {
      return null;
    }

    return Date.now() - this.requestToSpeakAt.getTime();
  }
}

/**
 * Represents an effect sent in a Discord voice channel.
 *
 * The VoiceChannelEffect class encapsulates information about visual and audio effects
 * that users can send in voice channels, including emoji reactions and soundboard sounds.
 *
 * This class is typically instantiated when a VOICE_CHANNEL_EFFECT_SEND gateway event
 * is received, indicating that someone has sent an effect in a voice channel that
 * the current user is connected to.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send}
 */
export class VoiceChannelEffect
  extends BaseClass<VoiceChannelEffectSendEntity>
  implements Enforce<PropsToCamel<VoiceChannelEffectSendEntity>>
{
  /**
   * Cached user instance that sent this effect.
   * @private
   */
  #user: User | null = null;

  /**
   * Cached emoji instance used in this effect.
   * @private
   */
  #emoji: Emoji | null = null;

  /**
   * Gets the ID of the channel where the effect was sent.
   *
   * This identifies which voice channel received the effect and
   * where the effect should be displayed or played.
   *
   * @returns The channel ID as a Snowflake string
   */
  get channelId(): Snowflake {
    return this.rawData.channel_id;
  }

  /**
   * Gets the ID of the guild where the effect was sent.
   *
   * This provides the guild context for the voice channel and effect.
   *
   * @returns The guild ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the ID of the user who sent the effect.
   *
   * This identifies which user triggered the effect in the voice channel.
   *
   * @returns The user ID as a Snowflake string
   */
  get userId(): Snowflake {
    return this.rawData.user_id;
  }

  /**
   * Gets the emoji object for the effect, if applicable.
   *
   * Emoji effects display an animated emoji in the voice channel.
   * This property is only present for emoji reaction effects.
   *
   * @returns The emoji object in camelCase format, or undefined if not an emoji effect
   */
  get emoji(): Emoji | null | undefined {
    return this.rawData.emoji
      ? new Emoji(this.client, {
          ...this.rawData.emoji,
          guild_id: this.guildId,
        })
      : null;
  }

  /**
   * Gets the animation type used for the effect.
   *
   * This property determines the visual style of emoji effects,
   * with different animations available based on the user's subscription status.
   *
   * @returns The animation type enum value, or undefined if not applicable
   */
  get animationType(): VoiceChannelEffectSendAnimationType | undefined {
    return this.rawData.animation_type;
  }

  /**
   * Gets the specific animation ID used for the effect.
   *
   * This corresponds to a particular animation style or visual effect.
   *
   * @returns The animation ID number, or undefined if not applicable
   */
  get animationId(): number | undefined {
    return this.rawData.animation_id;
  }

  /**
   * Gets the ID of the soundboard sound, for soundboard effects.
   *
   * This can be either a Snowflake for custom sounds or a number for
   * standard Discord soundboard sounds.
   *
   * @returns The sound ID as a Snowflake or number, or undefined if not a sound effect
   */
  get soundId(): Snowflake | number | undefined {
    return this.rawData.sound_id;
  }

  /**
   * Gets the volume of the soundboard sound.
   *
   * The volume ranges from 0 (silent) to 1 (full volume).
   * This property is only present for soundboard effects.
   *
   * @returns The sound volume as a number between 0 and 1, or undefined if not applicable
   */
  get soundVolume(): number | undefined {
    return this.rawData.sound_volume;
  }

  /**
   * Indicates whether this effect is an emoji reaction.
   *
   * Emoji reactions display an animated emoji in the voice channel.
   *
   * @returns True if this is an emoji effect, false otherwise
   */
  get isEmojiEffect(): boolean {
    return this.emoji !== undefined && this.emoji !== null;
  }

  /**
   * Indicates whether this effect is a soundboard sound.
   *
   * Soundboard effects play an audio clip in the voice channel.
   *
   * @returns True if this is a sound effect, false otherwise
   */
  get isSoundEffect(): boolean {
    return this.soundId !== undefined;
  }

  /**
   * Indicates whether this is a premium animation.
   *
   * Premium animations have enhanced visual effects and are only
   * available to Nitro subscribers.
   *
   * @returns True if this is a premium animation, false if basic or undefined
   */
  get isPremiumAnimation(): boolean {
    return this.animationType === 0; // VoiceChannelEffectSendAnimationType.Premium
  }

  /**
   * Indicates whether this is a basic animation.
   *
   * Basic animations have simpler visual effects and are available to all users.
   *
   * @returns True if this is a basic animation, false if premium or undefined
   */
  get isBasicAnimation(): boolean {
    return this.animationType === 1; // VoiceChannelEffectSendAnimationType.Basic
  }

  /**
   * Gets the User object who sent this effect.
   *
   * This method lazily loads and caches the User object.
   *
   * @returns A promise resolving to the User object
   * @throws Error if the user could not be fetched
   */
  async fetchUser(): Promise<User> {
    if (this.#user) {
      return this.#user;
    }

    try {
      const user = await this.client.rest.users.fetchUser(this.userId);
      return new User(this.client, user);
    } catch (error) {
      throw new Error(
        `Failed to fetch user for voice channel effect: ${error}`,
      );
    }
  }

  /**
   * Gets the Emoji object used in this effect, if applicable.
   *
   * This method lazily loads and caches the Emoji object.
   *
   * @returns A promise resolving to the Emoji object, or null if not an emoji effect
   * @throws Error if the emoji could not be fetched
   */
  async fetchEmoji(): Promise<Emoji | null> {
    if (!this.isEmojiEffect) {
      return null;
    }
    if (this.#emoji) {
      return this.#emoji;
    }

    try {
      // This assumes emoji.id exists and is a valid Snowflake
      if (this.emoji?.id) {
        const emoji = await this.client.rest.emojis.fetchGuildEmoji(
          this.guildId,
          this.emoji.id as Snowflake,
        );
        return new Emoji(this.client, { ...emoji, guild_id: this.guildId });
      }

      return null;
    } catch (error) {
      throw new Error(
        `Failed to fetch emoji for voice channel effect: ${error}`,
      );
    }
  }

  /**
   * Checks if this effect was sent by a specific user.
   *
   * @param userId - The ID of the user to check
   * @returns True if the effect was sent by the specified user, false otherwise
   */
  isSentBy(userId: Snowflake): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if this effect was sent by the current user.
   *
   * @returns True if the effect was sent by the current user, false otherwise
   */
  isSentBySelf(): boolean {
    return this.userId === this.client.user.id;
  }
}
