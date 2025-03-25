import type { Snowflake } from "../managers/index.js";

/**
 * Represents the possible statuses of a subscription in Discord.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Subscription.md#subscription-statuses}
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
 * Regex for validating ISO3166-1 alpha-2 country codes
 * These are two-letter country codes like US, CA, GB, etc.
 */
export const ISO3166_ALPHA2_REGEX = /^[A-Z]{2}$/;

/**
 * Represents a subscription in Discord where a user makes recurring payments for at least one SKU.
 * Successful payments grant the user access to entitlements associated with the SKU.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Subscription.md#subscription-object}
 * @validate When subscription status is ENDING, canceled_at should not be null
 */
export interface SubscriptionEntity {
  /** ID of the subscription */
  id: Snowflake;

  /** ID of the user who is subscribed */
  user_id: Snowflake;

  /** List of SKUs subscribed to */
  sku_ids: Snowflake[];

  /** List of entitlements granted for this subscription */
  entitlement_ids: Snowflake[];

  /** List of SKUs that this user will be subscribed to at renewal */
  renewal_sku_ids: Snowflake[] | null;

  /**
   * Start date of the current subscription period
   * @format datetime
   */
  current_period_start: string;

  /**
   * End date of the current subscription period
   * @format datetime
   */
  current_period_end: string;

  /** Current status of the subscription */
  status: SubscriptionStatus;

  /**
   * When the subscription was canceled (null if not canceled)
   * @format datetime
   * @nullable
   */
  canceled_at: string | null;

  /**
   * ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription.
   * Missing unless queried with a private OAuth scope.
   * @pattern ^[A-Z]{2}$ Country must be a valid ISO3166-1 alpha-2 country code (e.g., US, CA, GB)
   * @optional
   */
  country?: string;
}
