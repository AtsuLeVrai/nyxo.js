import type { IsoO8601Timestamp, Snowflake } from "../utils/formats";

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#entitlement-object-entitlement-types}
 */
export enum EntitlementTypes {
    /**
     * Entitlement was purchased by user
     */
    Purchase = 1,
    /**
     * Entitlement for Discord Nitro subscription
     */
    PremiumSubscription = 2,
    /**
     * Entitlement was gifted by developer
     */
    DeveloperGift = 3,
    /**
     * Entitlement was purchased by a dev in application test mode
     */
    TestModePurchase = 4,
    /**
     * Entitlement was granted when the SKU was free
     */
    FreePurchase = 5,
    /**
     * Entitlement was gifted by another user
     */
    UserGift = 6,
    /**
     * Entitlement was claimed by user for free as a Nitro Subscriber
     */
    PremiumPurchase = 7,
    /**
     * Entitlement was purchased as an app subscription
     */
    ApplicationSubscription = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#entitlement-object-entitlement-structure}
 */
export type EntitlementStructure = {
    /**
     * ID of the parent application
     */
    application_id: Snowflake;
    /**
     * For consumable items, whether or not the entitlement has been consumed
     */
    consumed?: boolean;
    /**
     * Entitlement was deleted
     */
    deleted: boolean;
    /**
     * Date at which the entitlement is no longer valid. Not present when using test entitlements.
     */
    ends_at?: IsoO8601Timestamp;
    /**
     * ID of the guild that is granted access to the entitlement's sku
     */
    guild_id?: Snowflake;
    /**
     * ID of the entitlement
     */
    id: Snowflake;
    /**
     * ID of the SKU
     */
    sku_id: Snowflake;
    /**
     * Start date at which the entitlement is valid. Not present when using test entitlements.
     */
    starts_at?: IsoO8601Timestamp;
    /**
     * Type of entitlement
     */
    type: EntitlementTypes;
    /**
     * ID of the user that is granted access to the entitlement's sku
     */
    user_id?: Snowflake;
};
