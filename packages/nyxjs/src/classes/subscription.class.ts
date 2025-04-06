import type {
  Snowflake,
  SubscriptionEntity,
  SubscriptionStatus,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";

export class Subscription extends BaseClass<SubscriptionEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get skuIds(): Snowflake[] {
    return this.data.sku_ids;
  }

  get entitlementIds(): Snowflake[] {
    return this.data.entitlement_ids;
  }

  get renewalSkuIds(): Snowflake[] | null {
    return this.data.renewal_sku_ids;
  }

  get currentPeriodStart(): string {
    return this.data.current_period_start;
  }

  get currentPeriodEnd(): string {
    return this.data.current_period_end;
  }

  get status(): SubscriptionStatus {
    return this.data.status;
  }

  get canceledAt(): string | null {
    return this.data.canceled_at;
  }

  get country(): string | undefined {
    return this.data.country;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "subscriptions",
      id: this.id,
    };
  }
}
