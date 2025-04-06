import {
  BitFieldManager,
  type RoleEntity,
  type RoleFlags,
  type RoleTagsEntity,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";

export class RoleTags extends BaseClass<RoleTagsEntity> {
  get botId(): Snowflake | undefined {
    return this.data.bot_id;
  }

  get integrationId(): Snowflake | undefined {
    return this.data.integration_id;
  }

  get premiumSubscriber(): null | undefined {
    return this.data.premium_subscriber;
  }

  get subscriptionListingId(): Snowflake | undefined {
    return this.data.subscription_listing_id;
  }

  get availableForPurchase(): null | undefined {
    return this.data.available_for_purchase;
  }

  get guildConnections(): null | undefined {
    return this.data.guild_connections;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    // Role tags are not stored independently, they're part of a role
    return null;
  }
}

export class Role extends BaseClass<RoleEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get color(): number {
    return this.data.color;
  }

  get hoist(): boolean {
    return Boolean(this.data.hoist);
  }

  get icon(): string | null | undefined {
    return this.data.icon;
  }

  get unicodeEmoji(): string | null | undefined {
    return this.data.unicode_emoji;
  }

  get position(): number {
    return this.data.position;
  }

  get permissions(): string {
    return this.data.permissions;
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get mentionable(): boolean {
    return Boolean(this.data.mentionable);
  }

  get tags(): RoleTags | undefined {
    if (!this.data.tags) {
      return undefined;
    }

    return RoleTags.from(this.client, this.data.tags);
  }

  get flags(): BitFieldManager<RoleFlags> {
    return new BitFieldManager<RoleFlags>(this.data.flags);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "roles",
      id: this.id,
    };
  }
}
