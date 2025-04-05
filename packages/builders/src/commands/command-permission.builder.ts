import {
  type ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionType,
  type GuildApplicationCommandPermissionEntity,
  type Snowflake,
} from "@nyxjs/core";

/**
 * Builder for creating a single application command permission.
 *
 * Command permissions allow you to enable or disable commands for specific
 * users, roles, or channels within a guild.
 *
 * @example
 * ```typescript
 * const permission = new ApplicationCommandPermissionBuilder()
 *   .setId('123456789012345678') // Role or user or channel ID
 *   .setType(ApplicationCommandPermissionType.Role)
 *   .setPermission(true) // Allow
 *   .build();
 * ```
 */
export class ApplicationCommandPermissionBuilder {
  private id: Snowflake | undefined;
  private type: ApplicationCommandPermissionType | undefined;
  private permission: boolean | undefined;

  /**
   * Creates a new ApplicationCommandPermissionBuilder instance.
   *
   * @param data Optional initial permission data
   */
  constructor(data: Partial<ApplicationCommandPermissionEntity> = {}) {
    if (data.id) {
      this.id = data.id;
    }
    if (data.type) {
      this.type = data.type;
    }
    if (data.permission !== undefined) {
      this.permission = data.permission;
    }
  }

  /**
   * Creates a new builder from an existing permission entity.
   *
   * @param permission The permission entity to copy data from
   * @returns A new ApplicationCommandPermissionBuilder instance
   */
  static from(
    permission: ApplicationCommandPermissionEntity,
  ): ApplicationCommandPermissionBuilder {
    return new ApplicationCommandPermissionBuilder(permission);
  }

  /**
   * Sets the ID of the role, user, or channel.
   * You can also use constants like guild ID for @everyone or (guild ID - 1) for All Channels.
   *
   * @param id The ID to set
   * @returns This builder instance, for method chaining
   */
  setId(id: Snowflake): this {
    this.id = id;
    return this;
  }

  /**
   * Sets the type of permission.
   *
   * @param type The permission type (Role, User, or Channel)
   * @returns This builder instance, for method chaining
   */
  setType(type: ApplicationCommandPermissionType): this {
    this.type = type;
    return this;
  }

  /**
   * Sets whether the permission allows or denies access.
   *
   * @param permission True to allow, false to disallow
   * @returns This builder instance, for method chaining
   */
  setPermission(permission: boolean): this {
    this.permission = permission;
    return this;
  }

  /**
   * Builds and returns the final permission object.
   *
   * @returns The constructed permission entity
   * @throws Error If required fields are missing
   */
  build(): ApplicationCommandPermissionEntity {
    if (!this.id) {
      throw new Error("Permission ID is required");
    }

    if (this.type === undefined) {
      throw new Error("Permission type is required");
    }

    if (this.permission === undefined) {
      throw new Error("Permission value is required");
    }

    return {
      id: this.id,
      type: this.type,
      permission: this.permission,
    };
  }
}

/**
 * Builder for creating a collection of application command permissions.
 *
 * Use this builder when setting permissions for a command in a guild.
 * It allows you to combine multiple permission rules into a single object.
 *
 * @example
 * ```typescript
 * const guildPermissions = new GuildApplicationCommandPermissionsBuilder()
 *   .setApplicationId('123456789012345678')
 *   .setGuildId('876543210987654321')
 *   .setCommandId('567890123456789012')
 *   .addPermission(
 *     new ApplicationCommandPermissionBuilder()
 *       .setId('111222333444555666') // Role ID
 *       .setType(ApplicationCommandPermissionType.Role)
 *       .setPermission(true)
 *       .build()
 *   )
 *   .addPermission(
 *     new ApplicationCommandPermissionBuilder()
 *       .setId('444555666777888999') // Channel ID
 *       .setType(ApplicationCommandPermissionType.Channel)
 *       .setPermission(false)
 *       .build()
 *   )
 *   .build();
 * ```
 */
export class GuildApplicationCommandPermissionsBuilder {
  private id: Snowflake | undefined;
  private applicationId: Snowflake | undefined;
  private guildId: Snowflake | undefined;
  private permissions: ApplicationCommandPermissionEntity[] = [];

  /**
   * Creates a new GuildApplicationCommandPermissionsBuilder instance.
   *
   * @param data Optional initial permission data
   */
  constructor(data: Partial<GuildApplicationCommandPermissionEntity> = {}) {
    if (data.id) {
      this.id = data.id;
    }
    if (data.application_id) {
      this.applicationId = data.application_id;
    }
    if (data.guild_id) {
      this.guildId = data.guild_id;
    }
    if (data.permissions) {
      this.permissions = [...data.permissions];
    }
  }

  /**
   * Creates a new builder from an existing guild command permission entity.
   *
   * @param guildPermission The guild permission entity to copy data from
   * @returns A new GuildApplicationCommandPermissionsBuilder instance
   */
  static from(
    guildPermission: GuildApplicationCommandPermissionEntity,
  ): GuildApplicationCommandPermissionsBuilder {
    return new GuildApplicationCommandPermissionsBuilder(guildPermission);
  }

  /**
   * Sets the ID of the command or the application ID if permissions apply to all commands.
   *
   * @param id The command ID or application ID
   * @returns This builder instance, for method chaining
   */
  setCommandId(id: Snowflake): this {
    this.id = id;
    return this;
  }

  /**
   * Sets the application ID.
   *
   * @param applicationId The application ID
   * @returns This builder instance, for method chaining
   */
  setApplicationId(applicationId: Snowflake): this {
    this.applicationId = applicationId;
    return this;
  }

  /**
   * Sets the guild ID.
   *
   * @param guildId The guild ID
   * @returns This builder instance, for method chaining
   */
  setGuildId(guildId: Snowflake): this {
    this.guildId = guildId;
    return this;
  }

  /**
   * Sets the permissions for the command in the guild.
   *
   * @param permissions Array of permission entities
   * @returns This builder instance, for method chaining
   * @throws Error If more than 100 permissions are provided
   */
  setPermissions(permissions: ApplicationCommandPermissionEntity[]): this {
    if (permissions.length > 100) {
      throw new Error("Cannot have more than 100 permission overwrites");
    }

    this.permissions = [...permissions];
    return this;
  }

  /**
   * Adds a single permission to the command in the guild.
   *
   * @param permission The permission entity to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 100 permissions
   */
  addPermission(permission: ApplicationCommandPermissionEntity): this {
    if (this.permissions.length >= 100) {
      throw new Error("Cannot have more than 100 permission overwrites");
    }

    this.permissions.push(permission);
    return this;
  }

  /**
   * Adds multiple permissions to the command in the guild.
   *
   * @param permissions The permission entities to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 100 permissions
   */
  addPermissions(...permissions: ApplicationCommandPermissionEntity[]): this {
    if (this.permissions.length + permissions.length > 100) {
      throw new Error("Cannot have more than 100 permission overwrites");
    }

    this.permissions.push(...permissions);
    return this;
  }

  /**
   * Builds and returns the final guild command permissions object.
   *
   * @returns The constructed guild application command permission entity
   * @throws Error If required fields are missing
   */
  build(): GuildApplicationCommandPermissionEntity {
    if (!this.id) {
      throw new Error("Command ID is required");
    }

    if (!this.applicationId) {
      throw new Error("Application ID is required");
    }

    if (!this.guildId) {
      throw new Error("Guild ID is required");
    }

    if (this.permissions.length === 0) {
      throw new Error("At least one permission is required");
    }

    return {
      id: this.id,
      application_id: this.applicationId,
      guild_id: this.guildId,
      permissions: this.permissions,
    };
  }
}

/**
 * Helper class for creating command permission constants.
 *
 * Provides methods to create permission objects for special cases
 * like @everyone or all channels in a guild.
 */
export const CommandPermissionConstants = {
  /**
   * Creates a permission for the @everyone role in a guild.
   *
   * @param guildId The guild ID
   * @param allow Whether to allow or deny permission (defaults to true)
   * @returns An application command permission entity
   *
   * @example
   * ```typescript
   * const everyonePermission = CommandPermissionConstants.everyone('123456789012345678', false);
   * // Disables the command for everyone in the guild except admins
   * ```
   */
  everyone(
    guildId: Snowflake,
    allow = true,
  ): ApplicationCommandPermissionEntity {
    return {
      id: guildId, // Guild ID is also @everyone role ID
      type: ApplicationCommandPermissionType.Role,
      permission: allow,
    };
  },

  /**
   * Creates a permission for all channels in a guild.
   *
   * @param guildId The guild ID
   * @param allow Whether to allow or deny permission (defaults to true)
   * @returns An application command permission entity
   *
   * @example
   * ```typescript
   * const allChannelsPermission = CommandPermissionConstants.allChannels('123456789012345678', false);
   * // Disables the command in all channels
   * ```
   */
  allChannels(
    guildId: Snowflake,
    allow = true,
  ): ApplicationCommandPermissionEntity {
    // Discord API specification says "guild_id - 1" represents all channels
    const allChannelsId = BigInt(guildId) - 1n;

    return {
      id: allChannelsId.toString(),
      type: ApplicationCommandPermissionType.Channel,
      permission: allow,
    };
  },
} as const;
