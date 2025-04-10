import type { RoleTagsEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class RoleTags
  extends BaseClass<RoleTagsEntity>
  implements EnforceCamelCase<RoleTagsEntity>
{
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
