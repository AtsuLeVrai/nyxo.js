/**
 * Status values representing the current state of a Discord subscription.
 * Determines billing behavior, renewal scheduling, and user access to premium features.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses} for subscription status specification
 */
export enum SubscriptionStatus {
  /** Subscription is active and scheduled to automatically renew */
  Active = 0,
  /** Subscription is active but will not renew (user cancelled) */
  Ending = 1,
  /** Subscription is inactive and not being charged */
  Inactive = 2,
}

/**
 * Discord subscription representing recurring payments for SKUs over an ongoing period.
 * Successful payments grant users access to entitlements associated with subscribed SKUs.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object} for subscription object specification
 */
export interface SubscriptionObject {
  /** Unique identifier for the subscription */
  readonly id: string;
  /** User who owns this subscription */
  readonly user_id: string;
  /** List of SKUs currently included in this subscription */
  readonly sku_ids: string[];
  /** List of entitlements granted through this subscription */
  readonly entitlement_ids: string[];
  /** SKUs that will be included when subscription renews (null if no changes) */
  readonly renewal_sku_ids: string[] | null;
  /** Start timestamp of the current billing period */
  readonly current_period_start: string;
  /** End timestamp of the current billing period */
  readonly current_period_end: string;
  /** Current subscription status affecting billing and access */
  readonly status: SubscriptionStatus;
  /** Timestamp when subscription was cancelled (null if not cancelled) */
  readonly canceled_at: string | null;
  /** ISO3166-1 alpha-2 country code of payment source (requires private OAuth scope) */
  readonly country?: string;
}

/**
 * Query parameters for filtering and paginating SKU subscription lists.
 * Supports user filtering and cursor-based pagination for subscription retrieval.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions} for list subscriptions endpoint
 */
export interface ListSKUSubscriptionsQueryStringParams
  extends Partial<Pick<SubscriptionObject, "user_id">> {
  /** List subscriptions created before this subscription ID */
  readonly before?: string;
  /** List subscriptions created after this subscription ID */
  readonly after?: string;
  /** Maximum number of subscriptions to return (1-100, default 50) */
  readonly limit?: number;
}
