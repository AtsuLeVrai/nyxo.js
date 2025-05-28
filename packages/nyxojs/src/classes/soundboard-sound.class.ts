import type { Snowflake, SoundboardSoundEntity } from "@nyxojs/core";
import type {
  GuildSoundUpdateOptions,
  SoundboardSendOptions,
} from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Soundboard Sound, providing methods to interact with and manage soundboard sounds.
 *
 * The SoundboardSound class serves as a comprehensive wrapper around Discord's Soundboard Sound API, offering:
 * - Access to sound metadata (name, emoji, volume, etc.)
 * - Methods to update or delete sounds
 * - Utilities for playing sounds in voice channels
 * - User and permissions management for sound usage
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
@Cacheable("soundboards")
export class SoundboardSound
  extends BaseClass<SoundboardSoundEntity>
  implements Enforce<PropsToCamel<SoundboardSoundEntity>>
{
  /**
   * The ID of this sound.
   *
   * This is a unique identifier that can be used to retrieve the sound file from Discord's CDN:
   * https://cdn.discordapp.com/soundboard-sounds/{sound_id}
   *
   * @returns The sound's ID as a Snowflake string
   */
  readonly soundId = this.rawData.sound_id;

  /**
   * The name of this sound.
   *
   * This is the display name that appears in the Discord client (2-32 characters).
   *
   * @returns The sound's name as a string
   */
  readonly name = this.rawData.name;

  /**
   * The volume of this sound.
   *
   * Controls how loud the sound plays when triggered, ranging from 0 to 1.
   *
   * @returns The sound's volume as a number between 0 and 1
   */
  readonly volume = this.rawData.volume;

  /**
   * The ID of this sound's custom emoji, if any.
   *
   * If the sound uses a custom emoji, this contains its ID.
   * Will be null if the sound uses a standard emoji or no emoji.
   *
   * @returns The emoji ID as a Snowflake string, or null if not using a custom emoji
   */
  readonly emojiId = this.rawData.emoji_id;

  /**
   * The unicode character of this sound's standard emoji, if any.
   *
   * If the sound uses a standard unicode emoji, this contains the character.
   * Will be null if the sound uses a custom emoji or no emoji.
   *
   * @returns The emoji name as a string, or null if not using a standard emoji
   */
  readonly emojiName = this.rawData.emoji_name;

  /**
   * The ID of the guild this sound is in, if applicable.
   *
   * Identifies which guild the sound belongs to for guild-specific sounds.
   * Not present for default sounds available to all users.
   *
   * @returns The guild's ID as a Snowflake string, or undefined for default sounds
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Whether this sound can be used.
   *
   * May be false due to loss of Server Boosts or other permission restrictions.
   * Users cannot play sounds that are unavailable.
   *
   * @returns True if the sound is available for use, false otherwise
   */
  readonly available = this.rawData.available;

  /**
   * The user who created this sound.
   *
   * Contains information about the user who uploaded the sound.
   * Only included in responses if the bot has the CREATE_GUILD_EXPRESSIONS
   * or MANAGE_GUILD_EXPRESSIONS permission.
   *
   * @returns The User object who created the sound, or undefined if not available
   */
  readonly user = this.rawData.user
    ? new User(this.client, this.rawData.user)
    : undefined;

  /**
   * Indicates whether this sound has a custom emoji.
   *
   * @returns True if the sound has a custom emoji, false otherwise
   */
  get hasCustomEmoji(): boolean {
    return this.emojiId !== null;
  }

  /**
   * Indicates whether this sound has a standard emoji.
   *
   * @returns True if the sound has a standard emoji, false otherwise
   */
  get hasStandardEmoji(): boolean {
    return this.emojiName !== null;
  }

  /**
   * Indicates whether this sound is a guild-specific sound.
   *
   * @returns True if the sound belongs to a specific guild, false for default sounds
   */
  get isGuildSound(): boolean {
    return this.guildId !== undefined;
  }

  /**
   * Indicates whether this sound is a default sound.
   *
   * Default sounds are available to all users across Discord.
   *
   * @returns True if the sound is a default sound, false for guild-specific sounds
   */
  get isDefaultSound(): boolean {
    return this.guildId === undefined;
  }

  /**
   * Updates this soundboard sound with new information.
   *
   * This method allows modifying the name, volume, or emoji of the sound.
   *
   * @param options - Options for updating the soundboard sound
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the sound couldn't be updated
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  async update(
    options: GuildSoundUpdateOptions,
    reason?: string,
  ): Promise<SoundboardSound> {
    if (!this.guildId) {
      throw new Error("Default sounds cannot be updated");
    }

    const updatedSound = await this.client.rest.soundboards.updateSound(
      this.guildId,
      this.soundId,
      options,
      reason,
    );

    this.patch(updatedSound);
    return this;
  }

  /**
   * Deletes this soundboard sound.
   *
   * This permanently removes the sound from the guild's soundboard.
   * Cannot be used on default sounds.
   *
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise resolving when the deletion is complete
   * @throws Error if the sound couldn't be deleted or is a default sound
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   */
  async delete(reason?: string): Promise<void> {
    if (!this.guildId) {
      throw new Error("Default sounds cannot be deleted");
    }

    await this.client.rest.soundboards.deleteSound(
      this.guildId,
      this.soundId,
      reason,
    );

    this.uncache();
  }

  /**
   * Plays this sound in a voice channel.
   *
   * Requires the SPEAK and USE_SOUNDBOARD permissions.
   * If the sound is from a different server, also requires USE_EXTERNAL_SOUNDS.
   *
   * @param channelId - The ID of the voice channel to play the sound in
   * @returns A promise resolving when the sound is sent
   * @throws Error if the sound couldn't be played
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  play(channelId: Snowflake): Promise<void> {
    const options: SoundboardSendOptions = {
      sound_id: this.soundId,
      // Include source_guild_id if this is a guild sound and user is not in that guild
      source_guild_id: this.isGuildSound ? this.guildId : undefined,
    };

    return this.client.rest.soundboards.sendSound(channelId, options);
  }

  /**
   * Sets a new name for this soundboard sound.
   *
   * @param name - The new name for the sound (2-32 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the name couldn't be updated
   */
  setName(name: string, reason?: string): Promise<SoundboardSound> {
    return this.update({ name }, reason);
  }

  /**
   * Sets a new volume for this soundboard sound.
   *
   * @param volume - The new volume for the sound (0 to 1)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the volume couldn't be updated
   */
  setVolume(volume: number, reason?: string): Promise<SoundboardSound> {
    return this.update({ volume }, reason);
  }

  /**
   * Sets a custom emoji for this soundboard sound.
   *
   * @param emojiId - The ID of the custom emoji
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the emoji couldn't be updated
   */
  setCustomEmoji(
    emojiId: Snowflake,
    reason?: string,
  ): Promise<SoundboardSound> {
    return this.update(
      {
        emoji_id: emojiId,
        emoji_name: null,
      },
      reason,
    );
  }

  /**
   * Sets a standard emoji for this soundboard sound.
   *
   * @param emojiName - The unicode character of the standard emoji
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the emoji couldn't be updated
   */
  setStandardEmoji(
    emojiName: string,
    reason?: string,
  ): Promise<SoundboardSound> {
    return this.update(
      {
        emoji_name: emojiName,
        emoji_id: null,
      },
      reason,
    );
  }

  /**
   * Removes the emoji from this soundboard sound.
   *
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the emoji couldn't be removed
   */
  removeEmoji(reason?: string): Promise<SoundboardSound> {
    return this.update(
      {
        emoji_id: null,
        emoji_name: null,
      },
      reason,
    );
  }

  /**
   * Refreshes this soundboard sound's data from the API.
   *
   * @returns A promise resolving to the updated SoundboardSound
   * @throws Error if the sound couldn't be fetched
   */
  async refresh(): Promise<SoundboardSound> {
    if (!this.guildId) {
      // For default sounds, we'd need to fetch the full list and find this one
      throw new Error("Refreshing default sounds is not supported");
    }

    const soundData = await this.client.rest.soundboards.fetchGuildSound(
      this.guildId,
      this.soundId,
    );

    this.patch(soundData);
    return this;
  }
}
