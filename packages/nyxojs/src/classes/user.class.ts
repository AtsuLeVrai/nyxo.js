import {
  type ApplicationRoleConnectionEntity,
  BitField,
  type ConnectionEntity,
  type ConnectionService,
  type FormattedUser,
  formatUser,
  isValidUsername,
  type Snowflake,
  SnowflakeUtil,
  type UserEntity,
  type UserFlags,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import {
  type AnimatedImageOptions,
  type AvatarDecorationUrl,
  Cdn,
  type DefaultUserAvatarUrl,
  type GroupDmCreateOptions,
  type UserAvatarUrl,
  type UserBannerUrl,
  type UserGuildsFetchParams,
  type UserRoleConnectionUpdateOptions,
  type UserUpdateOptions,
} from "@nyxojs/rest";
import type { z } from "zod";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
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
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
@Cacheable<UserEntity>("users", (data) => data.id)
export class User
  extends BaseClass<UserEntity>
  implements Enforce<PropsToCamel<UserEntity>>
{
  /**
   * Gets the user's unique identifier (Snowflake).
   *
   * This ID is permanent and will not change for the lifetime of the user account.
   * It can be used for API operations, mentions, and persistent references.
   *
   * @returns The user's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the user's username.
   *
   * Usernames are not unique across Discord (unlike the combination of username and discriminator).
   * They must be between 2 and 32 characters and follow Discord's username requirements.
   *
   * @returns The user's username
   * @see {@link https://discord.com/developers/docs/resources/user#usernames-and-nicknames}
   */
  readonly username = this.rawData.username;

  /**
   * Gets the user's discriminator (the four digits after the #).
   *
   * The discriminator is a 4-digit number (displayed as a string) that allows Discord
   * to differentiate between users with the same username.
   *
   * @returns The user's discriminator as a string
   */
  readonly discriminator = this.rawData.discriminator;

  /**
   * Gets the user's global display name.
   *
   * This is the user's chosen display name that appears across Discord.
   * For bots, this is typically the application name.
   *
   * @returns The user's global display name, or null if not set
   */
  readonly globalName = this.rawData.global_name;

  /**
   * Gets the user's avatar hash.
   *
   * This hash is used to construct the URL for the user's avatar image.
   * Use `getAvatarUrl()` or `getDisplayAvatarUrl()` methods to get the full URL.
   *
   * @returns The user's avatar hash, or null if using the default avatar
   */
  readonly avatar = this.rawData.avatar;

  /**
   * Indicates whether the user is a bot account.
   *
   * Bot accounts have different rate limits, permission requirements,
   * and behavior compared to normal user accounts.
   *
   * @returns True if the user is a bot, false otherwise
   */
  readonly bot = Boolean(this.rawData.bot);

  /**
   * Indicates whether the user is an Official Discord System user.
   *
   * System users are special accounts used by Discord for system messages
   * and official communications.
   *
   * @returns True if the user is a system account, false otherwise
   */
  readonly system = Boolean(this.rawData.system);

  /**
   * Indicates whether the user has two-factor authentication enabled.
   *
   * When MFA is enabled, additional verification is required for sensitive actions.
   *
   * @returns True if the user has MFA enabled, false otherwise
   */
  readonly mfaEnabled = Boolean(this.rawData.mfa_enabled);

  /**
   * Gets the user's banner hash.
   *
   * This hash is used to construct the URL for the user's profile banner.
   * Use `getBannerUrl()` method to get the full URL.
   *
   * @returns The user's banner hash, or null if no banner is set
   */
  readonly banner = this.rawData.banner;

  /**
   * Gets the user's accent color as an integer.
   *
   * This color is used as a fallback when the user has no banner set.
   * The value is an integer representation of a hexadecimal color code.
   *
   * @returns The accent color as an integer, or null if not set
   */
  readonly accentColor = this.rawData.accent_color;

  /**
   * Gets the user's chosen locale (language setting).
   *
   * This controls the language of Discord's user interface for this user.
   *
   * @returns The user's locale, or null if not available
   */
  readonly locale = this.rawData.locale;

  /**
   * Indicates whether the user's email has been verified.
   *
   * Requires the 'email' OAuth2 scope to access.
   *
   * @returns True if the email is verified, false otherwise
   */
  readonly verified = Boolean(this.rawData.verified);

  /**
   * Gets the user's email address.
   *
   * Requires the 'email' OAuth2 scope to access.
   *
   * @returns The user's email address, or null if not available
   */
  readonly email = this.rawData.email;

  /**
   * Gets the flags on the user's account as a BitField.
   *
   * These flags represent account features, badges, and participation
   * in various Discord programs.
   *
   * @returns A BitField of user flags
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  readonly flags = new BitField<UserFlags>(this.rawData.flags ?? 0n);

  /**
   * Gets the user's Nitro subscription level.
   *
   * Different Nitro tiers provide different benefits to users.
   *
   * @returns The premium type, or null if the user doesn't have Nitro
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
   */
  readonly premiumType = this.rawData.premium_type;

  /**
   * Gets the public flags on the user's account as a BitField.
   *
   * These are flags that are publicly visible to other users,
   * representing badges and account features.
   *
   * @returns A BitField of public user flags
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  readonly publicFlags = new BitField<UserFlags>(
    this.rawData.public_flags ?? 0n,
  );

  /**
   * Gets the user's avatar decoration data.
   *
   * Avatar decorations are special frames that can appear around a user's avatar.
   * This method returns the data in camelCase format for easier access.
   *
   * @returns The avatar decoration data in camelCase format, or null if not set
   */
  readonly avatarDecorationData = this.rawData.avatar_decoration_data;

  /**
   * Gets the user's primary guild information for guild tags.
   *
   * Guild tags allow users to display a small badge next to their display name.
   * This includes the tag text and badge image.
   *
   * @returns The primary guild data, or null if not set
   */
  readonly primaryGuild = this.rawData.primary_guild;

  /**
   * Gets the user's connected third-party accounts.
   *
   * This includes services like Twitch, YouTube, and Steam that the user has linked
   * to their Discord account.
   *
   * @returns An array of connection entities in camelCase format
   */
  readonly collectibles = this.rawData.collectibles;

  /**
   * Gets the user's tag, which is a combination of username and discriminator.
   *
   * The tag is in the format `username#discriminator` and provides a unique
   * identifier for the user across Discord.
   *
   * @returns The user's tag in the format `username#discriminator`
   */
  get tag(): `${string}#${string}` {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * Gets the user's display name, prioritizing their global name if available.
   *
   * This is the name that should typically be shown in user interfaces
   * when referencing this user.
   *
   * @returns The user's global name if set, otherwise their username
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
   */
  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this user account was created.
   *
   * This is useful for comparing account ages or for formatting with
   * custom date libraries.
   *
   * @returns The creation timestamp in milliseconds
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
   */
  get avatarDecorationUrl(): AvatarDecorationUrl | null {
    return this.avatarDecorationData
      ? Cdn.avatarDecoration(this.avatarDecorationData.asset)
      : null;
  }

  /**
   * Checks if this user has any Nitro subscription.
   *
   * @returns True if the user has any Nitro subscription, false otherwise
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
   */
  get isSelf(): boolean {
    return this.id === this.client.user.id;
  }

  /**
   * Gets the user's account age in days.
   *
   * @returns The number of days since the user account was created
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
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl | null {
    return this.avatar ? Cdn.userAvatar(this.id, this.avatar, options) : null;
  }

  /**
   * Gets the URL for the user's default avatar.
   *
   * This is the avatar assigned by Discord when the user hasn't set a custom one.
   *
   * @returns The URL for the default avatar
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
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getBannerUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserBannerUrl | null {
    return this.banner ? Cdn.userBanner(this.id, this.banner, options) : null;
  }

  /**
   * Gets the hex color code representation of the user's accent color.
   *
   * @param withHash - Whether to include the # prefix
   * @returns The hex color code, or null if not set
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
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  fetchConnections(): Promise<ConnectionEntity[]> {
    if (!this.isSelf) {
      throw new Error("You can only fetch connections for yourself");
    }

    return this.client.rest.users.fetchCurrentConnections();
  }

  /**
   * Creates or returns an existing DM channel with this user.
   *
   * This method establishes a direct message channel between the current user and
   * this user, or returns an existing DM channel if one already exists.
   *
   * @returns A promise resolving to the DM channel
   * @throws Error if the DM cannot be created
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
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  async createGroupDmChannel(
    options: GroupDmCreateOptions,
  ): Promise<DmChannel> {
    if (!this.isSelf) {
      throw new Error("You can only create group DMs as yourself");
    }

    const channel = await this.client.rest.users.createGroupDmChannel(options);
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
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  async fetchGuilds(query?: UserGuildsFetchParams): Promise<Guild[]> {
    if (!this.isSelf) {
      throw new Error("You can only fetch guilds for yourself");
    }

    const guilds = await this.client.rest.users.fetchCurrentGuilds(query);
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
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  async fetchGuildMember(guildId: Snowflake): Promise<GuildMember> {
    if (this.isSelf) {
      const member =
        await this.client.rest.users.fetchCurrentUserGuildMember(guildId);
      return new GuildMember(this.client, { ...member, guild_id: guildId });
    }

    const member = await this.client.rest.guilds.fetchGuildMember(
      guildId,
      this.id,
    );
    return new GuildMember(this.client, { ...member, guild_id: guildId });
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
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  fetchApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    if (!this.isSelf) {
      throw new Error(
        "You can only fetch application role connections for yourself",
      );
    }

    return this.client.rest.users.fetchApplicationRoleConnection(applicationId);
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
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UserRoleConnectionUpdateOptions,
  ): Promise<ApplicationRoleConnectionEntity> {
    if (!this.isSelf) {
      throw new Error(
        "You can only update application role connections for yourself",
      );
    }

    return this.client.rest.users.updateApplicationRoleConnection(
      applicationId,
      connection,
    );
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
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  async updateProfile(options: UserUpdateOptions): Promise<User> {
    if (!this.isSelf) {
      throw new Error("You can only update your own profile");
    }

    const updatedUserData =
      await this.client.rest.users.updateCurrentUser(options);
    this.patch(updatedUserData);
    return this;
  }

  /**
   * Formats this user as a mention string.
   *
   * This returns a string that, when sent in a message, will create a mention
   * that pings and highlights the user.
   *
   * @returns The formatted user mention
   */
  override toString(): FormattedUser {
    return formatUser(this.id);
  }

  /**
   * Checks if this user has a specific flag on their account.
   *
   * @param flag - The flag to check for
   * @returns True if the user has the flag, false otherwise
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
   * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
   */
  hasPublicFlag(flag: UserFlags): boolean {
    return this.publicFlags.has(flag);
  }

  /**
   * Checks if this user has a banner set.
   *
   * @returns True if the user has a banner, false otherwise
   */
  hasBanner(): boolean {
    return this.banner !== null;
  }

  /**
   * Checks if this user has an avatar decoration.
   *
   * @returns True if the user has an avatar decoration, false otherwise
   */
  hasAvatarDecoration(): boolean {
    return this.avatarDecorationData !== null;
  }

  /**
   * Checks if this user has a guild tag configured.
   *
   * @returns True if the user has a primary guild set, false otherwise
   */
  hasGuildTag(): boolean {
    return this.primaryGuild !== null && this.primaryGuild !== undefined;
  }

  /**
   * Checks if this user is currently displaying their guild tag.
   *
   * @returns True if the user has a guild tag and it's enabled, false otherwise
   */
  isGuildTagDisplayed(): boolean {
    return this.hasGuildTag() && this.primaryGuild?.identity_enabled === true;
  }

  /**
   * Gets the user's guild tag text.
   *
   * @returns The guild tag text (up to 4 characters), or null if not set
   */
  getGuildTagText(): string | null {
    return this.primaryGuild?.tag ?? null;
  }

  /**
   * Gets the URL for the user's guild tag badge.
   *
   * @returns The URL for the guild tag badge, or null if not set
   */
  getGuildTagBadgeUrl(): string | null {
    return this.primaryGuild?.badge && this.primaryGuild.identity_guild_id
      ? Cdn.guildIcon(
          this.primaryGuild.identity_guild_id,
          this.primaryGuild.badge,
        )
      : null;
  }

  /**
   * Gets the ID of the guild that this user's tag represents.
   *
   * @returns The guild ID, or null if not set
   */
  getGuildTagGuildId(): string | null {
    return this.primaryGuild?.identity_guild_id ?? null;
  }

  /**
   * Checks if the user's username is valid according to Discord's requirements.
   *
   * This validates the username against Discord's rules, which include
   * length restrictions and forbidden substrings.
   *
   * @returns True if the username is valid, false otherwise
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
   */
  async refresh(): Promise<User> {
    const userData = await this.client.rest.users.fetchUser(this.id);
    this.patch(userData);
    return this;
  }

  /**
   * Checks if this user is a member of a specific guild.
   *
   * @param guildId - The ID of the guild to check
   * @returns A promise resolving to true if the user is a member, false otherwise
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
   * @see {@link https://discord.com/developers/docs/resources/user#connection-object}
   */
  async getServiceConnections(
    type?: ConnectionService,
  ): Promise<ConnectionEntity[]> {
    const connections = await this.fetchConnections();

    if (type) {
      return connections.filter((conn) => conn.type === type);
    }

    return connections;
  }
}
