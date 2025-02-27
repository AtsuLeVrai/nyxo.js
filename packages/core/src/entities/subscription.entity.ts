import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Represents the possible statuses of a subscription in Discord.
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-statuses}
 */
export enum SubscriptionStatus {
  /** Subscription is active and scheduled to renew */
  Active = 0,

  /** Subscription is active but will not renew */
  Ending = 1,

  /** Subscription is inactive and not being charged */
  Inactive = 2,
}

/**
 * Represents a subscription in Discord where a user makes recurring payments for at least one SKU.
 * Successful payments grant the user access to entitlements associated with the SKU.
 * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object}
 */
export const SubscriptionEntity = z
  .object({
    /** ID of the subscription */
    id: Snowflake,

    /** ID of the user who is subscribed */
    user_id: Snowflake,

    /** List of SKUs subscribed to */
    sku_ids: z.array(Snowflake),

    /** List of entitlements granted for this subscription */
    entitlement_ids: z.array(Snowflake),

    /** List of SKUs that this user will be subscribed to at renewal */
    renewal_sku_ids: z.array(Snowflake).nullable(),

    /** Start date of the current subscription period */
    current_period_start: z.string().datetime(),

    /** End date of the current subscription period */
    current_period_end: z.string().datetime(),

    /** Current status of the subscription */
    status: z.nativeEnum(SubscriptionStatus),

    /** When the subscription was canceled (null if not canceled) */
    canceled_at: z.string().datetime().nullable(),

    /**
     * ISO3166-1 alpha-2 country code of the payment source used to purchase the subscription.
     * Missing unless queried with a private OAuth scope.
     */
    country: z.string().length(2).optional(),
  })
  .refine(
    (data) => {
      // ENDING status (1) requires a canceled_at date
      if (data.status === SubscriptionStatus.Ending && !data.canceled_at) {
        return false;
      }

      // End period must be after start period
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
