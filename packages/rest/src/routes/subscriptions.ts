import type { Integer, Snowflake, SubscriptionStructure } from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export type ListSkuSubscriptionsQuery = {
    /**
     * List subscriptions after this ID
     */
    after?: Snowflake;
    /**
     * List subscriptions before this ID
     */
    before?: Snowflake;
    /**
     * Number of results to return (1-100)
     */
    limit?: Integer;
    /**
     * User ID for which to return subscriptions. Required except for OAuth queries.
     */
    user_id?: Snowflake;
};

export const SubscriptionRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#get-sku-subscription}
     */
    getSkuSubscription: (skuId: Snowflake, subscriptionId: Snowflake): RestRequestOptions<SubscriptionStructure> => ({
        method: "GET",
        path: `/skus/${skuId}/subscriptions/${subscriptionId}`,
    }),
    /**
     * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
     */
    listSkuSubscriptions: (
        skuId: Snowflake,
        query?: ListSkuSubscriptionsQuery
    ): RestRequestOptions<SubscriptionStructure[]> => ({
        method: "GET",
        path: `/skus/${skuId}/subscriptions`,
        query,
    }),
};
