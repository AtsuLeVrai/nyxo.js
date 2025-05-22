import {
  type ApplicationCommandPermissionEntity,
  ApplicationCommandPermissionType,
  type GuildApplicationCommandPermissionEntity,
  type Snowflake,
} from "@nyxojs/core";
import { z } from "zod/v4";
import {
  CommandPermissionSchema,
  GuildCommandPermissionSchema,
} from "../schemas/index.js";
import { MAX_PERMISSIONS } from "../utils/index.js";

/**
 * Builder for creating command permission objects.
 * Used to specify which users, roles, or channels can use a command in a guild.
 */
export class CommandPermissionBuilder {
  /** Internal permission data being constructed */
  private readonly data: Partial<ApplicationCommandPermissionEntity> = {};

  /**
   * Creates a new CommandPermissionBuilder instance.
   *
   * @param data - Optional initial data to populate the permission with
   */
  constructor(data?: Partial<ApplicationCommandPermissionEntity>) {
    if (data) {
      const result = CommandPermissionSchema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data = { ...result.data };
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
   */
  setId(id: Snowflake): this {
    this.data.id = id;
    return this;
  }

  /**
   * Sets the type of permission (role, user, or channel).
   *
   * @param type - The permission type
   * @returns The permission builder instance for method chaining
   */
  setType(type: ApplicationCommandPermissionType): this {
    this.data.type = type;
    return this;
  }

  /**
   * Sets whether to allow or deny access to the command.
   *
   * @param permission - true to allow, false to deny
   * @returns The permission builder instance for method chaining
   */
  setPermission(permission: boolean): this {
    this.data.permission = permission;
    return this;
  }

  /**
   * Builds the final command permission entity.
   *
   * @returns The complete command permission entity
   * @throws Error if the permission configuration is invalid
   */
  build(): ApplicationCommandPermissionEntity {
    const result = CommandPermissionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the permission.
   *
   * @returns A read-only copy of the permission data
   */
  toJson(): Readonly<Partial<ApplicationCommandPermissionEntity>> {
    return Object.freeze({ ...this.data });
  }
}

/**
 * Builder for guild application command permissions objects.
 * Used to update permissions for commands in a guild.
 */
export class GuildCommandPermissionsBuilder {
  /** Internal permissions data being constructed */
  private readonly data: Partial<GuildApplicationCommandPermissionEntity> = {
    permissions: [],
  };

  /**
   * Creates a new GuildCommandPermissionsBuilder instance.
   *
   * @param data - Optional initial data to populate the permissions with
   */
  constructor(data?: Partial<GuildApplicationCommandPermissionEntity>) {
    if (data) {
      const result = GuildCommandPermissionSchema.partial().safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data = {
        ...result.data,
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
   */
  setCommandId(commandId: Snowflake): this {
    this.data.id = commandId;
    return this;
  }

  /**
   * Sets the application ID these permissions are for.
   *
   * @param applicationId - The application ID
   * @returns The permissions builder instance for method chaining
   */
  setApplicationId(applicationId: Snowflake): this {
    this.data.application_id = applicationId;
    return this;
  }

  /**
   * Sets the guild ID these permissions apply to.
   *
   * @param guildId - The guild ID
   * @returns The permissions builder instance for method chaining
   */
  setGuildId(guildId: Snowflake): this {
    this.data.guild_id = guildId;
    return this;
  }

  /**
   * Adds a permission to the command.
   *
   * @param permission - The permission to add or a function that returns a permission
   * @returns The permissions builder instance for method chaining
   * @throws Error if adding the permission would exceed the maximum number of permissions
   */
  addPermission(
    permission:
      | ApplicationCommandPermissionEntity
      | ((builder: CommandPermissionBuilder) => CommandPermissionBuilder),
  ): this {
    if (!this.data.permissions) {
      this.data.permissions = [];
    }

    if (this.data.permissions.length >= MAX_PERMISSIONS) {
      throw new Error(
        `Cannot add more than ${MAX_PERMISSIONS} permissions to a command`,
      );
    }

    if (typeof permission === "function") {
      // Create a new permission using the builder function
      const builder = new CommandPermissionBuilder();
      const result = permission(builder);
      this.data.permissions.push(result.build());
    } else {
      // Validate the permission
      const result = CommandPermissionSchema.safeParse(permission);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.data.permissions.push(result.data);
    }

    return this;
  }

  /**
   * Adds multiple permissions to the command.
   *
   * @param permissions - Array of permissions to add
   * @returns The permissions builder instance for method chaining
   * @throws Error if adding the permissions would exceed the maximum number
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
   */
  setPermissions(permissions: ApplicationCommandPermissionEntity[]): this {
    if (permissions.length > MAX_PERMISSIONS) {
      throw new Error(
        `Cannot add more than ${MAX_PERMISSIONS} permissions to a command`,
      );
    }

    // Validate each permission
    const validPermissions: ApplicationCommandPermissionEntity[] = [];
    for (const permission of permissions) {
      const result = CommandPermissionSchema.safeParse(permission);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      validPermissions.push(result.data);
    }

    this.data.permissions = validPermissions;
    return this;
  }

  /**
   * Creates a permission payload for allowing a command only in specific channels.
   *
   * @param allowedChannelIds - Array of channel IDs where the command is allowed
   * @returns The permissions builder instance for method chaining
   */
  restrictToChannels(allowedChannelIds: Snowflake[]): this {
    if (!this.data.guild_id) {
      throw new Error("Guild ID must be set before using restrictToChannels");
    }

    // First clear any existing permissions
    this.data.permissions = [];

    // Add permissions for each allowed channel
    for (const channelId of allowedChannelIds) {
      this.addPermission(
        CommandPermissionBuilder.forChannel(channelId, true).build(),
      );
    }

    // Add permission to deny in all other channels
    this.addPermission(
      CommandPermissionBuilder.forAllChannels(
        this.data.guild_id,
        false,
      ).build(),
    );

    return this;
  }

  /**
   * Creates a permission payload for allowing a command only for specific roles.
   *
   * @param allowedRoleIds - Array of role IDs that can use the command
   * @returns The permissions builder instance for method chaining
   */
  restrictToRoles(allowedRoleIds: Snowflake[]): this {
    if (!this.data.guild_id) {
      throw new Error("Guild ID must be set before using restrictToRoles");
    }

    // First clear any existing permissions
    this.data.permissions = [];

    // Add permissions for each allowed role
    for (const roleId of allowedRoleIds) {
      this.addPermission(
        CommandPermissionBuilder.forRole(roleId, true).build(),
      );
    }

    // Add permission to deny for everyone else
    this.addPermission(
      CommandPermissionBuilder.forEveryone(this.data.guild_id, false).build(),
    );

    return this;
  }

  /**
   * Creates a permission payload for allowing a command only for specific users.
   *
   * @param allowedUserIds - Array of user IDs that can use the command
   * @returns The permissions builder instance for method chaining
   */
  restrictToUsers(allowedUserIds: Snowflake[]): this {
    if (!this.data.guild_id) {
      throw new Error("Guild ID must be set before using restrictToUsers");
    }

    // First clear any existing permissions
    this.data.permissions = [];

    // Add permissions for each allowed user
    for (const userId of allowedUserIds) {
      this.addPermission(
        CommandPermissionBuilder.forUser(userId, true).build(),
      );
    }

    // Add permission to deny for everyone else
    this.addPermission(
      CommandPermissionBuilder.forEveryone(this.data.guild_id, false).build(),
    );

    return this;
  }

  /**
   * Creates a permission payload for allowing a command for everyone.
   *
   * @returns The permissions builder instance for method chaining
   */
  allowForEveryone(): this {
    if (!this.data.guild_id) {
      throw new Error("Guild ID must be set before using allowForEveryone");
    }

    // First clear any existing permissions
    this.data.permissions = [];

    // Add permission for everyone
    this.addPermission(
      CommandPermissionBuilder.forEveryone(this.data.guild_id, true).build(),
    );

    return this;
  }

  /**
   * Creates a permission payload for denying a command for everyone except administrators.
   *
   * @returns The permissions builder instance for method chaining
   */
  restrictToAdministrators(): this {
    if (!this.data.guild_id) {
      throw new Error(
        "Guild ID must be set before using restrictToAdministrators",
      );
    }

    // First clear any existing permissions
    this.data.permissions = [];

    // Add permission to deny for everyone
    this.addPermission(
      CommandPermissionBuilder.forEveryone(this.data.guild_id, false).build(),
    );

    return this;
  }

  /**
   * Builds the final guild command permissions entity.
   *
   * @returns The complete guild command permissions entity
   * @throws Error if the permissions configuration is invalid
   */
  build(): GuildApplicationCommandPermissionEntity {
    const result = GuildCommandPermissionSchema.safeParse(this.data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the permissions.
   *
   * @returns A read-only copy of the permissions data
   */
  toJson(): Readonly<Partial<GuildApplicationCommandPermissionEntity>> {
    return Object.freeze({ ...this.data });
  }
}
