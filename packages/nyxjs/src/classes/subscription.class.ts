import type {
  Snowflake,
  SubscriptionEntity,
  SubscriptionStatus,
} from "@nyxojs/core";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce } from "../types/index.js";

@Cacheable("subscriptions")
export class Subscription
  extends BaseClass<SubscriptionEntity>
  implements Enforce<CamelCasedProperties<SubscriptionEntity>>
{
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
}
