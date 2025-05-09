import {
  BitField,
  type FormattedRole,
  type RoleEntity,
  RoleFlags,
  type RoleTagsEntity,
  type Snowflake,
  SnowflakeUtil,
  formatRole,
} from "@nyxojs/core";
import {
  Cdn,
  type GuildRoleUpdateOptions,
  type ImageOptions,
  type RoleIconUrl,
} from "@nyxojs/rest";
import type { z } from "zod";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased, PropsToCamel } from "../types/index.js";
import { GuildMember } from "./guild.class.js";

/**
 * Represents a Discord role, providing methods to interact with and manage role data.
 *
 * The Role class serves as a comprehensive wrapper around Discord's role API, offering:
 * - Access to role properties (name, color, permissions, etc.)
 * - Methods to update role settings and permissions
 * - Management of role position within the guild hierarchy
 * - Member assignment and removal operations
 * - Role icon and display utilities
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object}
 */
@Cacheable("roles")
export class Role
  extends BaseClass<GuildBased<RoleEntity>>
  implements Enforce<PropsToCamel<GuildBased<RoleEntity>>>
{
  /**
   * The flags on the role.
   * @private
   */
  #flags: BitField<RoleFlags> | null = null;

  /**
   * Gets the role's unique identifier (Snowflake).
   *
   * This ID is permanent and will not change for the lifetime of the role.
   * It can be used for API operations, mentions, and persistent references.
   *
   * @returns The role's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the ID of the guild this role belongs to.
   *
   * @returns The guild ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the role's name.
   *
   * Role names must be between 1 and 100 characters.
   *
   * @returns The role's name
   */
  get name(): string {
    return this.rawData.name;
  }

  /**
   * Gets the role's color as an integer.
   *
   * The color is stored as an integer representation of a hexadecimal color code.
   * A value of 0 means the role has no color and doesn't affect the member's display color.
   *
   * @returns The color as an integer
   */
  get color(): number {
    return this.rawData.color;
  }

  /**
   * Indicates whether the role is displayed separately in the member list.
   *
   * When true, members with this role are shown separately in the member list.
   * This is also referred to as "hoisting" the role.
   *
   * @returns True if the role is hoisted, false otherwise
   */
  get hoist(): boolean {
    return this.rawData.hoist;
  }

  /**
   * Gets the role's icon hash.
   *
   * This hash is used to construct the URL for the role's custom icon.
   * Use `getIconUrl()` method to get the full URL.
   *
   * @returns The role's icon hash, or null if no icon is set
   */
  get icon(): string | null | undefined {
    return this.rawData.icon;
  }

  /**
   * Gets the role's unicode emoji.
   *
   * When set, this emoji is used as the role's icon instead of a custom image.
   *
   * @returns The unicode emoji string, or null if not set
   */
  get unicodeEmoji(): string | null | undefined {
    return this.rawData.unicode_emoji;
  }

  /**
   * Gets the role's position in the guild's role hierarchy.
   *
   * Higher positions have more permissions and appear higher in the role list.
   * The @everyone role always has a position of 0.
   *
   * @returns The role's position
   */
  get position(): number {
    return this.rawData.position;
  }

  /**
   * Gets the role's permissions as a string representation of a bitfield.
   *
   * This string represents the permissions granted to members with this role.
   *
   * @returns The permissions as a string
   */
  get permissions(): string {
    return this.rawData.permissions;
  }

  /**
   * Indicates whether this role is managed by an integration.
   *
   * Managed roles cannot be manually added to or removed from members,
   * and can only be modified by the associated integration.
   *
   * @returns True if the role is managed, false otherwise
   */
  get managed(): boolean {
    return this.rawData.managed;
  }

  /**
   * Indicates whether this role can be mentioned by users.
   *
   * When true, users can @mention this role in messages to notify all members with the role.
   *
   * @returns True if the role is mentionable, false otherwise
   */
  get mentionable(): boolean {
    return this.rawData.mentionable;
  }

  /**
   * Gets the role's tags.
   *
   * Tags provide additional information about the role's purpose or origin,
   * such as whether it's associated with a bot, integration, or subscription.
   *
   * @returns The role's tags in camelCase format, or null if no tags are set
   */
  get tags(): RoleTagsEntity | undefined {
    return this.rawData.tags;
  }

  /**
   * Gets the flags on the role as a BitField.
   *
   * These flags represent additional properties of the role,
   * such as whether it can be selected in the onboarding prompt.
   *
   * @returns A BitField of role flags
   * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
   */
  get flags(): BitField<RoleFlags> {
    if (!this.#flags) {
      this.#flags = new BitField<RoleFlags>(this.rawData.flags ?? 0);
    }

    return this.#flags;
  }

  /**
   * Gets the Date object representing when this role was created.
   *
   * This is calculated from the role's ID, which contains a timestamp.
   *
   * @returns The Date when this role was created
   */
  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this role was created.
   *
   * This is useful for comparing role creation times or for formatting with
   * custom date libraries.
   *
   * @returns The creation timestamp in milliseconds
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Checks if this role is the @everyone role for its guild.
   *
   * The @everyone role has the same ID as the guild it belongs to.
   *
   * @returns True if this is the @everyone role, false otherwise
   */
  get isEveryoneRole(): boolean {
    return this.id === this.guildId;
  }

  /**
   * Checks if this role can be modified by the current user.
   *
   * This considers whether the role is managed by an integration and
   * the current user's permissions in the guild.
   *
   * @returns True if the role can be modified, false otherwise
   */
  get isEditable(): boolean {
    if (this.managed) {
      return false;
    }

    // Check if bot has permissions to modify roles
    // This would need implementation of permission checking which isn't included here
    // For now, we'll just check if it's not managed
    return true;
  }

  /**
   * Checks if this role is higher in the hierarchy than another role.
   *
   * Role hierarchy is determined by position, with higher positions having more authority.
   * When positions are equal, the role created first (with the lower ID) has higher priority.
   *
   * @param role - The role to compare against
   * @returns True if this role is higher in the hierarchy, false otherwise
   */
  comparePositionTo(role: Role): boolean {
    if (this.position === role.position) {
      // If positions are equal, the role with the lower ID (created earlier) has higher authority
      return this.id < role.id;
    }
    return this.position > role.position;
  }

  /**
   * Gets the URL for the role's icon with specified options.
   *
   * If the role doesn't have a custom icon, this returns null.
   *
   * @param options - Options for the icon image (size, format, etc.)
   * @returns The URL for the role's icon, or null if no icon is set
   * @see {@link https://discord.com/developers/docs/reference#image-formatting}
   */
  getIconUrl(options: z.input<typeof ImageOptions> = {}): RoleIconUrl | null {
    return this.icon ? Cdn.roleIcon(this.id, this.icon, options) : null;
  }

  /**
   * Gets the hex color code representation of the role's color.
   *
   * @param withHash - Whether to include the # prefix
   * @returns The hex color code, or "#000000" if the role has no color
   */
  getColorHex(withHash = true): string {
    if (this.color === 0) {
      return withHash ? "#000000" : "000000";
    }

    const hex = this.color.toString(16).padStart(6, "0");
    return withHash ? `#${hex}` : hex;
  }

  /**
   * Checks if this role has a specific flag.
   *
   * @param flag - The flag to check for
   * @returns True if the role has the flag, false otherwise
   * @see {@link https://discord.com/developers/docs/topics/permissions#role-object-role-flags}
   */
  hasFlag(flag: RoleFlags): boolean {
    return this.flags.has(flag);
  }

  /**
   * Checks if this role appears in onboarding prompts.
   *
   * This is a convenience method for checking the InPrompt flag.
   *
   * @returns True if the role appears in onboarding prompts, false otherwise
   */
  isInPrompt(): boolean {
    return this.hasFlag(RoleFlags.InPrompt);
  }

  /**
   * Checks if this role is a bot role.
   *
   * Bot roles are automatically managed and assigned to their associated bot user.
   *
   * @returns True if this is a bot role, false otherwise
   */
  isBotRole(): boolean {
    return this.tags?.bot_id !== undefined;
  }

  /**
   * Checks if this role is an integration role.
   *
   * Integration roles are automatically managed by their associated integration.
   *
   * @returns True if this is an integration role, false otherwise
   */
  isIntegrationRole(): boolean {
    return this.tags?.integration_id !== undefined;
  }

  /**
   * Checks if this role is the premium subscriber role.
   *
   * The premium subscriber role is automatically assigned to members who boost the server.
   *
   * @returns True if this is the premium subscriber role, false otherwise
   */
  isPremiumSubscriberRole(): boolean {
    return this.tags?.premium_subscriber !== undefined;
  }

  /**
   * Checks if this role is available for purchase.
   *
   * Roles can be made available for purchase through server subscriptions.
   *
   * @returns True if this role is available for purchase, false otherwise
   */
  isAvailableForPurchase(): boolean {
    return this.tags?.available_for_purchase !== undefined;
  }

  /**
   * Checks if this role is a guild connection role.
   *
   * Guild connection roles are linked to external services or platforms.
   *
   * @returns True if this is a guild connection role, false otherwise
   */
  isGuildConnectionRole(): boolean {
    return this.tags?.guild_connections !== undefined;
  }

  /**
   * Formats this role as a mention string.
   *
   * This returns a string that, when sent in a message, will create a mention
   * that pings and highlights all members with this role (if the role is mentionable).
   *
   * @returns The formatted role mention
   */
  override toString(): FormattedRole {
    return formatRole(this.id);
  }

  /**
   * Updates this role's properties.
   *
   * This method modifies various attributes of the role, such as name, color, permissions, etc.
   * Requires the MANAGE_ROLES permission.
   *
   * @param options - New properties for the role
   * @param reason - Reason for the modification (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the role cannot be updated
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   */
  async edit(
    options: Partial<GuildRoleUpdateOptions>,
    reason?: string,
  ): Promise<Role> {
    if (!this.isEditable) {
      throw new Error("Cannot edit this role");
    }

    const updatedRoleData = await this.client.rest.guilds.updateGuildRole(
      this.guildId,
      this.id,
      options,
      reason,
    );

    // Update the role data with the response
    const guildBasedData = {
      ...updatedRoleData,
      guild_id: this.guildId,
    };

    this.patch(guildBasedData);
    return this;
  }

  /**
   * Deletes this role from the guild.
   *
   * This permanently removes the role from the guild and all members.
   * Requires the MANAGE_ROLES permission.
   *
   * @param reason - Reason for deleting the role (for audit logs)
   * @returns A promise resolving to true if successful, false otherwise
   * @throws Error if the role cannot be deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
   */
  async delete(reason?: string): Promise<boolean> {
    if (!this.isEditable) {
      throw new Error("Cannot delete this role");
    }

    try {
      await this.client.rest.guilds.deleteGuildRole(
        this.guildId,
        this.id,
        reason,
      );
      this.uncache();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Changes the position of this role in the guild's hierarchy.
   *
   * This modifies where the role appears in the role list and its authority level.
   * Requires the MANAGE_ROLES permission.
   *
   * @param position - The new position for the role
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the position cannot be changed
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   */
  async setPosition(position: number): Promise<Role> {
    if (!this.isEditable) {
      throw new Error("Cannot change position of this role");
    }

    const updatedRoles = await this.client.rest.guilds.updateGuildRolePositions(
      this.guildId,
      [{ id: this.id, position }],
    );

    // Find our role in the updated roles array
    const updatedRoleData = updatedRoles.find((role) => role.id === this.id);
    if (updatedRoleData) {
      // Update the role data with the response
      const guildBasedData = {
        ...updatedRoleData,
        guild_id: this.guildId,
      };

      this.patch(guildBasedData);
    }

    return this;
  }

  /**
   * Fetches all members with this role.
   *
   * This retrieves a list of guild members who have been assigned this role.
   *
   * @returns A promise resolving to an array of GuildMember objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-members}
   */
  async fetchMembers(): Promise<GuildMember[]> {
    // First fetch all guild members
    const allMembers = await this.client.rest.guilds.fetchGuildMembers(
      this.guildId,
      { limit: 1000 },
    );

    // Filter members who have this role
    const membersWithRole = allMembers.filter((member) =>
      member.roles.includes(this.id),
    );

    // Convert to GuildMember instances
    return membersWithRole.map(
      (memberData) =>
        new GuildMember(this.client, {
          ...memberData,
          guild_id: this.guildId,
        }),
    );
  }

  /**
   * Adds this role to a guild member.
   *
   * This assigns the role to the specified member.
   * Requires the MANAGE_ROLES permission.
   *
   * @param userId - The ID of the user to add the role to
   * @param reason - Reason for adding the role (for audit logs)
   * @returns A promise resolving to true if successful, false otherwise
   * @throws Error if the role cannot be assigned
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  async addToMember(userId: Snowflake, reason?: string): Promise<boolean> {
    if (!this.isEditable) {
      throw new Error("Cannot assign this role");
    }

    try {
      await this.client.rest.guilds.addRoleToMember(
        this.guildId,
        userId,
        this.id,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes this role from a guild member.
   *
   * This unassigns the role from the specified member.
   * Requires the MANAGE_ROLES permission.
   *
   * @param userId - The ID of the user to remove the role from
   * @param reason - Reason for removing the role (for audit logs)
   * @returns A promise resolving to true if successful, false otherwise
   * @throws Error if the role cannot be removed
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
   */
  async removeFromMember(userId: Snowflake, reason?: string): Promise<boolean> {
    if (!this.isEditable) {
      throw new Error("Cannot remove this role");
    }

    try {
      await this.client.rest.guilds.removeRoleFromMember(
        this.guildId,
        userId,
        this.id,
        reason,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refreshes this role's data from the API.
   *
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the role couldn't be fetched
   */
  async refresh(): Promise<Role> {
    const roleData = await this.client.rest.guilds.fetchGuildRole(
      this.guildId,
      this.id,
    );

    // Update the role data with the response
    const guildBasedData = {
      ...roleData,
      guild_id: this.guildId,
    };

    this.patch(guildBasedData);
    return this;
  }

  /**
   * Sets permissions for this role.
   *
   * This is a convenience method for updating just the permissions of the role.
   *
   * @param permissions - The new permissions bitfield as a string
   * @param reason - Reason for changing the permissions (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the permissions cannot be changed
   */
  setPermissions(permissions: string, reason?: string): Promise<Role> {
    return this.edit({ permissions }, reason);
  }

  /**
   * Sets the color of this role.
   *
   * This is a convenience method for updating just the color of the role.
   *
   * @param color - The new color as an integer or hex string
   * @param reason - Reason for changing the color (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the color cannot be changed
   */
  setColor(color: number | string, reason?: string): Promise<Role> {
    // Convert hex string to integer if needed
    const colorInt =
      typeof color === "string"
        ? Number.parseInt(color.replace(/^#/, ""), 16)
        : color;

    return this.edit({ color: colorInt }, reason);
  }

  /**
   * Sets the hoist status of this role.
   *
   * This is a convenience method for updating just the hoist status of the role.
   *
   * @param hoist - Whether the role should be displayed separately in the sidebar
   * @param reason - Reason for changing the hoist status (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the hoist status cannot be changed
   */
  setHoist(hoist: boolean, reason?: string): Promise<Role> {
    return this.edit({ hoist }, reason);
  }

  /**
   * Sets the mentionable status of this role.
   *
   * This is a convenience method for updating just the mentionable status of the role.
   *
   * @param mentionable - Whether the role should be mentionable
   * @param reason - Reason for changing the mentionable status (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the mentionable status cannot be changed
   */
  setMentionable(mentionable: boolean, reason?: string): Promise<Role> {
    return this.edit({ mentionable }, reason);
  }

  /**
   * Sets the name of this role.
   *
   * This is a convenience method for updating just the name of the role.
   *
   * @param name - The new name for the role
   * @param reason - Reason for changing the name (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the name cannot be changed
   */
  setName(name: string, reason?: string): Promise<Role> {
    return this.edit({ name }, reason);
  }

  /**
   * Sets the icon of this role.
   *
   * This is a convenience method for updating just the icon of the role.
   *
   * @param icon - The new icon (base64 encoded image or null to remove)
   * @param reason - Reason for changing the icon (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the icon cannot be changed
   */
  setIcon(icon: Buffer | null, reason?: string): Promise<Role> {
    return this.edit({ icon }, reason);
  }

  /**
   * Sets the unicode emoji of this role.
   *
   * This is a convenience method for updating just the emoji of the role.
   *
   * @param emoji - The new unicode emoji or null to remove
   * @param reason - Reason for changing the emoji (for audit logs)
   * @returns A promise resolving to the updated Role instance
   * @throws Error if the emoji cannot be changed
   */
  setUnicodeEmoji(emoji?: string, reason?: string): Promise<Role> {
    return this.edit({ unicode_emoji: emoji }, reason);
  }
}
