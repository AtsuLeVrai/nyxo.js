import type { Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";

/**
 * Represents the status of a Discord subscription.
 *
 * @remarks
 * A subscription can change between any of these statuses within the current period.
 * Status should not be used to grant perks - use entitlements instead.
 *
 * @example
 * ```typescript
 * const status: SubscriptionStatus = SubscriptionStatus.Active;
 * ```
 *
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
 * Represents a Discord subscription for recurring payments.
 *
 * @remarks
 * Subscriptions represent a user making recurring payments for at least one SKU over an ongoing period.
 * Successful payments grant the user access to entitlements associated with the SKU.
 * The start of a subscription is determined by its ID, and when it renews, its current period is updated.
 *
 * @example
 * ```typescript
 * const subscription: SubscriptionEntity = {
 *   id: "1278078770116427839",
 *   user_id: "1088605110638227537",
 *   sku_ids: ["1158857122189168803"],
 *   entitlement_ids: [],
 *   current_period_start: "2024-08-27T19:48:44.406602+00:00",
 *   current_period_end: "2024-09-27T19:48:44.406602+00:00",
 *   status: SubscriptionStatus.Active,
 *   canceled_at: null
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
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
  /** Start of the current subscription period */
  current_period_start: Iso8601;
  /** End of the current subscription period */
  current_period_end: Iso8601;
  /** Current status of the subscription */
  status: SubscriptionStatus;
  /** When the subscription was canceled, null if not canceled */
  canceled_at: Iso8601 | null;
  /** ISO3166-1 alpha-2 country code of the payment source. Only present with private OAuth scope */
  country?: string;
}
