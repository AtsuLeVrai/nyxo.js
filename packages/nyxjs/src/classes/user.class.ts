import {
  type ApplicationRoleConnectionEntity,
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type ConnectionEntity,
  type DmChannelEntity,
  type FormattedUser,
  type GuildEntity,
  type GuildMemberEntity,
  type Locale,
  type PremiumType,
  type Snowflake,
  type UserEntity,
  UserFlags,
  formatUser,
} from "@nyxjs/core";
import type {
  CreateGroupDmSchema,
  GetCurrentUserGuildsQuerySchema,
  ModifyCurrentUserSchema,
  UpdateCurrentUserApplicationRoleConnectionSchema,
} from "@nyxjs/rest";
import { type AnimatedImageOptions, Cdn } from "@nyxjs/rest";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a Discord user.
 *
 * Users in Discord are generally considered the base entity. Users can spawn across
 * the entire platform, be members of guilds, participate in text and voice chat, and much more.
 * Users are separated by a distinction of "bot" vs "normal." Bot users are automated
 * users that are "owned" by another user and don't have a limitation on the number
 * of guilds they can join.
 *
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export class User extends BaseClass<UserEntity> {
  /**
   * The unique ID of this user
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The username of this user
   */
  get username(): string {
    return this.data.username;
  }

  /**
   * The discriminator of this user (legacy system)
   */
  get discriminator(): string {
    return this.data.discriminator;
  }

  /**
   * The global display name of this user
   */
  get globalName(): string | null {
    return this.data.global_name;
  }

  /**
   * The display name of this user, preferring globalName if available,
   * otherwise falling back to username
   */
  get displayName(): string {
    return this.globalName ?? this.username;
  }

  /**
   * The avatar hash of this user
   */
  get avatar(): string | null {
    return this.data.avatar;
  }

  /**
   * Whether this user is a bot
   */
  get bot(): boolean {
    return Boolean(this.data.bot);
  }

  /**
   * Whether this user is a system user
   */
  get system(): boolean {
    return Boolean(this.data.system);
  }

  /**
   * Whether this user has MFA enabled
   */
  get mfaEnabled(): boolean {
    return Boolean(this.data.mfa_enabled);
  }

  /**
   * The banner hash of this user
   */
  get banner(): string | null {
    return this.data.banner ?? null;
  }

  /**
   * The accent color of this user's profile
   */
  get accentColor(): number | null {
    return this.data.accent_color ?? null;
  }

  /**
   * The locale of this user
   */
  get locale(): Locale | null {
    return this.data.locale ?? null;
  }

  /**
   * Whether this user's email is verified
   */
  get verified(): boolean {
    return Boolean(this.data.verified);
  }

  /**
   * The email of this user, if available
   */
  get email(): string | null {
    return this.data.email ?? null;
  }

  /**
   * The flags of this user as a BitFieldManager
   */
  get flags(): BitFieldManager<UserFlags> {
    return new BitFieldManager<UserFlags>(this.data.flags ?? 0n);
  }

  /**
   * The premium type of this user
   */
  get premiumType(): PremiumType | null {
    return this.data.premium_type ?? null;
  }

  /**
   * The public flags of this user as a BitFieldManager
   */
  get publicFlags(): BitFieldManager<UserFlags> {
    return new BitFieldManager<UserFlags>(this.data.public_flags ?? 0n);
  }

  /**
   * The avatar decoration data of this user
   */
  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.data.avatar_decoration_data ?? null;
  }

  /**
   * Whether this user has Nitro, based on premium type
   */
  get hasNitro(): boolean {
    return this.premiumType !== null;
  }

  /**
   * Creates a default user tag in the format username#discriminator
   * For users on the new username system, returns just the username
   */
  get tag(): string {
    if (this.discriminator === "0") {
      return this.username;
    }
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * Creates a user mention string
   */
  get mention(): FormattedUser {
    return formatUser(this.id);
  }

  /**
   * Gets the URL for this user's avatar
   *
   * @param options - Display options for the avatar
   * @returns URL to the user's avatar, or default avatar if none is set
   */
  avatarUrl(options: AnimatedImageOptions = {}): string {
    if (!this.avatar) {
      return this.defaultAvatarUrl();
    }

    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * Gets the URL for this user's banner
   *
   * @param options - Display options for the banner
   * @returns URL to the user's banner, or null if none is set
   */
  bannerUrl(options: AnimatedImageOptions = {}): string | null {
    if (!this.banner) {
      return null;
    }

    return Cdn.userBanner(this.id, this.banner, options);
  }

  /**
   * Gets the URL for this user's default avatar
   *
   * @returns URL to the user's default avatar
   */
  defaultAvatarUrl(): string {
    if (this.discriminator === "0") {
      return Cdn.defaultUserAvatarSystem(this.id);
    }
    return Cdn.defaultUserAvatar(this.discriminator);
  }

  /**
   * Gets the URL for this user's avatar decoration
   *
   * @returns URL to the user's avatar decoration, or null if none is set
   */
  avatarDecorationUrl(): string | null {
    if (!this.avatarDecorationData?.asset) {
      return null;
    }
    return Cdn.avatarDecoration(this.avatarDecorationData.asset);
  }

  /**
   * Fetches this user's profile from the API, updating the current instance with fresh data
   *
   * @param options - Options for the fetch operation
   * @returns Promise resolving to this user with updated data
   */
  async fetch(options: { force?: boolean } = {}): Promise<User> {
    if (!options.force) {
      const cachedUser = this.client.users.get(this.id);
      if (cachedUser) {
        return cachedUser;
      }
    }

    const data = await this.client.rest.users.getUser(this.id);
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Modifies the current user's profile (only works for the bot user)
   *
   * All parameters to this endpoint are optional.
   * Fires a User Update Gateway event when successful.
   *
   * @param options - Options for modifying the current user
   * @returns Promise resolving to the updated user
   * @throws Error if not called on the current bot user or if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  async modify(options: ModifyCurrentUserSchema): Promise<User> {
    const data = await this.client.rest.users.modifyCurrentUser(options);
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Creates a new DM channel with this user
   *
   * Returns a DM channel object. If one already exists, it will be returned instead.
   *
   * @returns Promise resolving to the DM channel
   * @throws Error if creating the DM channel fails
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(): Promise<DmChannelEntity> {
    return this.client.rest.users.createDm(this.id);
  }

  /**
   * Creates a group DM channel with this user and others
   *
   * This endpoint was intended to be used with the now-deprecated GameBridge SDK.
   * It is limited to 10 active group DMs.
   *
   * @param options - Options for creating the group DM
   * @returns Promise resolving to the group DM channel
   * @throws Error if creating the group DM channel fails
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  addToGroupDm(options: CreateGroupDmSchema): Promise<DmChannelEntity> {
    return this.client.rest.users.createGroupDm(options);
  }

  /**
   * Gets a list of guilds the current user is a member of
   *
   * For OAuth2, this requires the `guilds` scope.
   * This endpoint returns 200 guilds by default, which is the maximum number
   * of guilds a non-bot user can join. Therefore, pagination is not needed
   * for integrations that need to get a list of the users' guilds.
   *
   * Note: This method only works if this user is the current user.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise resolving to an array of guild objects
   * @throws Error if not called on the current user
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getGuilds(
    query: GetCurrentUserGuildsQuerySchema = {},
  ): Promise<GuildEntity[]> {
    return this.client.rest.users.getCurrentUserGuilds(query);
  }

  /**
   * Gets the user's guild member data in a specific guild
   *
   * @param guildId - The ID of the guild to get member data from
   * @returns Promise resolving to the guild member data
   * @throws Error if the user is not a member of the guild or if not authorized
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  async getGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    if (this.id === (await this.client.rest.users.getCurrentUser()).id) {
      return this.client.rest.users.getCurrentUserGuildMember(guildId);
    }
    return this.client.rest.guilds.getGuildMember(guildId, this.id);
  }

  /**
   * Makes the current user leave a guild
   *
   * Note: This method only works if this user is the current user.
   *
   * @param guildId - The ID of the guild to leave
   * @returns Promise that resolves when the guild is left
   * @throws Error if not called on the current user
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.client.rest.users.leaveGuild(guildId);
  }

  /**
   * Gets the user's connections
   *
   * Requires the `connections` OAuth2 scope.
   * Note: This method only works if this user is the current user.
   *
   * @returns Promise resolving to an array of connection objects
   * @throws Error if not called on the current user
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getConnections(): Promise<ConnectionEntity[]> {
    return this.client.rest.users.getCurrentUserConnections();
  }

  /**
   * Gets the application role connection for the user
   *
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   * Note: This method only works if this user is the current user.
   *
   * @param applicationId - The ID of the application to get the role connection for
   * @returns Promise resolving to the application role connection
   * @throws Error if not called on the current user
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.client.rest.users.getCurrentUserApplicationRoleConnection(
      applicationId,
    );
  }

  /**
   * Updates the application role connection for the user
   *
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   * Note: This method only works if this user is the current user.
   *
   * @param applicationId - The ID of the application to update the role connection for
   * @param connection - The role connection data to update
   * @returns Promise resolving to the updated application role connection
   * @throws Error if not called on the current user
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.client.rest.users.updateCurrentUserApplicationRoleConnection(
      applicationId,
      connection,
    );
  }

  /**
   * Checks if the user has a specific flag
   *
   * @param flag - The flag to check for
   * @returns Whether the user has the flag
   */
  hasFlag(flag: bigint | UserFlags): boolean {
    return this.flags.has(flag);
  }

  /**
   * Checks if the user has a specific public flag
   *
   * @param flag - The public flag to check for
   * @returns Whether the user has the public flag
   */
  hasPublicFlag(flag: bigint | UserFlags): boolean {
    return this.publicFlags.has(flag);
  }

  /**
   * Checks if the user is a Discord staff member
   *
   * @returns Whether the user is Discord staff
   */
  isStaff(): boolean {
    return this.hasPublicFlag(UserFlags.Staff);
  }

  /**
   * Checks if the user is a Discord partner
   *
   * @returns Whether the user is a Discord partner
   */
  isPartner(): boolean {
    return this.hasPublicFlag(UserFlags.Partner);
  }

  /**
   * Checks if the user is a HypeSquad events member
   *
   * @returns Whether the user is a HypeSquad events member
   */
  isHypeSquadEvents(): boolean {
    return this.hasPublicFlag(UserFlags.HypeSquad);
  }

  /**
   * Checks if the user is a verified bot
   *
   * @returns Whether the user is a verified bot
   */
  isVerifiedBot(): boolean {
    return this.bot && this.hasPublicFlag(UserFlags.VerifiedBot);
  }

  /**
   * Checks if the user is a verified developer
   *
   * @returns Whether the user is a verified developer
   */
  isVerifiedDeveloper(): boolean {
    return this.hasPublicFlag(UserFlags.VerifiedDeveloper);
  }

  /**
   * Checks if the user is an active developer
   *
   * @returns Whether the user is an active developer
   */
  isActiveDeveloper(): boolean {
    return this.hasPublicFlag(UserFlags.ActiveDeveloper);
  }
}
