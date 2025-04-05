import {
  type EntitlementEntity,
  EntitlementType,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a Discord entitlement.
 * Entitlements represent a purchase of a premium offering.
 *
 * @see {@link https://discord.com/developers/docs/monetization/entitlements}
 */
export class Entitlement extends BaseClass<EntitlementEntity> {
  /**
   * The ID of this entitlement
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The ID of the SKU
   */
  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  /**
   * The ID of the parent application
   */
  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  /**
   * The ID of the user that is granted access to the entitlement's sku
   */
  get userId(): Snowflake | null {
    return this.data.user_id || null;
  }

  /**
   * The type of entitlement
   */
  get type(): EntitlementType {
    return this.data.type;
  }

  /**
   * Whether the entitlement was deleted
   */
  get deleted(): boolean {
    return Boolean(this.data.deleted);
  }

  /**
   * Start date at which the entitlement is valid (ISO8601 timestamp)
   */
  get startsAt(): string | null {
    return this.data.starts_at;
  }

  /**
   * Date at which the entitlement is no longer valid (ISO8601 timestamp)
   */
  get endsAt(): string | null {
    return this.data.ends_at;
  }

  /**
   * ID of the guild that is granted access to the entitlement's sku
   */
  get guildId(): Snowflake | null {
    return this.data.guild_id || null;
  }

  /**
   * For consumable entitlements, whether or not the entitlement has been consumed
   */
  get consumed(): boolean {
    return Boolean(this.data.consumed);
  }

  /**
   * ID of the promotion that granted the entitlement
   */
  get promotionId(): Snowflake | null {
    return this.data.promotion_id || null;
  }

  /**
   * ID of the subscription that granted the entitlement
   */
  get subscriptionId(): Snowflake | null {
    return this.data.subscription_id || null;
  }

  /**
   * Checks if the entitlement was purchased by a user
   */
  isPurchase(): boolean {
    return this.type === EntitlementType.Purchase;
  }

  /**
   * Checks if the entitlement is from a Discord Nitro subscription
   */
  isPremiumSubscription(): boolean {
    return this.type === EntitlementType.PremiumSubscription;
  }

  /**
   * Checks if the entitlement was gifted by a developer
   */
  isDeveloperGift(): boolean {
    return this.type === EntitlementType.DeveloperGift;
  }

  /**
   * Checks if the entitlement was purchased by a dev in test mode
   */
  isTestModePurchase(): boolean {
    return this.type === EntitlementType.TestModePurchase;
  }

  /**
   * Checks if the entitlement was granted when the SKU was free
   */
  isFreePurchase(): boolean {
    return this.type === EntitlementType.FreePurchase;
  }

  /**
   * Checks if the entitlement was gifted by another user
   */
  isUserGift(): boolean {
    return this.type === EntitlementType.UserGift;
  }

  /**
   * Checks if the entitlement was claimed by user as a Nitro subscriber
   */
  isPremiumPurchase(): boolean {
    return this.type === EntitlementType.PremiumPurchase;
  }

  /**
   * Checks if the entitlement was purchased as an app subscription
   */
  isApplicationSubscription(): boolean {
    return this.type === EntitlementType.ApplicationSubscription;
  }

  /**
   * Checks if this entitlement is active (not deleted and within the valid time period)
   */
  isActive(): boolean {
    if (this.deleted || this.consumed) {
      return false;
    }

    const now = new Date().toISOString();

    if (this.startsAt && this.startsAt > now) {
      return false;
    }

    if (this.endsAt && this.endsAt < now) {
      return false;
    }

    return true;
  }
}
