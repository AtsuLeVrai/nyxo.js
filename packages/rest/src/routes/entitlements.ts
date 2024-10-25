import type { EntitlementStructure, Snowflake } from "@nyxjs/core";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement-json-params|Create Test Entitlement JSON Params}
 */
export type CreateTestEntitlementJsonParams = {
    /**
     * ID of the guild or user to grant the entitlement to
     */
    owner_id: Snowflake;
    /**
     * 1 for a guild subscription, 2 for a user subscription
     */
    owner_type: 1 | 2;
    /**
     * ID of the SKU to grant the entitlement to
     */
    sku_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements-query-string-params|List Entitlements Query String Params}
 */
export type ListEntitlementsQueryStringParams = QueryStringParams & {
    /**
     * Whether or not ended entitlements should be omitted
     */
    exclude_ended?: boolean;
    /**
     * Guild ID to look up entitlements for
     */
    guild_id?: Snowflake;
    /**
     * Optional list of SKU IDs to check entitlements for
     */
    sku_ids?: Snowflake;
    /**
     * User ID to look up entitlements for
     */
    user_id?: Snowflake;
};

export class EntitlementRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement|Delete Test Entitlement}
     */
    static deleteTestEntitlement(applicationId: Snowflake, entitlementId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/applications/${applicationId}/entitlements/${entitlementId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement|Create Test Entitlement}
     */
    static createTestEntitlement(
        applicationId: Snowflake,
        params: CreateTestEntitlementJsonParams
    ): RouteStructure<Omit<EntitlementStructure, "ends_at" | "starts_at">> {
        return {
            method: RestMethods.Post,
            path: `/applications/${applicationId}/entitlements`,
            body: Buffer.from(JSON.stringify(params)),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement|Consume an Entitlement}
     */
    static consumeEntitlement(applicationId: Snowflake, entitlementId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Post,
            path: `/applications/${applicationId}/entitlements/${entitlementId}/consume`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements|List Entitlements}
     */
    static listEntitlements(
        applicationId: Snowflake,
        params?: ListEntitlementsQueryStringParams
    ): RouteStructure<EntitlementStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/applications/${applicationId}/entitlements`,
            query: params,
        };
    }
}
