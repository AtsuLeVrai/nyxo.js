import { RoleTagsEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class RoleTags extends BaseClass<RoleTagsEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof RoleTagsEntity>> = {},
  ) {
    super(client, RoleTagsEntity, data);
  }

  get botId(): Snowflake | null {
    return this.data.bot_id ?? null;
  }

  get integrationId(): Snowflake | null {
    return this.data.integration_id ?? null;
  }

  get premiumSubscriber(): null {
    return this.data.premium_subscriber ?? null;
  }

  get subscriptionListingId(): Snowflake | null {
    return this.data.subscription_listing_id ?? null;
  }

  get availableForPurchase(): null {
    return this.data.available_for_purchase ?? null;
  }

  get guildConnections(): null {
    return this.data.guild_connections ?? null;
  }

  toJson(): RoleTagsEntity {
    return { ...this.data };
  }
}

export const RoleTagsSchema = z.instanceof(RoleTags);
