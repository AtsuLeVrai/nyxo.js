import type { Snowflake } from "@nyxjs/core";

/**
 * Interface for query parameters when listing SKU subscriptions.
 *
 * These parameters allow filtering and pagination of subscription results
 * when retrieving subscriptions for a specific SKU.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export interface SubscriptionQuerySchema {
  /**
   * List subscriptions before this ID.
   * Used for backward pagination.
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * List subscriptions after this ID.
   * Used for forward pagination.
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Number of results to return (1-100).
   * Defaults to 50 if not specified.
   *
   * @minimum 1
   * @maximum 100
   * @default 50
   * @integer
   */
  limit?: number;

  /**
   * User ID for which to return subscriptions.
   * Required except for OAuth queries.
   *
   * @optional
   */
  user_id?: Snowflake;
}
