import type { Iso8601Timestamp, Snowflake } from "../markdown";

/**
 * Enum representing the subscription statuses.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses|Subscription Statuses}
 */
export enum SubscriptionStatus {
    /**
     * Subscription is active and scheduled to renew.
     */
    Active = 0,
    /**
     * Subscription is active but will not renew.
     */
    Ending = 1,
    /**
     * Subscription is inactive and not being charged.
     */
    Inactive = 2,
}

/**
 * Type representing the structure of a subscription.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object|Subscription Object}
 */
export type SubscriptionStructure = {
    /**
     * When the subscription was canceled.
     */
    canceled_at: Iso8601Timestamp | null;
    /**
     * ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription.
     * Missing unless queried with a private OAuth scope.
     */
    country?: string;
    /**
     * End of the current subscription period.
     */
    current_period_end: Iso8601Timestamp;
    /**
     * Start of the current subscription period.*
     */
    current_period_start: Iso8601Timestamp;
    /**
     * List of entitlements granted for this subscription.
     */
    entitlement_ids: Snowflake[];
    /**
     * ID of the subscription.
     */
    id: Snowflake;
    /**
     * List of SKUs subscribed to.
     */
    sku_ids: Snowflake[];
    /**
     * Current status of the subscription.
     */
    status: SubscriptionStatus;
    /**
     * ID of the user who is subscribed.
     */
    user_id: Snowflake;
};
