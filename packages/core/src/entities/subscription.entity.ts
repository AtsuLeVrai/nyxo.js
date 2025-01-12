import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export enum SubscriptionStatus {
  Active = 0,
  Ending = 1,
  Inactive = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export const SubscriptionEntity = z
  .object({
    id: Snowflake,
    user_id: Snowflake,
    sku_ids: z.array(Snowflake),
    entitlement_ids: z.array(Snowflake),
    renewal_sku_ids: z.array(Snowflake).nullable(),
    current_period_start: z.string().datetime(),
    current_period_end: z.string().datetime(),
    status: z.nativeEnum(SubscriptionStatus),
    canceled_at: z.string().datetime().nullable(),
    country: z.string().length(2).optional(), // ISO3166-1 alpha-2 country code
  })
  .refine(
    (data) => {
      if (data.status === 1 && !data.canceled_at) {
        return false;
      }

      const start = new Date(data.current_period_start);
      const end = new Date(data.current_period_end);
      return end > start;
    },
    {
      message:
        "Invalid subscription state: ENDING status requires canceled_at date and end period must be after start period",
    },
  );

export type SubscriptionEntity = z.infer<typeof SubscriptionEntity>;
