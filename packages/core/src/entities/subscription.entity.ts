import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export const SubscriptionStatus = {
  active: 0,
  ending: 1,
  inactive: 2,
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

/**
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export const SubscriptionSchema = z
  .object({
    id: SnowflakeSchema,
    user_id: SnowflakeSchema,
    sku_ids: z.array(SnowflakeSchema),
    entitlement_ids: z.array(SnowflakeSchema),
    renewal_sku_ids: z.array(SnowflakeSchema).nullable(),
    current_period_start: z.string().datetime(),
    current_period_end: z.string().datetime(),
    status: z.nativeEnum(SubscriptionStatus),
    canceled_at: z.string().datetime().nullable(),
    country: z.string().length(2).optional(), // ISO3166-1 alpha-2 country code
  })
  .strict()
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

export type SubscriptionEntity = z.infer<typeof SubscriptionSchema>;
