import {
  type EmojiEntity,
  type FormattedCustomEmoji,
  type Link,
  type Snowflake,
  type UserEntity,
  formatCustomEmoji,
  link,
} from "@nyxojs/core";
import {
  type AnimatedImageOptions,
  Cdn,
  type EmojiUrl,
  type ModifyApplicationEmojiSchema,
  type ModifyGuildEmojiSchema,
} from "@nyxojs/rest";
import type { CamelCasedProperties } from "type-fest";
import type { z } from "zod";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import { toSnakeCaseProperties } from "../utils/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Emoji object.
 *
 * The Emoji class serves as a comprehensive wrapper around Discord's emoji API, offering:
 * - Access to emoji properties (name, ID, animated status, etc.)
 * - Methods for creating, updating, and deleting emojis
 * - Tools for generating emoji URLs and formatted strings
 * - Utilities for checking permissions and availability
 *
 * Discord supports three main types of emoji:
 * - Standard emoji: Unicode emoji with null ID
 * - Guild emoji: Custom emoji belonging to a specific guild
 * - Application-owned emoji: Custom emoji that can only be used by a specific application
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @example
 * ```typescript
 * // Fetching a guild emoji
 * const emoji = await guild.fetchEmoji('123456789012345678');
 * console.log(`Emoji name: ${emoji.name}`);
 *
 * // Creating a new emoji
 * const newEmoji = await guild.createEmoji({
 *   name: 'my_emoji',
 *   image: await FileHandler.fromFile('path/to/emoji.png')
 * });
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji}
 */
@Cacheable("emojis")
export class Emoji
  extends BaseClass<GuildBased<EmojiEntity>>
  implements Enforce<CamelCasedProperties<GuildBased<EmojiEntity>>>
{
  /**
   * Gets the unique identifier (Snowflake) of this emoji.
   *
   * This will be null for standard Unicode emoji.
   * Custom emoji (both guild and application-owned) will have a snowflake ID.
   *
   * @returns The emoji's ID as a Snowflake string, or null for standard emoji
   *
   * @example
   * ```typescript
   * if (emoji.id) {
   *   console.log(`Custom emoji ID: ${emoji.id}`);
   * } else {
   *   console.log('This is a standard Unicode emoji');
   * }
   * ```
   */
  get id(): Snowflake | null {
    return this.data.id;
  }

  /**
   * Gets the ID of the guild where this emoji belongs.
   *
   * For guild emojis, this identifies the guild that owns the emoji.
   * For application emojis, this will be undefined.
   *
   * @returns The guild ID, or undefined if not a guild emoji
   *
   * @example
   * ```typescript
   * if (emoji.guildId) {
   *   console.log(`This emoji belongs to guild: ${emoji.guildId}`);
   * } else {
   *   console.log('This is not a guild emoji');
   * }
   * ```
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Gets the name of the emoji.
   *
   * For custom emoji, this is the name assigned when created (e.g., "serverboost").
   * For standard emoji, this is the Unicode character (e.g., "🔥").
   *
   * @returns The emoji's name as a string, or null if not available
   *
   * @example
   * ```typescript
   * console.log(`Emoji name: ${emoji.name}`);
   * ```
   */
  get name(): string | null {
    return this.data.name;
  }

  /**
   * Gets the array of role IDs that are allowed to use this emoji.
   *
   * If no roles are specified, the emoji is available to all members in the guild.
   * This property is only relevant for guild emojis with role restrictions.
   *
   * @returns Array of role IDs, or undefined if no restrictions
   *
   * @example
   * ```typescript
   * const roles = emoji.roles;
   * if (roles && roles.length > 0) {
   *   console.log(`This emoji is restricted to ${roles.length} roles`);
   * } else {
   *   console.log('This emoji can be used by everyone in the guild');
   * }
   * ```
   */
  get roles(): Snowflake[] | undefined {
    return this.data.roles;
  }

  /**
   * Gets the User object for the user that created this emoji.
   *
   * This field is only returned when the client has permissions to view it,
   * typically requiring MANAGE_GUILD_EXPRESSIONS or CREATE_GUILD_EXPRESSIONS permissions.
   *
   * @returns The User object for the creator, or undefined if not available
   *
   * @example
   * ```typescript
   * const creator = emoji.user;
   * if (creator) {
   *   console.log(`Emoji created by: ${creator.username}`);
   * }
   * ```
   */
  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user as UserEntity);
  }

  /**
   * Indicates whether this emoji must be wrapped in colons to be used in chat.
   *
   * True for most custom emoji that require the format `:emoji_name:`.
   * This applies to custom emoji, not to standard Unicode emoji.
   *
   * @returns True if colons are required, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.requireColons) {
   *   console.log('Use this emoji with colons like :example:');
   * } else {
   *   console.log('This emoji can be used without colons');
   * }
   * ```
   */
  get requireColons(): boolean {
    return Boolean(this.data.require_colons);
  }

  /**
   * Indicates whether this emoji is managed by an integration.
   *
   * Managed emoji cannot be modified or deleted by regular users.
   * These are typically created by integrations such as Twitch or Soundboard.
   *
   * @returns True if the emoji is managed, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.managed) {
   *   console.log('This emoji is managed by an integration and cannot be modified');
   * } else {
   *   console.log('This is a standard emoji that can be modified');
   * }
   * ```
   */
  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  /**
   * Indicates whether this emoji is animated.
   *
   * Animated emoji have a .gif format and play their animation when used.
   * They use the format `<a:name:id>` in messages.
   *
   * @returns True if the emoji is animated, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.animated) {
   *   console.log('This emoji is animated (GIF)');
   * } else {
   *   console.log('This emoji is static (PNG)');
   * }
   * ```
   */
  get animated(): boolean {
    return Boolean(this.data.animated);
  }

  /**
   * Indicates whether this emoji can be used.
   *
   * May be false due to loss of Server Boosts if it's a guild emoji.
   * When a guild loses the number of boosts required for certain emoji slots,
   * those emoji become unavailable but are not deleted.
   *
   * @returns True if the emoji is available for use, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.available) {
   *   console.log('This emoji is available for use');
   * } else {
   *   console.log('This emoji is not available (guild may have lost boosts)');
   * }
   * ```
   */
  get available(): boolean {
    return Boolean(this.data.available);
  }

  /**
   * Gets the Date object representing when this emoji was created.
   *
   * This is calculated from the emoji's ID, which contains a timestamp.
   * This will only work for custom emojis with an ID.
   *
   * @returns The Date when this emoji was created, or null for standard emoji
   *
   * @example
   * ```typescript
   * const createdAt = emoji.createdAt;
   * if (createdAt) {
   *   console.log(`Emoji created on: ${createdAt.toLocaleDateString()}`);
   * }
   * ```
   */
  get createdAt(): Date | null {
    if (!this.id) {
      return null;
    }
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this emoji was created.
   *
   * This is useful for comparing emoji ages or for formatting with
   * custom date libraries.
   *
   * @returns The creation timestamp in milliseconds, or null for standard emoji
   *
   * @example
   * ```typescript
   * const timestamp = emoji.createdTimestamp;
   * if (timestamp) {
   *   const ageMs = Date.now() - timestamp;
   *   const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
   *   console.log(`Emoji age: ${ageDays} days`);
   * }
   * ```
   */
  get createdTimestamp(): number | null {
    return this.createdAt?.getTime() ?? null;
  }

  /**
   * Checks if this emoji is a standard Unicode emoji.
   *
   * Standard emoji are Unicode characters like 🔥 or 👍,
   * as opposed to custom Discord emoji.
   *
   * @returns True if this is a standard emoji, false if it's a custom emoji
   *
   * @example
   * ```typescript
   * if (emoji.isUnicode) {
   *   console.log('This is a standard Unicode emoji');
   * } else {
   *   console.log('This is a custom Discord emoji');
   * }
   * ```
   */
  get isUnicode(): boolean {
    return this.id === null;
  }

  /**
   * Checks if this emoji is a custom emoji.
   *
   * Custom emoji are created by Discord users or applications,
   * as opposed to standard Unicode emoji.
   *
   * @returns True if this is a custom emoji, false if it's a standard emoji
   *
   * @example
   * ```typescript
   * if (emoji.isCustom) {
   *   console.log('This is a custom Discord emoji');
   * } else {
   *   console.log('This is a standard Unicode emoji');
   * }
   * ```
   */
  get isCustom(): boolean {
    return this.id !== null;
  }

  /**
   * Checks if this emoji is animated.
   *
   * Animated emoji have a .gif format and play their animation when used.
   *
   * @returns True if the emoji is animated, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.isAnimated) {
   *   console.log('This emoji is animated (GIF)');
   * } else {
   *   console.log('This emoji is static');
   * }
   * ```
   */
  get isAnimated(): boolean {
    return this.animated;
  }

  /**
   * Checks if this emoji is managed by an integration.
   *
   * Managed emoji cannot be modified or deleted by regular users.
   *
   * @returns True if the emoji is managed, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.isManaged) {
   *   console.log('This emoji is managed by an integration');
   * } else {
   *   console.log('This is a user-created emoji');
   * }
   * ```
   */
  get isManaged(): boolean {
    return this.managed;
  }

  /**
   * Checks if this emoji is available for use.
   *
   * Emoji can become unavailable if a guild loses server boosts.
   *
   * @returns True if the emoji is available, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.isAvailable) {
   *   console.log('This emoji can be used');
   * } else {
   *   console.log('This emoji is unavailable');
   * }
   * ```
   */
  get isAvailable(): boolean {
    return this.available;
  }

  /**
   * Checks if this emoji is restricted to specific roles.
   *
   * When restricted, only members with at least one of the specified roles
   * can use the emoji.
   *
   * @returns True if the emoji has role restrictions, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.isRoleRestricted) {
   *   console.log(`This emoji is restricted to ${emoji.roles?.length} roles`);
   * } else {
   *   console.log('This emoji can be used by everyone in the guild');
   * }
   * ```
   */
  get isRoleRestricted(): boolean {
    return Boolean(this.roles && this.roles.length > 0);
  }

  /**
   * Checks if this emoji belongs to a guild (server).
   *
   * Guild emoji are associated with a specific server,
   * as opposed to application-owned emoji.
   *
   * @returns True if this is a guild emoji, false otherwise
   *
   * @example
   * ```typescript
   * if (emoji.isGuildEmoji) {
   *   console.log(`This emoji belongs to guild: ${emoji.guildId}`);
   * } else {
   *   console.log('This is not a guild emoji');
   * }
   * ```
   */
  get isGuildEmoji(): boolean {
    return Boolean(this.guildId) && this.isCustom;
  }

  /**
   * Gets the URL for this emoji with specified options.
   *
   * This method generates a proper CDN URL for the emoji,
   * allowing customization of size and format.
   * Only works for custom emoji, not for standard Unicode emoji.
   *
   * @param options - Options for the emoji image (size, format, etc.)
   * @returns The URL for the emoji, or null for standard emoji
   *
   * @example
   * ```typescript
   * // Get default URL
   * const url = emoji.getURL();
   *
   * // Get a larger size
   * const largeUrl = emoji.getURL({ size: 128 });
   *
   * // Force GIF format for animated emoji
   * const animatedUrl = emoji.getURL({ format: 'gif' });
   *
   * console.log(`Emoji URL: ${url}`);
   * ```
   */
  getUrl(options: z.input<typeof AnimatedImageOptions> = {}): EmojiUrl | null {
    if (!this.id) {
      return null;
    }

    return Cdn.emoji(this.id, {
      ...options,
      animated: this.animated,
    });
  }

  /**
   * Gets the Markdown for this emoji to be used in messages.
   *
   * This method returns the formatted string that will render
   * the emoji when sent in a Discord message.
   *
   * @returns The emoji formatted for use in messages
   *
   * @example
   * ```typescript
   * const formatted = emoji.toString();
   * await channel.send(`Check out this emoji: ${formatted}`);
   * ```
   */
  override toString(): FormattedCustomEmoji | string {
    if (!this.id) {
      return this.name ?? "";
    }

    if (!this.name) {
      return this.id;
    }

    return formatCustomEmoji(this.name, this.id, this.animated);
  }

  /**
   * Updates this emoji with new information.
   *
   * This method allows modifying the name or role restrictions
   * of a guild emoji.
   *
   * @param options - The properties to update
   * @param reason - Audit log reason for the update
   * @returns A promise resolving to the updated Emoji
   * @throws Error if the emoji couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   // Update emoji name
   *   const updated = await emoji.update({
   *     name: 'new_name'
   *   });
   *
   *   console.log(`Emoji renamed to: ${updated.name}`);
   *
   *   // Update role restrictions
   *   const restricted = await emoji.update({
   *     roles: ['123456789012345678', '234567890123456789']
   *   }, 'Restricting emoji to premium roles');
   *
   *   console.log('Emoji role restrictions updated');
   * } catch (error) {
   *   console.error('Failed to update emoji:', error);
   * }
   * ```
   */
  async edit(
    options: CamelCasedProperties<ModifyGuildEmojiSchema>,
    reason?: string,
  ): Promise<Emoji> {
    if (!this.guildId) {
      throw new Error("Cannot update a non-guild emoji");
    }

    const updatedData = await this.client.rest.emojis.updateGuildEmoji(
      this.guildId,
      this.id as Snowflake,
      toSnakeCaseProperties(options),
      reason,
    );

    // Add guild_id to maintain consistency
    const guildBasedData = { ...updatedData, guild_id: this.guildId };
    return new Emoji(this.client, guildBasedData as GuildBased<EmojiEntity>);
  }

  /**
   * Updates an application emoji.
   *
   * This method allows modifying the name of an application-owned emoji.
   *
   * @param applicationId - The ID of the application that owns the emoji
   * @param options - The properties to update (only name can be modified)
   * @param reason - Audit log reason for the update
   * @returns A promise resolving to the updated Emoji
   * @throws Error if the emoji couldn't be updated
   *
   * @example
   * ```typescript
   * try {
   *   // Update application emoji name
   *   const updated = await emoji.updateApplicationEmoji(
   *     '123456789012345678',
   *     { name: 'new_app_emoji' }
   *   );
   *
   *   console.log(`Application emoji renamed to: ${updated.name}`);
   * } catch (error) {
   *   console.error('Failed to update application emoji:', error);
   * }
   * ```
   */
  async editApplicationEmoji(
    applicationId: Snowflake,
    options: ModifyApplicationEmojiSchema,
    reason?: string,
  ): Promise<Emoji> {
    if (!this.id) {
      throw new Error("Cannot update a standard emoji");
    }

    const updatedData = await this.client.rest.emojis.updateApplicationEmoji(
      applicationId,
      this.id,
      options,
      reason,
    );

    return new Emoji(this.client, updatedData as GuildBased<EmojiEntity>);
  }

  /**
   * Deletes this emoji from its guild.
   *
   * This method permanently removes a custom emoji from the guild.
   *
   * @param reason - Audit log reason for the deletion
   * @returns A promise that resolves when the emoji is deleted
   * @throws Error if the emoji couldn't be deleted
   *
   * @example
   * ```typescript
   * try {
   *   await emoji.delete('No longer needed');
   *   console.log('Emoji deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete emoji:', error);
   * }
   * ```
   *
   * @remarks
   * - For emoji created by the current user, requires CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emoji, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Once deleted, an emoji cannot be recovered
   */
  async delete(reason?: string): Promise<void> {
    if (!(this.guildId && this.id)) {
      throw new Error("Cannot delete a non-guild emoji");
    }

    await this.client.rest.emojis.deleteGuildEmoji(
      this.guildId,
      this.id,
      reason,
    );
  }

  /**
   * Deletes an application emoji.
   *
   * This method permanently removes a custom emoji owned by an application.
   *
   * @param applicationId - The ID of the application that owns the emoji
   * @param reason - Audit log reason for the deletion
   * @returns A promise that resolves when the emoji is deleted
   * @throws Error if the emoji couldn't be deleted
   *
   * @example
   * ```typescript
   * try {
   *   await emoji.deleteApplicationEmoji('123456789012345678', 'No longer needed');
   *   console.log('Application emoji deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete application emoji:', error);
   * }
   * ```
   */
  async deleteApplicationEmoji(
    applicationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot delete a standard emoji");
    }

    await this.client.rest.emojis.deleteApplicationEmoji(
      applicationId,
      this.id,
      reason,
    );
  }

  /**
   * Refreshes this emoji's data from the API.
   *
   * This method fetches the latest emoji data to ensure all properties
   * are up to date.
   *
   * @returns A promise resolving to the refreshed Emoji
   * @throws Error if the emoji couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const refreshed = await emoji.refresh();
   *   console.log('Emoji data refreshed from the API');
   * } catch (error) {
   *   console.error('Failed to refresh emoji data:', error);
   * }
   * ```
   */
  async refresh(): Promise<Emoji> {
    if (!(this.guildId && this.id)) {
      throw new Error("Cannot refresh a non-guild emoji");
    }

    const data = await this.client.rest.emojis.fetchGuildEmoji(
      this.guildId,
      this.id,
    );

    // Add guild_id to maintain consistency
    const guildBasedData = { ...data, guild_id: this.guildId };
    return new Emoji(this.client, guildBasedData as GuildBased<EmojiEntity>);
  }

  /**
   * Refreshes an application emoji's data from the API.
   *
   * This method fetches the latest emoji data for an application-owned emoji.
   *
   * @param applicationId - The ID of the application that owns the emoji
   * @returns A promise resolving to the refreshed Emoji
   * @throws Error if the emoji couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const refreshed = await emoji.refreshApplicationEmoji('123456789012345678');
   *   console.log('Application emoji data refreshed from the API');
   * } catch (error) {
   *   console.error('Failed to refresh application emoji data:', error);
   * }
   * ```
   */
  async refreshApplicationEmoji(applicationId: Snowflake): Promise<Emoji> {
    if (!this.id) {
      throw new Error("Cannot refresh a standard emoji");
    }

    const data = await this.client.rest.emojis.fetchApplicationEmoji(
      applicationId,
      this.id,
    );

    return new Emoji(this.client, data as GuildBased<EmojiEntity>);
  }

  /**
   * Formats this emoji for use as a reaction on a message.
   *
   * This method returns the format needed for the reaction API,
   * which differs from the message format.
   *
   * @returns The emoji formatted for use as a reaction
   *
   * @example
   * ```typescript
   * const reaction = emoji.toReactionString();
   * await message.react(reaction);
   * ```
   */
  toReactionString(): string {
    if (!this.id) {
      // Standard Unicode emoji
      return this.name ?? "";
    }

    // Custom emoji
    return `${this.name}:${this.id}`;
  }

  /**
   * Creates a markdown-formatted string that links to this emoji.
   *
   * This method generates a markdown link that displays the emoji
   * and links to the specified URL.
   *
   * @param url - The URL to link to
   * @returns A markdown link with the emoji as the display text
   *
   * @example
   * ```typescript
   * // Create a link using the emoji
   * const link = emoji.toLink('https://example.com');
   * await channel.send(link);
   *
   * // Will display as an emoji that links to the URL
   * ```
   */
  toLink(url: string): Link {
    return link(this.toString(), url);
  }
}
