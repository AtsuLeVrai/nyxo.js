import type { Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export interface SubscriptionEntity {
  id: Snowflake;
  user_id: Snowflake;
  sku_ids: Snowflake[];
  entitlement_ids: Snowflake[];
  renewal_sku_ids: Snowflake[] | null;
  current_period_start: Iso8601;
  current_period_end: Iso8601;
  status: SubscriptionStatus;
  canceled_at: Iso8601 | null;
  country?: string;
}
