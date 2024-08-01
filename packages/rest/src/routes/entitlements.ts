import type { Integer, Snowflake } from "@nyxjs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";
import type { EntitlementStructure } from "../structures/entitlements";

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#delete-test-entitlement}
 */
export function deleteTestEntitlement(applicationId: Snowflake, skuId: Snowflake): RESTMakeRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/applications/${applicationId}/entitlements/${skuId}`,
	};
}

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
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#create-test-entitlement}
 */
export function createTestEntitlement(applicationId: Snowflake, params: CreateTestEntitlementJSONParams): RESTMakeRequestOptions<Omit<EntitlementStructure, "ends_at" | "starts_at">> {
	return {
		method: "POST",
		path: `/applications/${applicationId}/entitlements`,
		body: JSON.stringify(params),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#consume-an-entitlement}
 */
export function consumeEntitlement(applicationId: Snowflake, entitlementId: Snowflake): RESTMakeRequestOptions<void> {
	return {
		method: "POST",
		path: `/applications/${applicationId}/entitlements/${entitlementId}/consume`,
	};
}

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

/**
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#list-entitlements}
 */
export function listEntitlements(applicationId: Snowflake, query?: ListEntitlementsQueryStringParams): RESTMakeRequestOptions<EntitlementStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/entitlements`,
		query,
	};
}
