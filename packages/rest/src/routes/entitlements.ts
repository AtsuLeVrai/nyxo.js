import type { Snowflake } from "@nyxjs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";
import type { CreateTestEntitlementJSONParams, ListEntitlementsQueryStringParams } from "../pipes/entitlements";
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
 * @see {@link https://discord.com/developers/docs/monetization/entitlements#list-entitlements}
 */
export function listEntitlements(applicationId: Snowflake, query?: ListEntitlementsQueryStringParams): RESTMakeRequestOptions<EntitlementStructure[]> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/entitlements`,
		query,
	};
}
