import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { SubscriptionEntity } from "./subscription.entity.js";

export class Subscription
  extends BaseClass<SubscriptionEntity>
  implements CamelCaseKeys<SubscriptionEntity>
{
  readonly id = this.rawData.id;
  readonly userId = this.rawData.user_id;
  readonly skuIds = this.rawData.sku_ids;
  readonly entitlementIds = this.rawData.entitlement_ids;
  readonly renewalSkuIds = this.rawData.renewal_sku_ids;
  readonly currentPeriodStart = this.rawData.current_period_start;
  readonly currentPeriodEnd = this.rawData.current_period_end;
  readonly status = this.rawData.status;
  readonly canceledAt = this.rawData.canceled_at;
  readonly country = this.rawData.country;
}
