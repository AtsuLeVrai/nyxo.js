import type { IsoO8601Timestamp, Snowflake } from "../libs/formats";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export enum SubscriptionStatus {
    /**
     * Subscription is active and scheduled to renew.
     */
    Active = 1,
    /**
     * Subscription is active but will not renew.
     */
    Ending = 2,
    /**
     * Subscription is inactive and not being charged.
     */
    Inactive = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export type SubscriptionStructure = {
    /**
     * When the subscription was canceled
     */
    canceled_at: IsoO8601Timestamp | null;
    /**
     * ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription. Missing unless queried with a private OAuth scope.
     */
    country?: string;
    /**
     * End of the current subscription period
     */
    current_period_end: IsoO8601Timestamp;
    /**
     * Start of the current subscription period
     */
    current_period_start: IsoO8601Timestamp;
    /**
     * List of entitlements granted for this subscription
     */
    entitlement_ids: Snowflake[];
    /**
     * ID of the subscription
     */
    id: Snowflake;
    /**
     * List of SKUs subscribed to
     */
    sku_ids: Snowflake[];
    /**
     * Current status of the subscription
     */
    status: SubscriptionStatus;
    /**
     * ID of the user who is subscribed
     */
    user_id: Snowflake;
};
