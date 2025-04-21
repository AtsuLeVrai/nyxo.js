import {
  type ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionType,
  type GuildApplicationCommandPermissionEntity,
  type Snowflake,
} from "@nyxojs/core";
import { MAX_PERMISSIONS } from "../utils/index.js";

/**
 * Builder for application command permission objects.
 * Used to set permissions for who can use a command in a guild.
 *
 * @example
 * ```typescript
 * const permission = new CommandPermissionBuilder()
 *   .setId('123456789012345678') // Role ID
 *   .setType(ApplicationCommandPermissionType.Role)
 *   .setPermission(true) // Allow this role to use the command
 *   .build();
 * ```
 */
export class CommandPermissionBuilder {
  /** The internal permission data being constructed */
  readonly #data: Partial<ApplicationCommandPermissionEntity> = {};

  /**
   * Creates a new CommandPermissionBuilder instance.
   *
   * @param data - Optional initial data to populate the permission with
   */
  constructor(data?: Partial<ApplicationCommandPermissionEntity>) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new CommandPermissionBuilder from existing permission data.
   *
   * @param data - The permission data to use
   * @returns A new CommandPermissionBuilder instance with the provided data
   */
  static from(
    data: Partial<ApplicationCommandPermissionEntity>,
  ): CommandPermissionBuilder {
    return new CommandPermissionBuilder(data);
  }

  /**
   * Creates a permission for a role.
   *
   * @param roleId - The ID of the role
   * @param permission - true to allow, false to deny
   * @returns A new CommandPermissionBuilder instance
   *
   * @example
   * ```typescript
   * // Allow a role to use the command
   * CommandPermissionBuilder.forRole('123456789012345678', true);
   * ```
   */
  static forRole(
    roleId: Snowflake,
    permission: boolean,
  ): CommandPermissionBuilder {
    return new CommandPermissionBuilder()
      .setId(roleId)
      .setType(ApplicationCommandPermissionType.Role)
      .setPermission(permission);
  }

  /**
   * Creates a permission for a user.
   *
   * @param userId - The ID of the user
   * @param permission - true to allow, false to deny
   * @returns A new CommandPermissionBuilder instance
   *
   * @example
   * ```typescript
   * // Allow a user to use the command
   * CommandPermissionBuilder.forUser('123456789012345678', true);
   * ```
   */
  static forUser(
    userId: Snowflake,
    permission: boolean,
  ): CommandPermissionBuilder {
    return new CommandPermissionBuilder()
      .setId(userId)
      .setType(ApplicationCommandPermissionType.User)
      .setPermission(permission);
  }

  /**
   * Creates a permission for a channel.
   *
   * @param channelId - The ID of the channel
   * @param permission - true to allow, false to deny
   * @returns A new CommandPermissionBuilder instance
   *
   * @example
   * ```typescript
   * // Allow a command to be used in a specific channel
   * CommandPermissionBuilder.forChannel('123456789012345678', true);
   * ```
   */
  static forChannel(
    channelId: Snowflake,
    permission: boolean,
  ): CommandPermissionBuilder {
    return new CommandPermissionBuilder()
      .setId(channelId)
      .setType(ApplicationCommandPermissionType.Channel)
      .setPermission(permission);
  }

  /**
   * Creates a permission for @everyone in a guild.
   *
   * @param guildId - The ID of the guild
   * @param permission - true to allow, false to deny
   * @returns A new CommandPermissionBuilder instance
   *
   * @example
   * ```typescript
   * // Allow everyone in the guild to use the command
   * CommandPermissionBuilder.forEveryone('123456789012345678', true);
   * ```
   */
  static forEveryone(
    guildId: Snowflake,
    permission: boolean,
  ): CommandPermissionBuilder {
    return new CommandPermissionBuilder()
      .setId(guildId)
      .setType(ApplicationCommandPermissionType.Role)
      .setPermission(permission);
  }

  /**
   * Creates a permission for all channels in a guild.
   *
   * @param guildId - The ID of the guild
   * @param permission - true to allow, false to deny
   * @returns A new CommandPermissionBuilder instance
   *
   * @example
   * ```typescript
   * // Allow the command to be used in all channels
   * CommandPermissionBuilder.forAllChannels('123456789012345678', true);
   * ```
   */
  static forAllChannels(
    guildId: Snowflake,
    permission: boolean,
  ): CommandPermissionBuilder {
    // Discord uses guildId - 1 as a special constant for all channels
    const allChannelsId = BigInt(guildId) - 1n;

    return new CommandPermissionBuilder()
      .setId(allChannelsId.toString())
      .setType(ApplicationCommandPermissionType.Channel)
      .setPermission(permission);
  }

  /**
   * Sets the ID of the role, user, or channel the permission applies to.
   *
   * @param id - The ID to apply the permission to
   * @returns The permission builder instance for method chaining
   *
   * @example
   * ```typescript
   * // For a specific role
   * new CommandPermissionBuilder().setId('123456789012345678');
   *
   * // For @everyone in the guild
   * new CommandPermissionBuilder().setId(guildId);
   * ```
   */
  setId(id: Snowflake): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Sets the type of permission (role, user, or channel).
   *
   * @param type - The permission type
   * @returns The permission builder instance for method chaining
   *
   * @example
   * ```typescript
   * new CommandPermissionBuilder().setType(ApplicationCommandPermissionType.Role);
   * ```
   */
  setType(type: ApplicationCommandPermissionType): this {
    this.#data.type = type;
    return this;
  }

  /**
   * Sets whether to allow or deny access to the command.
   *
   * @param permission - true to allow, false to deny
   * @returns The permission builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Allow access
   * new CommandPermissionBuilder().setPermission(true);
   *
   * // Deny access
   * new CommandPermissionBuilder().setPermission(false);
   * ```
   */
  setPermission(permission: boolean): this {
    this.#data.permission = permission;
    return this;
  }

  /**
   * Builds the final command permission entity.
   *
   * @returns The complete command permission entity
   * @throws Error if the permission configuration is invalid
   */
  build(): ApplicationCommandPermissionEntity {
    if (!this.#data.id) {
      throw new Error("Permission ID is required");
    }

    if (this.#data.type === undefined) {
      throw new Error("Permission type is required");
    }

    if (this.#data.permission === undefined) {
      throw new Error("Permission value is required");
    }

    return this.#data as ApplicationCommandPermissionEntity;
  }

  /**
   * Returns a JSON representation of the permission.
   *
   * @returns A read-only copy of the permission data
   */
  toJson(): Readonly<Partial<ApplicationCommandPermissionEntity>> {
    return Object.freeze({ ...this.#data });
  }
}

/**
 * Builder for guild application command permissions objects.
 * Used to update permissions for commands in a guild.
 *
 * @example
 * ```typescript
 * const permissions = new GuildCommandPermissionsBuilder()
 *   .setApplicationId('123456789012345678')
 *   .setGuildId('987654321098765432')
 *   .setCommandId('456789012345678901')
 *   .addPermission(CommandPermissionBuilder.forRole('234567890123456789', true))
 *   .addPermission(CommandPermissionBuilder.forUser('345678901234567890', false))
 *   .build();
 * ```
 */
export class GuildCommandPermissionsBuilder {
  /** The internal permissions data being constructed */
  readonly #data: Partial<GuildApplicationCommandPermissionEntity> = {
    permissions: [],
  };

  /**
   * Creates a new GuildCommandPermissionsBuilder instance.
   *
   * @param data - Optional initial data to populate the permissions with
   */
  constructor(data?: Partial<GuildApplicationCommandPermissionEntity>) {
    if (data) {
      this.#data = {
        ...data,
        permissions: data.permissions ? [...data.permissions] : [],
      };
    }
  }

  /**
   * Creates a new GuildCommandPermissionsBuilder from existing permissions data.
   *
   * @param data - The permissions data to use
   * @returns A new GuildCommandPermissionsBuilder instance with the provided data
   */
  static from(
    data: Partial<GuildApplicationCommandPermissionEntity>,
  ): GuildCommandPermissionsBuilder {
    return new GuildCommandPermissionsBuilder(data);
  }

  /**
   * Sets the ID of the command these permissions apply to.
   *
   * @param commandId - The command ID
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * new GuildCommandPermissionsBuilder().setCommandId('123456789012345678');
   * ```
   */
  setCommandId(commandId: Snowflake): this {
    this.#data.id = commandId;
    return this;
  }

  /**
   * Sets the application ID these permissions are for.
   *
   * @param applicationId - The application ID
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * new GuildCommandPermissionsBuilder().setApplicationId('123456789012345678');
   * ```
   */
  setApplicationId(applicationId: Snowflake): this {
    this.#data.application_id = applicationId;
    return this;
  }

  /**
   * Sets the guild ID these permissions apply to.
   *
   * @param guildId - The guild ID
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * new GuildCommandPermissionsBuilder().setGuildId('123456789012345678');
   * ```
   */
  setGuildId(guildId: Snowflake): this {
    this.#data.guild_id = guildId;
    return this;
  }

  /**
   * Adds a permission to the command.
   *
   * @param permission - The permission to add or a function that returns a permission
   * @returns The permissions builder instance for method chaining
   * @throws Error if adding the permission would exceed the maximum number of permissions
   *
   * @example
   * ```typescript
   * // Adding a pre-built permission
   * const rolePermission = new CommandPermissionBuilder()
   *   .setId('123456789012345678')
   *   .setType(ApplicationCommandPermissionType.Role)
   *   .setPermission(true)
   *   .build();
   *
   * new GuildCommandPermissionsBuilder().addPermission(rolePermission);
   *
   * // Using a builder function
   * new GuildCommandPermissionsBuilder().addPermission(permission =>
   *   permission
   *     .setId('123456789012345678')
   *     .setType(ApplicationCommandPermissionType.Role)
   *     .setPermission(true)
   * );
   * ```
   */
  addPermission(
    permission:
      | ApplicationCommandPermissionEntity
      | ((builder: CommandPermissionBuilder) => CommandPermissionBuilder),
  ): this {
    if (!this.#data.permissions) {
      this.#data.permissions = [];
    }

    if (this.#data.permissions.length >= MAX_PERMISSIONS) {
      throw new Error(
        `Cannot add more than ${MAX_PERMISSIONS} permissions to a command`,
      );
    }

    if (typeof permission === "function") {
      // Create a new permission using the builder function
      const builder = new CommandPermissionBuilder();
      const result = permission(builder);
      this.#data.permissions.push(result.build());
    } else {
      // Add the existing permission
      this.#data.permissions.push(permission);
    }

    return this;
  }

  /**
   * Adds multiple permissions to the command.
   *
   * @param permissions - Array of permissions to add
   * @returns The permissions builder instance for method chaining
   * @throws Error if adding the permissions would exceed the maximum number
   *
   * @example
   * ```typescript
   * new GuildCommandPermissionsBuilder().addPermissions([
   *   CommandPermissionBuilder.forRole('123456789012345678', true).build(),
   *   CommandPermissionBuilder.forUser('987654321098765432', false).build()
   * ]);
   * ```
   */
  addPermissions(permissions: ApplicationCommandPermissionEntity[]): this {
    for (const permission of permissions) {
      this.addPermission(permission);
    }
    return this;
  }

  /**
   * Sets all permissions for the command, replacing any existing permissions.
   *
   * @param permissions - Array of permissions to set
   * @returns The permissions builder instance for method chaining
   * @throws Error if too many permissions are provided
   *
   * @example
   * ```typescript
   * new GuildCommandPermissionsBuilder().setPermissions([
   *   CommandPermissionBuilder.forRole('123456789012345678', true).build(),
   *   CommandPermissionBuilder.forUser('987654321098765432', false).build()
   * ]);
   * ```
   */
  setPermissions(permissions: ApplicationCommandPermissionEntity[]): this {
    if (permissions.length > MAX_PERMISSIONS) {
      throw new Error(
        `Cannot add more than ${MAX_PERMISSIONS} permissions to a command`,
      );
    }

    this.#data.permissions = [...permissions];
    return this;
  }

  /**
   * Creates a permission payload for allowing a command only in specific channels.
   *
   * @param allowedChannelIds - Array of channel IDs where the command is allowed
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Only allow the command in specific channels
   * new GuildCommandPermissionsBuilder()
   *   .setCommandId('123456789012345678')
   *   .setApplicationId('234567890123456789')
   *   .setGuildId('345678901234567890')
   *   .restrictToChannels(['456789012345678901', '567890123456789012']);
   * ```
   */
  restrictToChannels(allowedChannelIds: Snowflake[]): this {
    // First clear any existing permissions
    this.#data.permissions = [];

    // Add permissions for each allowed channel
    for (const channelId of allowedChannelIds) {
      this.addPermission(
        CommandPermissionBuilder.forChannel(channelId, true).build(),
      );
    }

    // Add permission to deny in all other channels
    if (this.#data.guild_id) {
      this.addPermission(
        CommandPermissionBuilder.forAllChannels(
          this.#data.guild_id,
          false,
        ).build(),
      );
    } else {
      throw new Error("Guild ID must be set before using restrictToChannels");
    }

    return this;
  }

  /**
   * Creates a permission payload for allowing a command only for specific roles.
   *
   * @param allowedRoleIds - Array of role IDs that can use the command
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Only allow specific roles to use the command
   * new GuildCommandPermissionsBuilder()
   *   .setCommandId('123456789012345678')
   *   .setApplicationId('234567890123456789')
   *   .setGuildId('345678901234567890')
   *   .restrictToRoles(['456789012345678901', '567890123456789012']);
   * ```
   */
  restrictToRoles(allowedRoleIds: Snowflake[]): this {
    // First clear any existing permissions
    this.#data.permissions = [];

    // Add permissions for each allowed role
    for (const roleId of allowedRoleIds) {
      this.addPermission(
        CommandPermissionBuilder.forRole(roleId, true).build(),
      );
    }

    // Add permission to deny for everyone else
    if (this.#data.guild_id) {
      this.addPermission(
        CommandPermissionBuilder.forEveryone(
          this.#data.guild_id,
          false,
        ).build(),
      );
    } else {
      throw new Error("Guild ID must be set before using restrictToRoles");
    }

    return this;
  }

  /**
   * Creates a permission payload for allowing a command only for specific users.
   *
   * @param allowedUserIds - Array of user IDs that can use the command
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Only allow specific users to use the command
   * new GuildCommandPermissionsBuilder()
   *   .setCommandId('123456789012345678')
   *   .setApplicationId('234567890123456789')
   *   .setGuildId('345678901234567890')
   *   .restrictToUsers(['456789012345678901', '567890123456789012']);
   * ```
   */
  restrictToUsers(allowedUserIds: Snowflake[]): this {
    // First clear any existing permissions
    this.#data.permissions = [];

    // Add permissions for each allowed user
    for (const userId of allowedUserIds) {
      this.addPermission(
        CommandPermissionBuilder.forUser(userId, true).build(),
      );
    }

    // Add permission to deny for everyone else
    if (this.#data.guild_id) {
      this.addPermission(
        CommandPermissionBuilder.forEveryone(
          this.#data.guild_id,
          false,
        ).build(),
      );
    } else {
      throw new Error("Guild ID must be set before using restrictToUsers");
    }

    return this;
  }

  /**
   * Creates a permission payload for allowing a command for everyone (default behavior).
   *
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Allow everyone to use the command
   * new GuildCommandPermissionsBuilder()
   *   .setCommandId('123456789012345678')
   *   .setApplicationId('234567890123456789')
   *   .setGuildId('345678901234567890')
   *   .allowForEveryone();
   * ```
   */
  allowForEveryone(): this {
    // First clear any existing permissions
    this.#data.permissions = [];

    // Add permission for everyone
    if (this.#data.guild_id) {
      this.addPermission(
        CommandPermissionBuilder.forEveryone(this.#data.guild_id, true).build(),
      );
    } else {
      throw new Error("Guild ID must be set before using allowForEveryone");
    }

    return this;
  }

  /**
   * Creates a permission payload for denying a command for everyone except administrators.
   *
   * @returns The permissions builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Only allow administrators to use the command
   * new GuildCommandPermissionsBuilder()
   *   .setCommandId('123456789012345678')
   *   .setApplicationId('234567890123456789')
   *   .setGuildId('345678901234567890')
   *   .restrictToAdministrators();
   * ```
   */
  restrictToAdministrators(): this {
    // First clear any existing permissions
    this.#data.permissions = [];

    // Add permission to deny for everyone
    if (this.#data.guild_id) {
      this.addPermission(
        CommandPermissionBuilder.forEveryone(
          this.#data.guild_id,
          false,
        ).build(),
      );
    } else {
      throw new Error(
        "Guild ID must be set before using restrictToAdministrators",
      );
    }

    // Note: We don't need to explicitly allow administrators because they can always use commands
    // regardless of permission settings

    return this;
  }

  /**
   * Builds the final guild command permissions entity.
   *
   * @returns The complete guild command permissions entity
   * @throws Error if the permissions configuration is invalid
   */
  build(): GuildApplicationCommandPermissionEntity {
    if (!this.#data.id) {
      throw new Error("Command ID is required");
    }

    if (!this.#data.application_id) {
      throw new Error("Application ID is required");
    }

    if (!this.#data.guild_id) {
      throw new Error("Guild ID is required");
    }

    if (!this.#data.permissions || this.#data.permissions.length === 0) {
      throw new Error("At least one permission is required");
    }

    return this.#data as GuildApplicationCommandPermissionEntity;
  }

  /**
   * Returns a JSON representation of the permissions.
   * Can be used directly with the Discord API for permission updates.
   *
   * @returns A read-only copy of the permissions data
   */
  toJson(): Readonly<Partial<GuildApplicationCommandPermissionEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
