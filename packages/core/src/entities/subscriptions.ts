import type { Iso8601, Snowflake } from "../formatting/index.js";

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
  current_period_start: Iso8601;
  current_period_end: Iso8601;
  status: SubscriptionStatus;
  canceled_at: Iso8601 | null;
  country?: string;
}
