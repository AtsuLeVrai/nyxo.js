import { Snowflake, SubscriptionEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for query parameters when listing SKU subscriptions.
 *
 * These parameters allow filtering and pagination of subscription results
 * when retrieving subscriptions for a specific SKU.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription#query-string-params}
 */
export const SubscriptionQuerySchema = z.object({
  /**
   * List subscriptions before this ID.
   * Used for backward pagination.
   */
  before: Snowflake.optional(),

  /**
   * List subscriptions after this ID.
   * Used for forward pagination.
   */
  after: Snowflake.optional(),

  /**
   * Number of results to return (1-100).
   * Defaults to 50 if not specified.
   */
  limit: z.number().int().min(1).max(100).default(50),

  /**
   * User ID for which to return subscriptions.
   * Required except for OAuth queries.
   *
   * Reuses the validation from SubscriptionEntity.
   */
  user_id: SubscriptionEntity.shape.user_id.optional(),
});

export type SubscriptionQuerySchema = z.input<typeof SubscriptionQuerySchema>;
