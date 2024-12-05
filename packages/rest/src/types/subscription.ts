import type { Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#list-sku-subscriptions}
 */
export interface SubscriptionQueryEntity {
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
  user_id?: Snowflake;
}
