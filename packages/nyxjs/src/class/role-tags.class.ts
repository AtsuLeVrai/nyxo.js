import { RoleTagsEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class RoleTags extends BaseClass<RoleTagsEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof RoleTagsEntity>> = {},
  ) {
    super(client, RoleTagsEntity, entity);
  }

  get botId(): Snowflake | null {
    return this.entity.bot_id ?? null;
  }

  get integrationId(): Snowflake | null {
    return this.entity.integration_id ?? null;
  }

  get premiumSubscriber(): null {
    return this.entity.premium_subscriber ?? null;
  }

  get subscriptionListingId(): Snowflake | null {
    return this.entity.subscription_listing_id ?? null;
  }

  get availableForPurchase(): null {
    return this.entity.available_for_purchase ?? null;
  }

  get guildConnections(): null {
    return this.entity.guild_connections ?? null;
  }

  toJson(): RoleTagsEntity {
    return { ...this.entity };
  }
}

export const RoleTagsSchema = z.instanceof(RoleTags);
