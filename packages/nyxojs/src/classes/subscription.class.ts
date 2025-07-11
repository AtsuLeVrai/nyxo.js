import {
  ISO3166_ALPHA2_REGEX,
  type SubscriptionEntity,
  SubscriptionStatus,
} from "@nyxojs/core";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord subscription, providing methods to interact with and retrieve subscription data.
 *
 * The Subscription class serves as a comprehensive wrapper around Discord's subscription API, offering:
 * - Access to subscription status and period information
 * - Methods to fetch related entitlements and SKUs
 * - Utilities for checking subscription status and validity
 * - Tools for subscription period calculations
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/subscription}
 */
@Cacheable<SubscriptionEntity>("subscriptions", (data) => data.id)
export class Subscription
  extends BaseClass<SubscriptionEntity>
  implements Enforce<PropsToCamel<SubscriptionEntity>>
{
  /**
   * Gets the subscription's unique identifier (Snowflake).
   *
   * This ID is permanent and will not change for the lifetime of the subscription.
   * It can be used for API operations and persistent references, and also
   * determines the start date of the subscription.
   *
   * @returns The subscription's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the ID of the user who is subscribed.
   *
   * Identifies which user has purchased this subscription and will be
   * charged for recurring payments.
   *
   * @returns The user ID as a Snowflake string
   */
  readonly userId = this.rawData.user_id;

  /**
   * Gets the list of SKU IDs subscribed to.
   *
   * These are the premium offerings currently included in this subscription.
   * A subscription can contain multiple SKUs.
   *
   * @returns Array of SKU IDs as Snowflake strings
   */
  readonly skuIds = this.rawData.sku_ids;

  /**
   * Gets the list of entitlement IDs granted for this subscription.
   *
   * These are the actual access grants provided by this subscription
   * that should be used to determine if a user has access to premium features.
   *
   * @returns Array of entitlement IDs as Snowflake strings
   */
  readonly entitlementIds = this.rawData.entitlement_ids;

  /**
   * Gets the list of SKUs that this user will be subscribed to at renewal.
   *
   * May differ from current skuIds if the subscription plan is changing.
   * Will be null if the subscription is not scheduled to renew (status is ENDING or INACTIVE).
   *
   * @returns Array of renewal SKU IDs as Snowflake strings, or null
   */
  readonly renewalSkuIds = this.rawData.renewal_sku_ids;

  /**
   * Gets the start date of the current subscription period.
   *
   * The beginning of the current billing cycle as an ISO8601 timestamp.
   *
   * @returns The period start date as a string
   */
  readonly currentPeriodStart = this.rawData.current_period_start;

  /**
   * Gets the end date of the current subscription period.
   *
   * The end of the current billing cycle as an ISO8601 timestamp.
   * Renewal would occur at this time for ACTIVE subscriptions.
   *
   * @returns The period end date as a string
   */
  readonly currentPeriodEnd = this.rawData.current_period_end;

  /**
   * Gets the current status of the subscription.
   *
   * Indicates whether the subscription is active, ending, or inactive.
   * Note: Status should not be used to grant perks - use entitlements instead.
   *
   * @returns The subscription status
   * @see {@link https://discord.com/developers/docs/resources/subscription#subscription-object-subscription-statuses}
   */
  readonly status = this.rawData.status;

  /**
   * Gets the timestamp when the subscription was canceled.
   *
   * Contains the ISO8601 timestamp when the user requested cancellation.
   * Will be non-null when status is ENDING, null otherwise.
   *
   * @returns The cancellation timestamp, or null if not canceled
   */
  readonly canceledAt = this.rawData.canceled_at;

  /**
   * Gets the country code of the payment source used to purchase the subscription.
   *
   * This is an ISO3166-1 alpha-2 country code like "US", "CA", "GB", etc.
   * This field is missing unless queried with a private OAuth scope.
   *
   * @returns The country code as a string, or undefined if not available
   */
  readonly country = this.rawData.country;

  /**
   * Gets the Date object representing when the current period started.
   *
   * @returns The Date when the current period started
   */
  get currentPeriodStartDate(): Date {
    return new Date(this.currentPeriodStart);
  }

  /**
   * Gets the Date object representing when the current period ends.
   *
   * @returns The Date when the current period ends
   */
  get currentPeriodEndDate(): Date {
    return new Date(this.currentPeriodEnd);
  }

  /**
   * Gets the Date object representing when the subscription was canceled.
   *
   * @returns The Date when the subscription was canceled, or null if not canceled
   */
  get canceledAtDate(): Date | null {
    return this.canceledAt ? new Date(this.canceledAt) : null;
  }

  /**
   * Checks if the subscription is currently active.
   *
   * Active subscriptions will automatically renew at the end of the current period.
   *
   * @returns True if the subscription is active, false otherwise
   */
  get isActive(): boolean {
    return this.status === SubscriptionStatus.Active;
  }

  /**
   * Checks if the subscription is ending.
   *
   * Ending subscriptions are active but will not renew at the end of the current period.
   *
   * @returns True if the subscription is ending, false otherwise
   */
  get isEnding(): boolean {
    return this.status === SubscriptionStatus.Ending;
  }

  /**
   * Checks if the subscription is inactive.
   *
   * Inactive subscriptions are not being charged and provide no access to entitlements.
   *
   * @returns True if the subscription is inactive, false otherwise
   */
  get isInactive(): boolean {
    return this.status === SubscriptionStatus.Inactive;
  }

  /**
   * Checks if the subscription will renew.
   *
   * @returns True if the subscription will renew, false otherwise
   */
  get willRenew(): boolean {
    return this.isActive && this.renewalSkuIds !== null;
  }

  /**
   * Gets the duration of the current period in milliseconds.
   *
   * @returns The period duration in milliseconds
   */
  get periodDurationMs(): number {
    return (
      this.currentPeriodEndDate.getTime() -
      this.currentPeriodStartDate.getTime()
    );
  }

  /**
   * Gets the duration of the current period in days.
   *
   * @returns The period duration in days
   */
  get periodDurationDays(): number {
    return this.periodDurationMs / (1000 * 60 * 60 * 24);
  }

  /**
   * Gets the remaining time in the current period in milliseconds.
   *
   * @returns The remaining time in milliseconds
   */
  get remainingTimeMs(): number {
    return Math.max(0, this.currentPeriodEndDate.getTime() - Date.now());
  }

  /**
   * Gets the remaining time in the current period in days.
   *
   * @returns The remaining time in days
   */
  get remainingTimeDays(): number {
    return this.remainingTimeMs / (1000 * 60 * 60 * 24);
  }

  /**
   * Gets the elapsed time in the current period in milliseconds.
   *
   * @returns The elapsed time in milliseconds
   */
  get elapsedTimeMs(): number {
    return Math.max(0, Date.now() - this.currentPeriodStartDate.getTime());
  }

  /**
   * Gets the elapsed time in the current period in days.
   *
   * @returns The elapsed time in days
   */
  get elapsedTimeDays(): number {
    return this.elapsedTimeMs / (1000 * 60 * 60 * 24);
  }

  /**
   * Fetches the user who owns this subscription.
   *
   * @returns A promise resolving to the User instance
   */
  async fetchUser(): Promise<User> {
    const user = await this.client.rest.users.fetchUser(this.userId);
    return new User(this.client, user);
  }

  /**
   * Refreshes this subscription's data from the API.
   *
   * @returns A promise resolving to the updated Subscription instance
   */
  async refresh(): Promise<Subscription> {
    // Get the first SKU ID to use for fetching
    const skuId = this.skuIds[0];
    if (!skuId) {
      throw new Error("Cannot refresh subscription without a SKU ID");
    }

    const subscription = await this.client.rest.subscriptions.fetchSubscription(
      skuId,
      this.id,
    );

    this.patch(subscription);
    return this;
  }

  /**
   * Checks if the subscription has valid payment source country information.
   *
   * @returns True if the country code is valid, false otherwise
   */
  hasValidCountry(): boolean {
    if (!this.country) {
      return false;
    }
    return ISO3166_ALPHA2_REGEX.test(this.country);
  }

  /**
   * Checks if the subscription is currently in its grace period after failing to renew.
   *
   * This is an estimation based on status and dates and may not be completely accurate
   * without additional information from Discord's API.
   *
   * @returns True if the subscription appears to be in a grace period, false otherwise
   */
  isInGracePeriod(): boolean {
    // This is an example implementation - actual grace period detection would
    // depend on additional data from Discord that may not be exposed in the API
    return this.isActive && this.currentPeriodEndDate < new Date();
  }
}
