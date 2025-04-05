import {
  type Snowflake,
  type SubscriptionEntity,
  SubscriptionStatus,
} from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a subscription in Discord where a user makes recurring payments for at least one SKU.
 * Successful payments grant the user access to entitlements associated with the SKU.
 *
 * @see {@link https://discord.com/developers/docs/resources/Subscription}
 */
export class Subscription extends BaseClass<SubscriptionEntity> {
  /**
   * The ID of this subscription
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The ID of the user who is subscribed
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * List of SKUs subscribed to
   */
  get skuIds(): Snowflake[] {
    return this.data.sku_ids || [];
  }

  /**
   * List of entitlements granted for this subscription
   */
  get entitlementIds(): Snowflake[] {
    return this.data.entitlement_ids || [];
  }

  /**
   * List of SKUs that this user will be subscribed to at renewal
   */
  get renewalSkuIds(): Snowflake[] | null {
    return this.data.renewal_sku_ids || null;
  }

  /**
   * Start date of the current subscription period
   */
  get currentPeriodStart(): string {
    return this.data.current_period_start;
  }

  /**
   * End date of the current subscription period
   */
  get currentPeriodEnd(): string {
    return this.data.current_period_end;
  }

  /**
   * Current status of the subscription
   */
  get status(): SubscriptionStatus {
    return this.data.status;
  }

  /**
   * When the subscription was canceled (null if not canceled)
   */
  get canceledAt(): string | null {
    return this.data.canceled_at;
  }

  /**
   * ISO3166-1 alpha-2 country code of the payment source
   */
  get country(): string | null {
    return this.data.country || null;
  }

  /**
   * Checks if the subscription is active
   */
  isActive(): boolean {
    return this.status === SubscriptionStatus.Active;
  }

  /**
   * Checks if the subscription is ending (active but will not renew)
   */
  isEnding(): boolean {
    return this.status === SubscriptionStatus.Ending;
  }

  /**
   * Checks if the subscription is inactive
   */
  isInactive(): boolean {
    return this.status === SubscriptionStatus.Inactive;
  }

  /**
   * Checks if the subscription is currently in its valid period
   */
  isCurrentlyValid(): boolean {
    const now = new Date().toISOString();

    if (this.status === SubscriptionStatus.Inactive) {
      return false;
    }

    if (this.currentPeriodStart && this.currentPeriodStart > now) {
      return false;
    }

    if (this.currentPeriodEnd && this.currentPeriodEnd < now) {
      return false;
    }

    return true;
  }

  /**
   * Gets the duration of the current subscription period in milliseconds
   */
  getCurrentPeriodDuration(): number {
    const start = new Date(this.currentPeriodStart).getTime();
    const end = new Date(this.currentPeriodEnd).getTime();
    return end - start;
  }

  /**
   * Gets the remaining time in the current subscription period in milliseconds
   * Returns 0 if the period has ended
   */
  getRemainingTime(): number {
    const now = Date.now();
    const end = new Date(this.currentPeriodEnd).getTime();

    return Math.max(0, end - now);
  }

  /**
   * Returns true if the subscription has multiple SKUs
   */
  hasMultipleSkus(): boolean {
    return this.skuIds.length > 1;
  }

  /**
   * Gets the percentage of the subscription period that has elapsed
   * @returns A number between 0 and 100
   */
  getElapsedPercentage(): number {
    const now = Date.now();
    const start = new Date(this.currentPeriodStart).getTime();
    const end = new Date(this.currentPeriodEnd).getTime();
    const totalDuration = end - start;

    if (totalDuration <= 0) {
      return 100;
    }

    const elapsed = now - start;
    const percentage = Math.min(
      100,
      Math.max(0, (elapsed / totalDuration) * 100),
    );

    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
  }
}
