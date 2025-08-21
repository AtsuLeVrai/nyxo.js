import type { Snowflake } from "../common/index.js";

export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

export interface SubscriptionObject {
  id: Snowflake;
  user_id: Snowflake;
  sku_ids: Snowflake[];
  entitlement_ids: Snowflake[];
  renewal_sku_ids: Snowflake[] | null;
  current_period_start: string;
  current_period_end: string;
  status: SubscriptionStatus;
  canceled_at: string | null;
  country?: string;
}
