/**
 * @description Discord subscription status indicating the current state of a user's subscription.
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export enum SubscriptionStatus {
  /** Subscription is active and scheduled to renew */
  Active = 0,
  /** Subscription is active but will not renew */
  Ending = 1,
  /** Subscription is inactive and not being charged */
  Inactive = 2,
}

/**
 * @description Represents a Discord user's subscription for recurring payments to SKUs.
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export interface SubscriptionEntity {
  /** Unique snowflake identifier for the subscription */
  id: string;
  /** Snowflake ID of the user who is subscribed */
  user_id: string;
  /** Array of SKU snowflake IDs subscribed to */
  sku_ids: string[];
  /** Array of entitlement snowflake IDs granted for this subscription */
  entitlement_ids: string[];
  /** Array of SKU IDs that user will be subscribed to at renewal (null if no renewal) */
  renewal_sku_ids: string[] | null;
  /** ISO8601 timestamp of current subscription period start */
  current_period_start: string;
  /** ISO8601 timestamp of current subscription period end */
  current_period_end: string;
  /** Current status of the subscription */
  status: SubscriptionStatus;
  /** ISO8601 timestamp when subscription was canceled (null if not canceled) */
  canceled_at: string | null;
  /** ISO3166-1 alpha-2 country code of payment source (requires private OAuth scope) */
  country?: string;
}
