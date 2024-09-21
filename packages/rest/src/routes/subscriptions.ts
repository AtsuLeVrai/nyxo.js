import type { Snowflake, SubscriptionStructure } from "@nyxjs/core";
import type { QueryStringParams, RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params|Query String Params}
 */
export type SubscriptionQueryStringParams = QueryStringParams & {
    /**
     * User ID for which to return subscriptions. Required except for OAuth queries.
     */
    user_id?: Snowflake;
};

export class SubscriptionRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription|Get SKU Subscription}
     */
    public static getSkuSubscription(
        skuId: Snowflake,
        subscriptionId: Snowflake
    ): RestRequestOptions<SubscriptionStructure> {
        return this.get(`/skus/${skuId}/subscriptions/${subscriptionId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions|List SKU Subscriptions}
     */
    public static listSkuSubscriptions(
        skuId: Snowflake,
        params?: SubscriptionQueryStringParams
    ): RestRequestOptions<SubscriptionStructure[]> {
        return this.get(`/skus/${skuId}/subscriptions`, {
            query: params,
        });
    }
}
