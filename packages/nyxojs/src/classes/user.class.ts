import {
  type ApplicationRoleConnectionEntity,
  type AvatarDecorationDataEntity,
  BitField,
  type ConnectionEntity,
  type ConnectionService,
  type FormattedUser,
  type GuildMemberEntity,
  type Locale,
  type PremiumType,
  type Snowflake,
  type UserEntity,
  type UserFlags,
  formatUser,
  isValidUsername,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import {
  type AnimatedImageOptions,
  Cdn,
  type CreateGroupDmSchema,
  type DefaultUserAvatarUrl,
  type GetCurrentUserGuildsQuerySchema,
  type ModifyCurrentUserSchema,
  type UpdateCurrentUserApplicationRoleConnectionSchema,
  type UserAvatarUrl,
  type UserBannerUrl,
} from "@nyxojs/rest";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import type { z } from "zod";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
  toSnakeCaseProperties,
} from "../utils/index.js";
import { DmChannel } from "./channel.class.js";
import { Guild, GuildMember } from "./guild.class.js";
import type { Message } from "./message.class.js";

/**
 * Represents a Discord user, providing methods to interact with and retrieve user data.
 *
 * The User class serves as a comprehensive wrapper around Discord's user API, offering:
 * - Access to user profile information (username, avatar, banner, etc.)
 * - Methods to interact with user connections and relationships
 * - Guild membership management and information
 * - Direct message functionality and conversation management
 * - Application role connection handling
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @remarks
 * Users in Discord are generally considered the base entity. Users can span across
 * the entire platform, be members of guilds, participate in text and voice chat, and more.
 *
 * Users are separated by a distinction of "bot" vs "normal." Bot users are automated
 * users that are "owned" by another user and don't have a limitation on the number
 * of guilds they can join. Regular users are limited to 200 guilds.
 *
 * @example
 * ```typescript
 * // Fetching a user by ID
 * const user = await client.fetchUser('123456789012345678');
 * console.log(`Username: ${user.username}`);
 * console.log(`Avatar URL: ${user.getDisplayAvatarUrl()}`);
 *
 * // Creating a DM channel with the user
 * const dmChannel = await user.createDmChannel();
 * await dmChannel.send('Hello there!');
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
@Cacheable("users")
export class User
  extends BaseClass<UserEntity>
  implements Enforce<CamelCasedProperties<UserEntity>>
{
  /**
   * Gets the user's unique identifier (Snowflake).
   *
   * This ID is permanent and will not change for the lifetime of the user account.
   * It can be used for API operations, mentions, and persistent references.
   *
   * @returns The user's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * const userId = user.id;
   * console.log(`User ID: ${userId}`);
   * ```
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Gets the user's username.
   *
   * Usernames are not unique across Discord (unlike the combination of username and discriminator).
   * They must be between 2 and 32 characters and follow Discord's username requirements.
   *
   * @returns The user's username
   *
   * @example
   * ```typescript
   * console.log(`Username: ${user.username}`);
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#usernames-and-nicknames}
   */
  get username(): string {
    return this.data.username;
  }

  /**
   * Gets the user's discriminator (the four digits after the #).
   *
   * The discriminator is a 4-digit number (displayed as a string) that allows Discord
   * to differentiate between users with the same username.
   *
   * @remarks
   * Discord is gradually moving away from the discriminator system in favor of unique
   * usernames. New accounts may have a discriminator of "0".
   *
   * @returns The user's discriminator as a string
   *
   * @example
   * ```typescript
   * console.log(`Discriminator: #${user.discriminator}`);
   * ```
   */
  get discriminator(): string {
    return this.data.discriminator;
  }

  /**
   * Gets the user's global display name.
   *
   * This is the user's chosen display name that appears across Discord.
   * For bots, this is typically the application name.
   *
   * @returns The user's global display name, or null if not set
   *
   * @example
   * ```typescript
   * console.log(`Global Name: ${user.globalName ?? user.username}`);
   * ```
   */
  get globalName(): string | null {
    return this.data.global_name;
  }

  /**
   * Gets the user's avatar hash.
   *
   * This hash is used to construct the URL for the user's avatar image.
   * Use `getAvatarUrl()` or `getDisplayAvatarUrl()` methods to get the full URL.
   *
   * @returns The user's avatar hash, or null if using the default avatar
   *
   * @example
   * ```typescript
   * if (user.avatar) {
   *   console.log('User has a custom avatar');
   * } else {
   *   console.log('User has the default avatar');
   * }
   * ```
   */
  get avatar(): string | null {
    return this.data.avatar;
  }

  /**
   * Indicates whether the user is a bot account.
   *
   * Bot accounts have different rate limits, permission requirements,
   * and behavior compared to normal user accounts.
   *
   * @returns True if the user is a bot, false otherwise
   *
   * @example
   * ```typescript
   * if (user.bot) {
   *   console.log('This user is a bot');
   * }
   * ```
   */
  get bot(): boolean {
    return Boolean(this.data.bot);
  }

  /**
   * Indicates whether the user is an Official Discord System user.
   *
   * System users are special accounts used by Discord for system messages
   * and official communications.
   *
   * @returns True if the user is a system account, false otherwise
   *
   * @example
   * ```typescript
   * if (user.system) {
   *   console.log('This is a Discord system user');
   * }
   * ```
   */
  get system(): boolean {
    return Boolean(this.data.system);
  }

  /**
   * Indicates whether the user has two-factor authentication enabled.
   *
   * When MFA is enabled, additional verification is required for sensitive actions.
   *
   * @returns True if the user has MFA enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (user.mfaEnabled) {
   *   console.log('This user has two-factor authentication enabled');
   * }
   * ```
   */
  get mfaEnabled(): boolean {
    return Boolean(this.data.mfa_enabled);
  }

  /**
   * Gets the user's banner hash.
   *
   * This hash is used to construct the URL for the user's profile banner.
   * Use `getBannerUrl()` method to get the full URL.
   *
   * @remarks
   * Banners are typically only available for users with Nitro subscriptions.
   *
   * @returns The user's banner hash, or null if no banner is set
   *
   * @example
   * ```typescript
   * if (user.banner) {
   *   console.log('User has a profile banner');
   * } else {
   *   console.log('User does not have a profile banner');
   * }
   * ```
   */
  get banner(): string | null | undefined {
    return this.data.banner;
  }

  /**
   * Gets the user's accent color as an integer.
   *
   * This color is used as a fallback when the user has no banner set.
   * The value is an integer representation of a hexadecimal color code.
   *
   * @returns The accent color as an integer, or null if not set
   *
   * @example
   * ```typescript
   * if (user.accentColor) {
   *   // Convert to hex color string
   *   const hexColor = `#${user.accentColor.toString(16).padStart(6, '0')}`;
   *   console.log(`User's accent color: ${hexColor}`);
   * }
   * ```
   */
  get accentColor(): number | null | undefined {
    return this.data.accent_color;
  }

  /**
   * Gets the user's chosen locale (language setting).
   *
   * This controls the language of Discord's user interface for this user.
   *
   * @returns The user's locale, or null if not available
   *
   * @example
   * ```typescript
   * if (user.locale) {
   *   console.log(`User's language setting: ${user.locale}`);
   * }
   * ```
   */
  get locale(): Locale | null | undefined {
    return this.data.locale;
  }

  /**
   * Indicates whether the user's email has been verified.
   *
   * Requires the 'email' OAuth2 scope to access.
   *
   * @returns True if the email is verified, false otherwise
   *
   * @example
   * ```typescript
   * if (user.verified) {
   *   console.log('User has verified their email address');
   * }
   * ```
   */
  get verified(): boolean {
    return Boolean(this.data.verified);
  }

  /**
   * Gets the user's email address.
   *
   * Requires the 'email' OAuth2 scope to access.
   *
   * @returns The user's email address, or null if not available
   *
   * @example
   * ```typescript
   * const email = user.email;
   * if (email) {
   *   console.log(`User's email: ${email}`);
   * }
   * ```
   */
  get email(): string | null | undefined {
    return this.data.email;
  }

  /**
   * Gets the flags on the user's account as a BitField.
   *
   * These flags represent account features, badges, and participation
   * in various Discord programs.
   *
   * @returns A BitField of user flags
   *
   * @example
   * ```typescript
   * import { UserFlags } from '@nyxojs/core';
   *
   * if (user.flags.has(UserFlags.VerifiedDeveloper)) {
   *   console.log('This user is an early verified bot developer');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  get flags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.flags ?? 0n);
  }

  /**
   * Gets the user's Nitro subscription level.
   *
   * Different Nitro tiers provide different benefits to users.
   *
   * @returns The premium type, or null if the user doesn't have Nitro
   *
   * @example
   * ```typescript
   * import { PremiumType } from '@nyxojs/core';
   *
   * switch (user.premiumType) {
   *   case PremiumType.None:
   *     console.log('User does not have Nitro');
   *     break;
   *   case PremiumType.NitroClassic:
   *     console.log('User has Nitro Classic');
   *     break;
   *   case PremiumType.Nitro:
   *     console.log('User has Nitro');
   *     break;
   *   case PremiumType.NitroBasic:
   *     console.log('User has Nitro Basic');
   *     break;
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
   */
  get premiumType(): PremiumType | undefined {
    return this.data.premium_type;
  }

  /**
   * Gets the public flags on the user's account as a BitField.
   *
   * These are flags that are publicly visible to other users,
   * representing badges and account features.
   *
   * @returns A BitField of public user flags
   *
   * @example
   * ```typescript
   * import { UserFlags } from '@nyxojs/core';
   *
   * if (user.publicFlags.has(UserFlags.ActiveDeveloper)) {
   *   console.log('This user has the Active Developer badge');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  get publicFlags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.public_flags ?? 0n);
  }

  /**
   * Gets the user's avatar decoration data.
   *
   * Avatar decorations are special frames that can appear around a user's avatar.
   * This method returns the data in camelCase format for easier access.
   *
   * @returns The avatar decoration data in camelCase format, or null if not set
   *
   * @example
   * ```typescript
   * if (user.avatarDecorationData) {
   *   console.log(`User has an avatar decoration: ${user.avatarDecorationData.asset}`);
   * }
   * ```
   */
  get avatarDecorationData(): CamelCasedProperties<AvatarDecorationDataEntity> | null {
    if (!this.data.avatar_decoration_data) {
      return null;
    }

    return toCamelCasedProperties(this.data.avatar_decoration_data);
  }

  /**
   * Gets the user's tag, which is a combination of username and discriminator.
   *
   * The tag is in the format `username#discriminator` and provides a unique
   * identifier for the user across Discord.
   *
   * @remarks
   * With the new Discord username system, users migrating to the new system
   * will have a discriminator of "0", making this less useful for these users.
   *
   * @returns The user's tag in the format `username#discriminator`
   *
   * @example
   * ```typescript
   * console.log(`User's tag: ${user.tag}`);
   * ```
   */
  get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * Gets the user's display name, prioritizing their global name if available.
   *
   * This is the name that should typically be shown in user interfaces
   * when referencing this user.
   *
   * @returns The user's global name if set, otherwise their username
   *
   * @example
   * ```typescript
   * console.log(`Display name: ${user.displayName}`);
   * ```
   */
  get displayName(): string {
    return this.globalName ?? this.username;
  }

  /**
   * Gets the Date object representing when this user account was created.
   *
   * This is calculated from the user's ID, which contains a timestamp.
   *
   * @returns The Date when this user was created
   *
   * @example
   * ```typescript
   * console.log(`Account created: ${user.createdAt.toLocaleDateString()}`);
   * ```
   */
  get createdAt(): Date {
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this user account was created.
   *
   * This is useful for comparing account ages or for formatting with
   * custom date libraries.
   *
   * @returns The creation timestamp in milliseconds
   *
   * @example
   * ```typescript
   * const accountAgeMs = Date.now() - user.createdTimestamp;
   * const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
   * console.log(`Account age: ${accountAgeDays} days`);
   * ```
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Gets the URL for the user's avatar decoration.
   *
   * Avatar decorations are special frames that can appear around a user's avatar.
   *
   * @returns The URL for the avatar decoration, or null if the user doesn't have one
   *
   * @example
   * ```typescript
   * if (user.avatarDecorationUrl) {
   *   console.log(`Avatar decoration URL: ${user.avatarDecorationUrl}`);
   * }
   * ```
   */
  get avatarDecorationUrl(): string | null {
    if (!this.avatarDecorationData) {
      return null;
    }
    return Cdn.avatarDecoration(this.avatarDecorationData.asset);
  }

  /**
   * Shorthand for checking if this user is a bot account.
   *
   * @returns True if the user is a bot, false otherwise
   *
   * @example
   * ```typescript
   * if (user.isBot) {
   *   console.log('This user is a bot');
   * }
   * ```
   */
  get isBot(): boolean {
    return this.bot;
  }

  /**
   * Shorthand for checking if this user is a system account.
   *
   * @returns True if the user is a system account, false otherwise
   *
   * @example
   * ```typescript
   * if (user.isSystem) {
   *   console.log('This is a Discord system user');
   * }
   * ```
   */
  get isSystem(): boolean {
    return this.system;
  }

  /**
   * Shorthand for checking if this user's email is verified.
   *
   * @returns True if the email is verified, false otherwise
   *
   * @example
   * ```typescript
   * if (user.isVerified) {
   *   console.log('Email is verified');
   * }
   * ```
   */
  get isVerified(): boolean {
    return this.verified;
  }

  /**
   * Checks if this user has any Nitro subscription.
   *
   * @returns True if the user has any Nitro subscription, false otherwise
   *
   * @example
   * ```typescript
   * if (user.isPremium) {
   *   console.log('This user has Nitro');
   * }
   * ```
   */
  get isPremium(): boolean {
    return this.premiumType !== null && this.premiumType !== 0;
  }

  /**
   * Checks if this User instance represents the current authenticated user.
   *
   * This is useful for determining if operations that require self-authorization
   * can be performed.
   *
   * @returns True if this user is the current authenticated user, false otherwise
   *
   * @example
   * ```typescript
   * if (user.isSelf) {
   *   console.log('This is the current authenticated user');
   * } else {
   *   console.log('This is another user');
   * }
   * ```
   */
  get isSelf(): boolean {
    return this.id === this.client.user.id;
  }

  /**
   * Gets the user's account age in days.
   *
   * @returns The number of days since the user account was created
   *
   * @example
   * ```typescript
   * console.log(`Account age: ${user.accountAge} days`);
   * ```
   */
  get accountAge(): number {
    return Math.floor(
      (Date.now() - this.createdTimestamp) / (1000 * 60 * 60 * 24),
    );
  }

  /**
   * Gets the URL for the user's avatar with specified options.
   *
   * If the user doesn't have a custom avatar, this returns null.
   * Use `getDisplayAvatarUrl()` to always get a valid avatar URL.
   *
   * @param options - Options for the avatar image (size, format, etc.)
   * @returns The URL for the user's avatar, or null if they use the default avatar
   *
   * @example
   * ```typescript
   * // Get a 128x128 avatar
   * const avatarUrl = user.getAvatarUrl({ size: 128 });
   *
   * // Get a WebP format avatar
   * const webpAvatar = user.getAvatarUrl({ format: 'webp' });
   * ```
   *
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl | null {
    if (!this.avatar) {
      return null;
    }
    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * Gets the URL for the user's default avatar.
   *
   * This is the avatar assigned by Discord when the user hasn't set a custom one.
   *
   * @returns The URL for the default avatar
   *
   * @example
   * ```typescript
   * const defaultAvatarUrl = user.getDefaultAvatarUrl();
   * console.log(`Default avatar: ${defaultAvatarUrl}`);
   * ```
   */
  getDefaultAvatarUrl(): DefaultUserAvatarUrl {
    if (this.discriminator === "0") {
      return Cdn.defaultUserAvatarSystem(this.id);
    }
    return Cdn.defaultUserAvatar(this.discriminator);
  }

  /**
   * Gets the display avatar URL, either the user's custom avatar or their default avatar.
   *
   * This method always returns a valid avatar URL, prioritizing the custom avatar
   * if available.
   *
   * @param options - Options for the avatar image (size, format, etc.)
   * @returns The URL for the user's display avatar
   *
   * @example
   * ```typescript
   * const avatarUrl = user.getDisplayAvatarUrl({ size: 256 });
   * console.log(`User avatar: ${avatarUrl}`);
   * ```
   *
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getDisplayAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl | DefaultUserAvatarUrl {
    return this.getAvatarUrl(options) ?? this.getDefaultAvatarUrl();
  }

  /**
   * Gets the URL for the user's profile banner with specified options.
   *
   * @param options - Options for the banner image (size, format, etc.)
   * @returns The URL for the user's banner, or null if they don't have one
   *
   * @example
   * ```typescript
   * const bannerUrl = user.getBannerUrl({ size: 600 });
   * if (bannerUrl) {
   *   console.log(`User banner: ${bannerUrl}`);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getBannerUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserBannerUrl | null {
    if (!this.banner) {
      return null;
    }
    return Cdn.userBanner(this.id, this.banner, options);
  }

  /**
   * Gets the hex color code representation of the user's accent color.
   *
   * @param withHash - Whether to include the # prefix
   * @returns The hex color code, or null if not set
   *
   * @example
   * ```typescript
   * const accentColorHex = user.getAccentColorHex();
   * if (accentColorHex) {
   *   console.log(`User's accent color: ${accentColorHex}`);
   * }
   * ```
   */
  getAccentColorHex(withHash = true): string | null {
    if (!this.accentColor) {
      return null;
    }

    const hex = this.accentColor.toString(16).padStart(6, "0");
    return withHash ? `#${hex}` : hex;
  }

  /**
   * Fetches a user by their ID.
   *
   * This method retrieves information about any user on Discord by their ID,
   * including their username, avatar, and discriminator.
   *
   * @param userId - The ID of the user to fetch
   * @returns A promise resolving to the User instance
   * @throws Error if the user ID is missing or the user couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const otherUser = await user.fetchUser('123456789012345678');
   *   console.log(`Fetched user: $otherUser.tag`);
   * } catch (error) {
   *   console.error('Failed to fetch user:', error);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  async fetchUser(userId: Snowflake): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await this.client.rest.users.fetchUser(userId);
    return new User(this.client, user);
  }

  /**
   * Fetches the user's external account connections.
   *
   * This method retrieves information about the current user's connected
   * third-party accounts, such as Twitch, YouTube, or Steam.
   *
   * @returns A promise resolving to an array of connection entities in camelCase format
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   const connections = await client.user.fetchConnections();
   *   console.log(`Found ${connections.length} account connections`);
   *
   *   for (const connection of connections) {
   *     console.log(`${connection.type}: ${connection.name}`);
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch connections:', error);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  async fetchConnections(): Promise<
    CamelCasedPropertiesDeep<ConnectionEntity>[]
  > {
    if (!this.isSelf) {
      throw new Error("You can only fetch connections for yourself");
    }

    const connections =
      await this.client.rest.users.fetchCurrentUserConnections();
    return connections.map((connection) =>
      toCamelCasedPropertiesDeep(connection),
    );
  }

  /**
   * Creates or returns an existing DM channel with this user.
   *
   * This method establishes a direct message channel between the current user and
   * this user, or returns an existing DM channel if one already exists.
   *
   * @returns A promise resolving to the DM channel
   * @throws Error if the DM cannot be created
   *
   * @example
   * ```typescript
   * try {
   *   const dmChannel = await user.createDmChannel();
   *   console.log(`Created DM channel with ID: ${dmChannel.id}`);
   *
   *   // Send a message in the DM
   *   await dmChannel.send('Hello there!');
   * } catch (error) {
   *   console.error('Failed to create DM channel:', error);
   * }
   * ```
   *
   * @remarks
   * Warning: You should not use this to DM everyone in a server about something.
   * DMs should generally be initiated by a user action. If you open a significant amount
   * of DMs too quickly, your bot may be rate limited or blocked from opening new ones.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  async createDmChannel(): Promise<DmChannel> {
    const channel = await this.client.rest.users.createDmChannel(this.id);
    return new DmChannel(this.client, channel);
  }

  /**
   * Sends a direct message to this user.
   *
   * This is a convenience method that creates a DM channel and sends a message
   * in a single call.
   *
   * @param content - The content of the message to send
   * @returns A promise resolving to the sent message
   * @throws Error if the DM cannot be created or the message cannot be sent
   *
   * @example
   * ```typescript
   * try {
   *   const message = await user.send('Hello! This is a direct message.');
   *   console.log(`Sent message with ID: ${message.id}`);
   * } catch (error) {
   *   console.error('Failed to send DM:', error);
   * }
   * ```
   *
   * @remarks
   * Same warning applies as with `createDmChannel()`. Use this method responsibly
   * to avoid being rate limited.
   */
  async send(content: string): Promise<Message> {
    const channel = await this.createDmChannel();
    return channel.send(content);
  }

  /**
   * Creates a new group DM channel with multiple users.
   *
   * This method establishes a group direct message conversation with multiple users,
   * requiring OAuth2 access tokens from those users.
   *
   * @param options - Options for creating the group DM
   * @returns A promise resolving to the group DM channel
   * @throws Error if this isn't the current authenticated user or options are invalid
   *
   * @example
   * ```typescript
   * try {
   *   const groupDm = await client.user.createGroupDmChannel({
   *     access_tokens: ['user1_token', 'user2_token'],
   *     nicks: {
   *       '123456789012345678': 'User One',
   *       '234567890123456789': 'User Two'
   *     }
   *   });
   *   console.log(`Created group DM with ID: ${groupDm.id}`);
   * } catch (error) {
   *   console.error('Failed to create group DM:', error);
   * }
   * ```
   *
   * @remarks
   * This endpoint was intended to be used with the now-deprecated GameBridge SDK.
   * It is limited to 10 active group DMs.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  async createGroupDmChannel(
    options: CamelCasedProperties<CreateGroupDmSchema>,
  ): Promise<DmChannel> {
    if (!this.isSelf) {
      throw new Error("You can only create group DMs as yourself");
    }

    const channel = await this.client.rest.users.createGroupDmChannel(
      toSnakeCaseProperties(options),
    );
    return new DmChannel(this.client, channel);
  }

  /**
   * Fetches the guilds (servers) the current user is a member of.
   *
   * This method retrieves information about the guilds that the current
   * user has joined, with optional pagination support.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of Guild objects
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   // Get up to 50 guilds after a specific guild ID
   *   const guilds = await client.user.fetchGuilds({
   *     after: '123456789012345678',
   *     limit: 50
   *   });
   *
   *   console.log(`User is in ${guilds.length} guilds`);
   *
   *   for (const guild of guilds) {
   *     console.log(`Guild: ${guild.name} (${guild.id})`);
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch guilds:', error);
   * }
   * ```
   *
   * @remarks
   * For OAuth2, this requires the `guilds` scope.
   * This endpoint returns 200 guilds by default, which is the maximum number
   * of guilds a non-bot user can join. Therefore, pagination is not needed
   * for integrations that need to get a list of the user's guilds.
   *
   * For bots in more than 200 guilds, pagination is necessary.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  async fetchGuilds(query?: GetCurrentUserGuildsQuerySchema): Promise<Guild[]> {
    if (!this.isSelf) {
      throw new Error("You can only fetch guilds for yourself");
    }

    const guilds = await this.client.rest.users.fetchCurrentUserGuilds(query);
    return guilds.map(
      (guild) => new Guild(this.client, guild as GuildCreateEntity),
    );
  }

  /**
   * Fetches this user's member information for a specific guild.
   *
   * This method retrieves detailed information about this user's membership
   * in a specific guild, including roles, nickname, and join date.
   *
   * @param guildId - The ID of the guild to get member data from
   * @returns A promise resolving to the GuildMember object
   * @throws Error if the user is not in the guild or you lack permissions
   *
   * @example
   * ```typescript
   * try {
   *   const member = await user.fetchGuildMember('123456789012345678');
   *
   *   console.log(`${user.tag} joined the server on: ${member.joinedAt.toLocaleDateString()}`);
   *   console.log(`Nickname: ${member.nickname ?? 'None'}`);
   *   console.log(`Roles: ${member.roles.cache.size}`);
   * } catch (error) {
   *   console.error('Failed to fetch guild member:', error);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  async fetchGuildMember(guildId: Snowflake): Promise<GuildMember> {
    if (this.isSelf) {
      const member =
        await this.client.rest.users.fetchCurrentUserGuildMember(guildId);
      return new GuildMember(
        this.client,
        member as GuildBased<GuildMemberEntity>,
      );
    }

    const member = await this.client.rest.guilds.fetchGuildMember(
      guildId,
      this.id,
    );
    return new GuildMember(
      this.client,
      member as GuildBased<GuildMemberEntity>,
    );
  }

  /**
   * Fetches the application role connection for this user.
   *
   * This method retrieves information about how this user's account is
   * connected to an application for the purpose of linked roles.
   *
   * @param applicationId - The ID of the application to get the role connection for
   * @returns A promise resolving to the application role connection entity
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   const roleConnection = await client.user.fetchApplicationRoleConnection('123456789012345678');
   *
   *   console.log(`Platform: ${roleConnection.platformName}`);
   *   console.log(`Username: ${roleConnection.platformUsername}`);
   *
   *   // Log metadata
   *   for (const [key, value] of Object.entries(roleConnection.metadata)) {
   *     console.log(`Metadata ${key}: ${value}`);
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch role connection:', error);
   * }
   * ```
   *
   * @remarks
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  async fetchApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<CamelCasedProperties<ApplicationRoleConnectionEntity>> {
    if (!this.isSelf) {
      throw new Error(
        "You can only fetch application role connections for yourself",
      );
    }

    const applicationRoleConnection =
      await this.client.rest.users.fetchApplicationRoleConnection(
        applicationId,
      );
    return toCamelCasedProperties(applicationRoleConnection);
  }

  /**
   * Updates the application role connection for this user.
   *
   * This method updates metadata about how this user's account is
   * connected to an application for the purpose of linked roles.
   *
   * @param applicationId - The ID of the application to update the role connection for
   * @param connection - The role connection data to update
   * @returns A promise resolving to the updated application role connection entity
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   const updatedConnection = await client.user.updateApplicationRoleConnection(
   *     '123456789012345678',
   *     {
   *       platformName: 'My Game',
   *       platformUsername: 'PlayerOne',
   *       metadata: {
   *         level: '42',
   *         rank: 'Gold'
   *       }
   *     }
   *   );
   *
   *   console.log('Updated role connection successfully');
   * } catch (error) {
   *   console.error('Failed to update role connection:', error);
   * }
   * ```
   *
   * @remarks
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  async updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: CamelCasedProperties<UpdateCurrentUserApplicationRoleConnectionSchema>,
  ): Promise<CamelCasedProperties<ApplicationRoleConnectionEntity>> {
    if (!this.isSelf) {
      throw new Error(
        "You can only update application role connections for yourself",
      );
    }

    const applicationRoleConnection =
      await this.client.rest.users.updateApplicationRoleConnection(
        applicationId,
        toSnakeCaseProperties(connection),
      );
    return toCamelCasedProperties(applicationRoleConnection);
  }

  /**
   * Leaves a guild.
   *
   * This method removes the current user from a guild they are a member of.
   * For bots, this is equivalent to the bot being kicked from the guild.
   *
   * @param guildId - The ID of the guild to leave
   * @returns A promise resolving to true if successful, false otherwise
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   const success = await client.user.leaveGuild('123456789012345678');
   *
   *   if (success) {
   *     console.log('Successfully left the guild');
   *   } else {
   *     console.log('Failed to leave the guild');
   *   }
   * } catch (error) {
   *   console.error('Error leaving guild:', error);
   * }
   * ```
   *
   * @remarks
   * Fires a Guild Delete Gateway event and a Guild Member Remove Gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  async leaveGuild(guildId: Snowflake): Promise<boolean> {
    if (!this.isSelf) {
      throw new Error("You can only leave guilds for yourself");
    }

    try {
      await this.client.rest.users.leaveGuild(guildId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates the current user's account settings.
   *
   * This method allows modifying various aspects of the current user's profile,
   * such as their username, avatar, and banner.
   *
   * @param options - Options for modifying the current user
   * @returns A promise resolving to the updated User instance
   * @throws Error if this isn't the current authenticated user or options are invalid
   *
   * @example
   * ```typescript
   * try {
   *   // Update username
   *   const updatedUser = await client.user.updateProfile({
   *     username: 'NewUsername'
   *   });
   *
   *   console.log(`Username updated to: ${updatedUser.username}`);
   *
   *   // Update avatar using a file
   *   const updatedUser2 = await client.user.updateProfile({
   *     avatar: await FileHandler.fromFile('path/to/avatar.png')
   *   });
   *
   *   console.log('Avatar updated successfully');
   * } catch (error) {
   *   console.error('Failed to update profile:', error);
   * }
   * ```
   *
   * @remarks
   * All parameters to this endpoint are optional.
   * Fires a User Update Gateway event when successful.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  async updateProfile(options: ModifyCurrentUserSchema): Promise<User> {
    if (!this.isSelf) {
      throw new Error("You can only update your own profile");
    }

    const updatedUserData =
      await this.client.rest.users.updateCurrentUser(options);
    return new User(this.client, updatedUserData);
  }

  /**
   * Formats this user as a mention string.
   *
   * This returns a string that, when sent in a message, will create a mention
   * that pings and highlights the user.
   *
   * @returns The formatted user mention
   *
   * @example
   * ```typescript
   * const mention = user.toString();
   * console.log(`User mention: ${mention}`);
   *
   * // For example, in a message:
   * await channel.send(`Hello ${user}!`); // Will mention the user
   * ```
   */
  override toString(): FormattedUser {
    return formatUser(this.id);
  }

  /**
   * Checks if this user has two-factor authentication enabled.
   *
   * @returns True if the user has MFA enabled, false otherwise
   *
   * @example
   * ```typescript
   * if (user.hasMfaEnabled()) {
   *   console.log('This user has two-factor authentication enabled');
   * }
   * ```
   */
  hasMfaEnabled(): boolean {
    return this.mfaEnabled;
  }

  /**
   * Checks if this user has a specific flag on their account.
   *
   * @param flag - The flag to check for
   * @returns True if the user has the flag, false otherwise
   *
   * @example
   * ```typescript
   * import { UserFlags } from '@nyxojs/core';
   *
   * if (user.hasFlag(UserFlags.Staff)) {
   *   console.log('This user is a Discord staff member');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  hasFlag(flag: UserFlags): boolean {
    return this.flags.has(flag);
  }

  /**
   * Checks if this user has a specific public flag on their account.
   *
   * @param flag - The public flag to check for
   * @returns True if the user has the public flag, false otherwise
   *
   * @example
   * ```typescript
   * import { UserFlags } from '@nyxojs/core';
   *
   * if (user.hasPublicFlag(UserFlags.BugHunterLevel2)) {
   *   console.log('This user is a Bug Hunter Level 2');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  hasPublicFlag(flag: UserFlags): boolean {
    return this.publicFlags.has(flag);
  }

  /**
   * Checks if this user has a banner set.
   *
   * @returns True if the user has a banner, false otherwise
   *
   * @example
   * ```typescript
   * if (user.hasBanner()) {
   *   console.log(`User banner URL: ${user.getBannerUrl()}`);
   * }
   * ```
   */
  hasBanner(): boolean {
    return this.banner !== null;
  }

  /**
   * Checks if this user has an avatar decoration.
   *
   * @returns True if the user has an avatar decoration, false otherwise
   *
   * @example
   * ```typescript
   * if (user.hasAvatarDecoration()) {
   *   console.log(`Avatar decoration URL: ${user.avatarDecorationUrl}`);
   * }
   * ```
   */
  hasAvatarDecoration(): boolean {
    return this.avatarDecorationData !== null;
  }

  /**
   * Checks if the user's username is valid according to Discord's requirements.
   *
   * This validates the username against Discord's rules, which include
   * length restrictions and forbidden substrings.
   *
   * @returns True if the username is valid, false otherwise
   *
   * @example
   * ```typescript
   * if (user.hasValidUsername()) {
   *   console.log('Username is valid');
   * } else {
   *   console.log('Username violates Discord requirements');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#usernames-and-nicknames}
   */
  hasValidUsername(): boolean {
    return isValidUsername(this.username);
  }

  /**
   * Refreshes this user's data from the API.
   *
   * @returns A promise resolving to the updated User instance
   * @throws Error if the user couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const refreshedUser = await user.refresh();
   *   console.log('User data refreshed successfully');
   * } catch (error) {
   *   console.error('Failed to refresh user data:', error);
   * }
   * ```
   */
  async refresh(): Promise<User> {
    const userData = await this.client.rest.users.fetchUser(this.id);
    return new User(this.client, userData);
  }

  /**
   * Checks if this user is a member of a specific guild.
   *
   * @param guildId - The ID of the guild to check
   * @returns A promise resolving to true if the user is a member, false otherwise
   *
   * @example
   * ```typescript
   * try {
   *   const isMember = await user.isMemberOf('123456789012345678');
   *
   *   if (isMember) {
   *     console.log('User is a member of this guild');
   *   } else {
   *     console.log('User is not a member of this guild');
   *   }
   * } catch (error) {
   *   console.error('Failed to check membership:', error);
   * }
   * ```
   */
  async isMemberOf(guildId: Snowflake): Promise<boolean> {
    try {
      await this.fetchGuildMember(guildId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets detailed information about this user's service connections.
   *
   * This is a convenience method that filters connections by type and provides
   * easier access to connection properties.
   *
   * @param type - Optional connection type to filter by
   * @returns A promise resolving to the filtered connections
   * @throws Error if this isn't the current authenticated user
   *
   * @example
   * ```typescript
   * try {
   *   // Get all Twitch connections
   *   const twitchConnections = await client.user.getServiceConnections('twitch');
   *
   *   for (const connection of twitchConnections) {
   *     console.log(`Twitch username: ${connection.name}`);
   *     console.log(`Verified: ${connection.verified ? 'Yes' : 'No'}`);
   *   }
   *
   *   // Get all connections
   *   const allConnections = await client.user.getServiceConnections();
   *   console.log(`Total connections: ${allConnections.length}`);
   * } catch (error) {
   *   console.error('Failed to get service connections:', error);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/user#connection-object}
   */
  async getServiceConnections(
    type?: ConnectionService,
  ): Promise<CamelCasedPropertiesDeep<ConnectionEntity>[]> {
    const connections = await this.fetchConnections();

    if (type) {
      return connections.filter((conn) => conn.type === type);
    }

    return connections;
  }
}
