import type { Snowflake, SubscriptionStructure } from "@nyxjs/core";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params|Query String Params}
 */
export type SubscriptionQueryStringParams = QueryStringParams & {
    /**
     * User ID for which to return subscriptions. Required except for OAuth queries.
     */
    user_id?: Snowflake;
};

export class SubscriptionRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription|Get SKU Subscription}
     */
    static getSkuSubscription(skuId: Snowflake, subscriptionId: Snowflake): RouteStructure<SubscriptionStructure> {
        return {
            method: RestMethods.Get,
            path: `/skus/${skuId}/subscriptions/${subscriptionId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions|List SKU Subscriptions}
     */
    static listSkuSubscriptions(
        skuId: Snowflake,
        params?: SubscriptionQueryStringParams
    ): RouteStructure<SubscriptionStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/skus/${skuId}/subscriptions`,
            query: params,
        };
    }
}
