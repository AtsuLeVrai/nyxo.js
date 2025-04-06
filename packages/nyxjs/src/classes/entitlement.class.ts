import type {
  EntitlementEntity,
  EntitlementType,
  Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";

export class Entitlement extends BaseClass<EntitlementEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get userId(): Snowflake | undefined {
    return this.data.user_id;
  }

  get type(): EntitlementType {
    return this.data.type;
  }

  get deleted(): boolean {
    return Boolean(this.data.deleted);
  }

  get startsAt(): string | null {
    return this.data.starts_at;
  }

  get endsAt(): string | null {
    return this.data.ends_at;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get consumed(): boolean {
    return Boolean(this.data.consumed);
  }

  get promotionId(): Snowflake | null | undefined {
    return this.data.promotion_id;
  }

  get subscriptionId(): Snowflake | null | undefined {
    return this.data.subscription_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "entitlements",
      id: this.id,
    };
  }
}
