import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Represents the possible statuses of a subscription in Discord.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Subscription.md#subscription-statuses}
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
 * Regex for validating ISO3166-1 alpha-2 country codes
 * These are two-letter country codes like US, CA, GB, etc.
 */
const ISO3166_ALPHA2_REGEX = /^[A-Z]{2}$/;

/**
 * Represents a subscription in Discord where a user makes recurring payments for at least one SKU.
 * Successful payments grant the user access to entitlements associated with the SKU.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Subscription.md#subscription-object}
 */
export const SubscriptionEntity = z
  .object({
    /** ID of the subscription */
    id: Snowflake,

    /** ID of the user who is subscribed */
    user_id: Snowflake,

    /** List of SKUs subscribed to */
    sku_ids: Snowflake.array(),

    /** List of entitlements granted for this subscription */
    entitlement_ids: Snowflake.array(),

    /** List of SKUs that this user will be subscribed to at renewal */
    renewal_sku_ids: Snowflake.array().nullable(),

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
    country: z
      .string()
      .regex(ISO3166_ALPHA2_REGEX, {
        message:
          "Country must be a valid ISO3166-1 alpha-2 country code (e.g., US, CA, GB)",
      })
      .optional(),
  })
  .refine(
    (subscription) => {
      // If status is Ending, canceled_at should not be null
      if (subscription.status === SubscriptionStatus.Ending) {
        return subscription.canceled_at !== null;
      }
      return true;
    },
    {
      message:
        "When subscription status is ENDING, canceled_at should not be null",
      path: ["canceled_at"],
    },
  );

export type SubscriptionEntity = z.infer<typeof SubscriptionEntity>;
