import type { EntitlementStructure, Snowflake } from "@nyxjs/core";
import type { QueryStringParams, RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

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

export class EntitlementRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#delete-test-entitlement|Delete Test Entitlement}
     */
    public static deleteTestEntitlement(applicationId: Snowflake, entitlementId: Snowflake): RestRequestOptions<void> {
        return this.delete(`/applications/${applicationId}/entitlements/${entitlementId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#create-test-entitlement|Create Test Entitlement}
     */
    public static createTestEntitlement(
        applicationId: Snowflake,
        params: CreateTestEntitlementJsonParams
    ): RestRequestOptions<Omit<EntitlementStructure, "ends_at" | "starts_at">> {
        return this.post(`/applications/${applicationId}/entitlements`, {
            body: JSON.stringify(params),
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#consume-an-entitlement|Consume an Entitlement}
     */
    public static consumeEntitlement(applicationId: Snowflake, entitlementId: Snowflake): RestRequestOptions<void> {
        return this.post(`/applications/${applicationId}/entitlements/${entitlementId}/consume`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/entitlement#list-entitlements|List Entitlements}
     */
    public static listEntitlements(
        applicationId: Snowflake,
        params?: ListEntitlementsQueryStringParams
    ): RestRequestOptions<EntitlementStructure[]> {
        return this.get(`/applications/${applicationId}/entitlements`, {
            query: params,
        });
    }
}
