import type { RoleTagsEntity, Snowflake } from "@nyxjs/core";
import { BitFieldManager, type RoleEntity, type RoleFlags } from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";

/**
 * Represents the tags associated with a Discord role.
 *
 * Role tags contain extra information about a role, such as if it belongs to a bot,
 * integration, or if it's a premium subscriber role.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-tags-structure}
 */
export class RoleTags extends BaseClass<RoleTagsEntity> {
  /**
   * The ID of the bot this role belongs to
   */
  get botId(): Snowflake | undefined {
    return this.data.bot_id;
  }

  /**
   * The ID of the integration this role belongs to
   */
  get integrationId(): Snowflake | undefined {
    return this.data.integration_id;
  }

  /**
   * Whether this role is the premium subscriber role for the guild
   * When the premium_subscriber field is null, this role is the premium subscriber role
   */
  get isPremiumSubscriber(): boolean {
    return this.data.premium_subscriber === null;
  }

  /**
   * The ID of this role's subscription SKU and listing
   */
  get subscriptionListingId(): Snowflake | undefined {
    return this.data.subscription_listing_id;
  }

  /**
   * Whether this role is available for purchase
   * When the available_for_purchase field is null, this role is available for purchase
   */
  get isAvailableForPurchase(): boolean {
    return this.data.available_for_purchase === null;
  }

  /**
   * Whether this role is a guild's linked role
   * When the guild_connections field is null, this role is a linked role
   */
  get hasGuildConnections(): boolean {
    return this.data.guild_connections === null;
  }
}

/**
 * Represents a Discord role.
 *
 * Roles in Discord are a powerful way to grant users permissions. Roles can have permissions attached to them,
 * which will automatically be granted to users with that role. Roles also display a color and can be configured
 * to appear separately from online users in the user list.
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object}
 */
export class Role extends BaseClass<RoleEntity & { guild_id: Snowflake }> {
  /**
   * The unique ID of this role
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The ID of the guild this role belongs to
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * The name of the role (1-100 characters)
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The integer representation of hexadecimal color code
   */
  get color(): number {
    return this.data.color;
  }

  /**
   * Whether the role is pinned in the user listing (shown separately in the sidebar)
   */
  get hoist(): boolean {
    return Boolean(this.data.hoist);
  }

  /**
   * The role icon hash
   */
  get icon(): string | null {
    return this.data.icon ?? null;
  }

  /**
   * The role unicode emoji
   */
  get unicodeEmoji(): string | null {
    return this.data.unicode_emoji ?? null;
  }

  /**
   * The position of the role in the guild's role hierarchy
   */
  get position(): number {
    return this.data.position;
  }

  /**
   * The permission bit set as a string representation of a large integer
   */
  get permissions(): string {
    return this.data.permissions;
  }

  /**
   * Whether this role is managed by an integration
   */
  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  /**
   * Whether this role is mentionable
   */
  get mentionable(): boolean {
    return Boolean(this.data.mentionable);
  }

  /**
   * The tags of the role
   */
  get tags(): RoleTags | undefined {
    if (!this.data.tags) {
      return undefined;
    }

    return new RoleTags(this.client, this.data.tags);
  }

  /**
   * The flags of the role as a BitFieldManager
   */
  get flags(): BitFieldManager<RoleFlags> {
    return new BitFieldManager<RoleFlags>(this.data.flags);
  }
}
