import type { Snowflake } from "../utils/index.js";

/**
 * Represents the possible statuses of a subscription in Discord.
 * The status indicates whether a subscription is actively recurring, scheduled to end, or already inactive.
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object-subscription-statuses}
 */
export enum SubscriptionStatus {
  /**
   * Subscription is active and scheduled to renew (0)
   * The user will be charged at the end of the current period
   * Access to the associated entitlements is granted
   */
  Active = 0,

  /**
   * Subscription is active but will not renew (1)
   * The user has canceled but still has access until the end of the current period
   * When status is ENDING, the canceled_at timestamp will reflect the cancellation time
   */
  Ending = 1,

  /**
   * Subscription is inactive and not being charged (2)
   * The user is not being charged and has no access to the associated entitlements
   * This may occur due to payment failure, refund, chargeback, or manual cancellation by an administrator
   */
  Inactive = 2,
}

/**
 * Regex for validating ISO3166-1 alpha-2 country codes
 * These are two-letter country codes like US (United States), CA (Canada), GB (United Kingdom), etc.
 * Used to validate the country field in subscriptions which represents the payment source location.
 */
export const ISO3166_ALPHA2_REGEX = /^[A-Z]{2}$/;

/**
 * Represents a subscription in Discord where a user makes recurring payments for at least one SKU.
 * Successful payments grant the user access to entitlements associated with the SKU.
 *
 * @remarks
 * - The start of a subscription is determined by its ID
 * - When a subscription renews, its current period is updated
 * - Subscriptions can start and change between any status within the current period
 * - A subscription can be ACTIVE outside its current period (e.g., while retrying a failed payment)
 * - A subscription can be INACTIVE within its current period (e.g., after a refund or chargeback)
 * - For access control, use entitlements rather than subscription status
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export interface SubscriptionEntity {
  /**
   * ID of the subscription
   * Unique identifier of the subscription, also determines the start date
   */
  id: Snowflake;

  /**
   * ID of the user who is subscribed
   * Identifies which user has purchased this subscription
   */
  user_id: Snowflake;

  /**
   * List of SKUs subscribed to
   * The premium offerings currently included in this subscription
   */
  sku_ids: Snowflake[];

  /**
   * List of entitlements granted for this subscription
   * The actual access grants provided by this subscription
   * These should be used to determine if a user has access to premium features
   */
  entitlement_ids: Snowflake[];

  /**
   * List of SKUs that this user will be subscribed to at renewal
   * May differ from current sku_ids if the subscription plan is changing
   * Will be null if the subscription is not scheduled to renew (status is ENDING or INACTIVE)
   */
  renewal_sku_ids: Snowflake[] | null;

  /**
   * Start date of the current subscription period
   * The beginning of the current billing cycle
   */
  current_period_start: string;

  /**
   * End date of the current subscription period
   * The end of the current billing cycle, when renewal would occur for ACTIVE subscriptions
   */
  current_period_end: string;

  /**
   * Current status of the subscription
   * Indicates whether the subscription is active, ending, or inactive
   * Note: Status should not be used to grant perks - use entitlements instead
   */
  status: SubscriptionStatus;

  /**
   * When the subscription was canceled (null if not canceled)
   * Contains the timestamp when the user requested cancellation
   * Will be non-null when status is ENDING
   */
  canceled_at: string | null;

  /**
   * ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription.
   * Examples: "US", "CA", "GB", "AU", "DE", etc.
   * This field is missing unless queried with a private OAuth scope.
   */
  country?: string;
}
