import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a soundboard sound that can be played in voice channels.
 */
export class SoundboardSound extends BaseClass<SoundboardSoundEntity> {
  /**
   * The name of this sound
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The ID of this sound
   */
  get soundId(): Snowflake {
    return this.data.sound_id;
  }

  /**
   * The volume of this sound, from 0 to 1
   */
  get volume(): number {
    return this.data.volume;
  }

  /**
   * The ID of this sound's custom emoji, if any
   */
  get emojiId(): Snowflake | null {
    return this.data.emoji_id;
  }

  /**
   * The unicode character of this sound's standard emoji, if any
   */
  get emojiName(): string | null {
    return this.data.emoji_name;
  }

  /**
   * The ID of the guild this sound is in, if applicable
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * Whether this sound can be used, may be false due to loss of Server Boosts
   */
  get available(): boolean {
    return Boolean(this.data.available);
  }

  /**
   * The user who created this sound
   */
  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }
    return new User(this.client, this.data.user);
  }

  /**
   * Whether this sound has a custom emoji
   */
  get hasCustomEmoji(): boolean {
    return Boolean(this.data.emoji_id);
  }

  /**
   * Whether this sound has a standard emoji
   */
  get hasStandardEmoji(): boolean {
    return Boolean(this.data.emoji_name);
  }

  /**
   * Whether this sound has guild context
   */
  get hasGuild(): boolean {
    return Boolean(this.data.guild_id);
  }

  /**
   * Whether this sound has user context
   */
  get hasUser(): boolean {
    return Boolean(this.data.user);
  }
}
