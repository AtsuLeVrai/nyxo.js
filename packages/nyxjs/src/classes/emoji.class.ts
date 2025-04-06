import {
  type EmojiEntity,
  type FormattedCustomEmoji,
  formatCustomEmoji,
  type GuildEntity,
  type Snowflake,
} from "@nyxjs/core";
import type {
  ModifyApplicationEmojiSchema,
  ModifyGuildEmojiSchema,
} from "@nyxjs/rest";
import { type AnimatedImageOptions, Cdn } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord emoji.
 *
 * Emojis in Discord are small images that can be used in messages and reactions.
 * They come in two main types:
 * - Custom emojis: Created by users in guilds, have an ID, and can be restricted by role
 * - Standard emojis: Unicode characters like 😀 that don't have an ID
 *
 * Custom emojis can be either guild-owned or application-owned. Application-owned
 * emojis can be used across servers without requiring the USE_EXTERNAL_EMOJIS permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji}
 */
export class Emoji extends BaseClass<EmojiEntity> {
  /**
   * The unique ID of this emoji
   * @remarks Standard emoji will have null as ID since they're Unicode characters
   */
  get id(): Snowflake | null {
    return this.data.id;
  }

  /**
   * The name of the emoji
   * @remarks Can be null in reaction emoji objects
   */
  get name(): string | null {
    return this.data.name;
  }

  /**
   * The array of role IDs that can use this emoji
   * @remarks Undefined if emoji has no role restrictions
   */
  get roles(): Snowflake[] | undefined {
    return this.data.roles;
  }

  /**
   * The user that created this emoji
   * @remarks Only available when retrieved with the MANAGE_GUILD_EXPRESSIONS permission
   */
  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user);
  }

  /**
   * Whether this emoji must be wrapped in colons when used in chat
   */
  get requireColons(): boolean {
    return Boolean(this.data.require_colons);
  }

  /**
   * Whether this emoji is managed by an integration
   * @remarks True for emojis managed by integrations like Twitch
   */
  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  /**
   * Whether this emoji is animated
   */
  get animated(): boolean {
    return Boolean(this.data.animated);
  }

  /**
   * Whether this emoji can be used
   * @remarks May be false due to loss of Server Boosts
   */
  get available(): boolean {
    return Boolean(this.data.available); // Default to true if undefined
  }

  /**
   * Whether this emoji is a custom emoji (has an ID)
   * @remarks Standard Unicode emojis don't have IDs and return false
   */
  get isCustom(): boolean {
    return this.id !== null;
  }

  /**
   * The identifier of this emoji (name:id for custom emojis, name for standard emojis)
   */
  get identifier(): string {
    if (!(this.isCustom && this.name)) {
      return this.name || "";
    }
    return `${this.name}:${this.id}`;
  }

  /**
   * The formatted version of this emoji for use in messages
   * @remarks
   * For custom emoji: <:name:id> or <a:name:id> for animated ones
   * For standard emoji: just returns the name (Unicode character)
   */
  get formatted(): FormattedCustomEmoji {
    if (!(this.isCustom && this.name)) {
      return this.name as FormattedCustomEmoji;
    }

    return formatCustomEmoji(this.name, this.id as Snowflake, this.animated);
  }

  /**
   * Gets the URL for this emoji's image
   *
   * @param options - Display options for the emoji
   * @returns URL to the emoji's image, or null if this is a standard emoji
   */
  imageUrl(options: AnimatedImageOptions = {}): string | null {
    if (!this.isCustom) {
      return null;
    }

    const emojiId = this.id as Snowflake; // Safe cast since we checked isCustom
    return Cdn.emoji(emojiId, {
      animated: this.animated,
      ...options,
    });
  }

  /**
   * Creates a download URL for this emoji with the specified filename
   *
   * @param filename - The filename to use when downloading (without extension)
   * @param options - Display options for the emoji
   * @returns URL with Content-Disposition header for downloading, or null if this is a standard emoji
   */
  downloadUrl(
    filename = "emoji",
    options: AnimatedImageOptions = {},
  ): string | null {
    const url = this.imageUrl(options);
    if (!url) {
      return null;
    }

    const extension = this.animated ? "gif" : options.format || "png";
    const urlObj = new URL(url);
    urlObj.searchParams.set("attachment", `${filename}.${extension}`);

    return urlObj.toString();
  }

  /**
   * Fetches this emoji from the API, updating the current instance with fresh data
   *
   * @param guildId - The ID of the guild this emoji belongs to
   * @param options - Options for the fetch operation
   * @returns Promise resolving to this emoji with updated data
   * @throws Error if this emoji is a standard emoji with no ID
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  async fetch(
    guildId: Snowflake,
    options: { force?: boolean } = {},
  ): Promise<Emoji> {
    if (!this.isCustom) {
      throw new Error("Cannot fetch a standard emoji");
    }

    if (!options.force) {
      // Check cache for the emoji if available
      const cachedEmoji = this.client.emojis?.get(this.id as Snowflake);
      if (cachedEmoji) {
        return cachedEmoji;
      }
    }

    const data = await this.client.rest.emojis.getGuildEmoji(
      guildId,
      this.id as Snowflake, // Safe cast since we checked isCustom
    );

    Object.assign(this.data, data);
    return this;
  }

  /**
   * Fetches an application-owned emoji by ID
   *
   * @param applicationId - The ID of the application this emoji belongs to
   * @param options - Options for the fetch operation
   * @returns Promise resolving to this emoji with updated data
   * @throws Error if this emoji is a standard emoji with no ID
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  async fetchApplicationEmoji(
    applicationId: Snowflake,
    options: { force?: boolean } = {},
  ): Promise<Emoji> {
    if (!(this.isCustom && this.id)) {
      throw new Error("Cannot fetch a standard emoji");
    }

    if (!options.force) {
      // Check cache for the emoji if available
      const cachedEmoji = this.client.emojis?.get(this.id);
      if (cachedEmoji) {
        return cachedEmoji;
      }
    }

    const data = await this.client.rest.emojis.getApplicationEmoji(
      applicationId,
      this.id as Snowflake, // Safe cast since we checked isCustom
    );

    Object.assign(this.data, data);
    return this;
  }

  /**
   * Modifies this guild emoji
   *
   * @param guildId - The ID of the guild this emoji belongs to
   * @param options - Options for modifying the emoji
   * @param reason - Optional audit log reason
   * @returns Promise resolving to the updated emoji
   * @throws Error if this emoji is a standard emoji with no ID
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  async modify(
    guildId: Snowflake,
    options: ModifyGuildEmojiSchema,
    reason?: string,
  ): Promise<Emoji> {
    if (!(this.isCustom && this.id)) {
      throw new Error("Cannot modify a standard emoji");
    }

    const data = await this.client.rest.emojis.modifyGuildEmoji(
      guildId,
      this.id, // Safe cast since we checked isCustom
      options,
      reason,
    );

    Object.assign(this.data, data);
    return this;
  }

  /**
   * Modifies this application emoji
   *
   * @param applicationId - The ID of the application this emoji belongs to
   * @param options - Options for modifying the emoji (only name can be modified)
   * @param reason - Optional reason
   * @returns Promise resolving to the updated emoji
   * @throws Error if this emoji is a standard emoji with no ID
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  async modifyApplicationEmoji(
    applicationId: Snowflake,
    options: ModifyApplicationEmojiSchema,
    reason?: string,
  ): Promise<Emoji> {
    if (!(this.isCustom && this.id)) {
      throw new Error("Cannot modify a standard emoji");
    }

    const data = await this.client.rest.emojis.modifyApplicationEmoji(
      applicationId,
      this.id, // Safe cast since we checked isCustom
      options,
      reason,
    );

    Object.assign(this.data, data);
    return this;
  }

  /**
   * Deletes this guild emoji
   *
   * @param guildId - The ID of the guild this emoji belongs to
   * @param reason - Optional audit log reason
   * @returns Promise that resolves when the emoji is deleted
   * @throws Error if this emoji is a standard emoji with no ID
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  async delete(guildId: Snowflake, reason?: string): Promise<void> {
    if (!(this.isCustom && this.id)) {
      throw new Error("Cannot delete a standard emoji");
    }

    await this.client.rest.emojis.deleteGuildEmoji(
      guildId,
      this.id as Snowflake, // Safe cast since we checked isCustom
      reason,
    );

    // Remove from cache if applicable
    this.client.emojis?.delete(this.id);
  }

  /**
   * Deletes this application emoji
   *
   * @param applicationId - The ID of the application this emoji belongs to
   * @param reason - Optional reason
   * @returns Promise that resolves when the emoji is deleted
   * @throws Error if this emoji is a standard emoji with no ID
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
   */
  async deleteApplicationEmoji(
    applicationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    if (!(this.isCustom && this.id)) {
      throw new Error("Cannot delete a standard emoji");
    }

    await this.client.rest.emojis.deleteApplicationEmoji(
      applicationId,
      this.id as Snowflake, // Safe cast since we checked isCustom
      reason,
    );

    // Remove from cache if applicable
    this.client.emojis?.delete(this.id as Snowflake);
  }

  /**
   * Creates a reaction with this emoji on a message
   *
   * @param channelId - The ID of the channel the message is in
   * @param messageId - The ID of the message to react to
   * @returns Promise that resolves when the reaction is created
   * @throws Error if the reaction cannot be created
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
   */
  createReaction(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    const emojiIdentifier = this.isCustom
      ? `${this.name}:${this.id}`
      : encodeURIComponent(this.name || "");

    return this.client.rest.messages.createReaction(
      channelId,
      messageId,
      emojiIdentifier,
    );
  }

  /**
   * Deletes the current user's reaction with this emoji from a message
   *
   * @param channelId - The ID of the channel the message is in
   * @param messageId - The ID of the message to remove the reaction from
   * @returns Promise that resolves when the reaction is deleted
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-own-reaction}
   */
  deleteOwnReaction(channelId: Snowflake, messageId: Snowflake): Promise<void> {
    const emojiIdentifier = this.isCustom
      ? `${this.name}:${this.id}`
      : encodeURIComponent(this.name || "");

    return this.client.rest.messages.deleteOwnReaction(
      channelId,
      messageId,
      emojiIdentifier,
    );
  }

  /**
   * Deletes another user's reaction with this emoji from a message
   *
   * @param channelId - The ID of the channel the message is in
   * @param messageId - The ID of the message to remove the reaction from
   * @param userId - The ID of the user whose reaction to remove
   * @returns Promise that resolves when the reaction is deleted
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-user-reaction}
   */
  deleteUserReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    userId: Snowflake,
  ): Promise<void> {
    const emojiIdentifier = this.isCustom
      ? `${this.name}:${this.id}`
      : encodeURIComponent(this.name || "");

    return this.client.rest.messages.deleteUserReaction(
      channelId,
      messageId,
      emojiIdentifier,
      userId,
    );
  }

  /**
   * Gets all users who reacted with this emoji on a message
   *
   * @param channelId - The ID of the channel the message is in
   * @param messageId - The ID of the message to get reactions from
   * @param options - Query options for pagination
   * @returns Promise resolving to an array of users
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  async getReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    options: { limit?: number; after?: Snowflake } = {},
  ): Promise<User[]> {
    const emojiIdentifier = this.isCustom
      ? `${this.name}:${this.id}`
      : encodeURIComponent(this.name || "");

    const users = await this.client.rest.messages.getReactions(
      channelId,
      messageId,
      emojiIdentifier,
      options,
    );

    return users.map((user) => new User(this.client, user));
  }

  /**
   * Deletes all reactions with this emoji from a message
   *
   * @param channelId - The ID of the channel the message is in
   * @param messageId - The ID of the message to remove reactions from
   * @returns Promise that resolves when the reactions are deleted
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji}
   */
  deleteAllReactions(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<void> {
    const emojiIdentifier = this.isCustom
      ? `${this.name}:${this.id}`
      : encodeURIComponent(this.name || "");

    return this.client.rest.messages.deleteAllReactionsForEmoji(
      channelId,
      messageId,
      emojiIdentifier,
    );
  }

  /**
   * Checks if this emoji is usable by the specified roles
   *
   * @param roleIds - Array of role IDs to check against
   * @returns Whether any of the provided roles can use this emoji
   */
  isUsableBy(roleIds: Snowflake[]): boolean {
    // If there are no role restrictions, everyone can use it
    if (!this.roles || this.roles.length === 0) {
      return true;
    }

    // Check if any of the user's roles are allowed to use this emoji
    return roleIds.some((roleId) => this.roles?.includes(roleId));
  }

  /**
   * Checks if this emoji can be used by a guild member
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @returns Promise that resolves to whether the member can use this emoji
   */
  async isUsableByMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<boolean> {
    // If there are no role restrictions, everyone can use it
    if (!this.roles || this.roles.length === 0) {
      return true;
    }

    try {
      const member = await this.client.rest.guilds.getGuildMember(
        guildId,
        userId,
      );
      return this.isUsableBy(member.roles);
    } catch {
      return false;
    }
  }

  /**
   * Identifies if this emoji belongs to a specific guild
   *
   * @param guild - The guild or guild ID to check against
   * @returns Promise resolving to whether this emoji belongs to the guild
   */
  async belongsToGuild(guild: GuildEntity | Snowflake): Promise<boolean> {
    if (!this.isCustom) {
      return false;
    }

    const guildId = typeof guild === "string" ? guild : guild.id;

    try {
      // Try to fetch the emoji from the guild
      await this.client.rest.emojis.getGuildEmoji(
        guildId,
        this.id as Snowflake,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Identifies if this emoji belongs to a specific application
   *
   * @param applicationId - The application ID to check against
   * @returns Promise resolving to whether this emoji belongs to the application
   */
  async belongsToApplication(applicationId: Snowflake): Promise<boolean> {
    if (!this.isCustom) {
      return false;
    }

    try {
      // Try to fetch the emoji from the application
      await this.client.rest.emojis.getApplicationEmoji(
        applicationId,
        this.id as Snowflake,
      );
      return true;
    } catch {
      return false;
    }
  }
}
