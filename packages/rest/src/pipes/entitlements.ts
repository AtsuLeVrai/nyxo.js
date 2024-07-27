import type { Boolean, Integer, Snowflake } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#create-test-entitlement-json-params}
 */
export type CreateTestEntitlementJSONParams = {
	/**
	 * ID of the guild or user to grant the entitlement to
	 */
	owner_id: string;
	/**
	 * 1 for a guild subscription, 2 for a user subscription
	 */
	owner_type: 1 | 2;
	/**
	 * ID of the SKU to grant the entitlement to
	 */
	sku_id: string;
};

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#list-entitlements-query-string-params}
 */
export type ListEntitlementsQueryStringParams = {
	/**
	 * Retrieve entitlements after this entitlement ID
	 */
	after?: Snowflake;
	/**
	 * Retrieve entitlements before this entitlement ID
	 */
	before?: Snowflake;
	/**
	 * Whether or not ended entitlements should be omitted
	 */
	exclude_ended?: Boolean;
	/**
	 * Guild ID to look up entitlements for
	 */
	guild_id?: Snowflake;
	/**
	 * Number of entitlements to return, 1-100, default 100
	 */
	limit?: Integer;
	/**
	 * Optional list of SKU IDs to check entitlements for
	 */
	sku_ids?: Snowflake;
	/**
	 * User ID to look up entitlements for
	 */
	user_id?: Snowflake;
};
