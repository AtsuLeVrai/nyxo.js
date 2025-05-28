import {
  type EntitlementEntity,
  EntitlementType,
  type Snowflake,
} from "@nyxojs/core";
import { EntitlementOwnerType } from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";

/**
 * Represents a Discord entitlement, providing access to premium features.
 *
 * Entitlements in Discord represent that a user or guild has access to a premium
 * offering in your application. Each entitlement is associated with a specific SKU
 * (Stock Keeping Unit) that you define in the Developer Portal.
 *
 * This class provides methods to:
 * - Access entitlement details like ID, type, and ownership
 * - Check validity and expiration status
 * - Consume one-time entitlements
 * - Create and manage test entitlements for development
 *
 * @see {@link https://discord.com/developers/docs/resources/entitlement}
 */
@Cacheable("entitlements")
export class Entitlement
  extends BaseClass<EntitlementEntity>
  implements Enforce<PropsToCamel<EntitlementEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this entitlement.
   *
   * This ID is permanent and will not change for the lifetime of the entitlement.
   * It can be used for API operations and referencing entitlements in your application.
   *
   * @returns The entitlement's ID as a Snowflake string
   */
  readonly id = this.rawData.id;

  /**
   * Gets the SKU ID that this entitlement grants access to.
   *
   * The SKU (Stock Keeping Unit) represents a specific premium offering in your application.
   * SKUs are defined in your application's Developer Portal.
   *
   * @returns The SKU's ID as a Snowflake string
   */
  readonly skuId = this.rawData.sku_id;

  /**
   * Gets the ID of the application this entitlement belongs to.
   *
   * This identifies which application in your organization this entitlement is for.
   *
   * @returns The application's ID as a Snowflake string
   */
  readonly applicationId = this.rawData.application_id;

  /**
   * Gets the ID of the user that is granted access to the entitlement's SKU.
   *
   * For user-based entitlements, this identifies which user has access.
   * Will be undefined for guild-based entitlements.
   *
   * @returns The user's ID as a Snowflake string, or undefined if guild-based
   */
  readonly userId = this.rawData.user_id;

  /**
   * Gets the type of this entitlement.
   *
   * The type indicates how this entitlement was acquired (purchase, gift, subscription, etc.).
   *
   * @returns The entitlement type as an EntitlementType enum value
   * @see {@link https://discord.com/developers/docs/resources/entitlement#entitlement-object-entitlement-types}
   */
  readonly type = this.rawData.type;

  /**
   * Checks if this entitlement has been deleted.
   *
   * Deleted entitlements are typically excluded from queries by default.
   *
   * @returns True if the entitlement has been deleted, false otherwise
   */
  readonly deleted = Boolean(this.rawData.deleted);

  /**
   * Gets the start date of this entitlement's validity period.
   *
   * For time-limited entitlements, this indicates when the entitlement becomes active.
   * Will be null for perpetual entitlements.
   *
   * @returns The start date as an ISO string, or null if perpetual
   */
  readonly startsAt = this.rawData.starts_at;

  /**
   * Gets the end date of this entitlement's validity period.
   *
   * For time-limited entitlements, this indicates when the entitlement expires.
   * Will be null for perpetual entitlements.
   *
   * @returns The end date as an ISO string, or null if perpetual
   */
  get endsAt(): string | null {
    return this.rawData.ends_at;
  }

  /**
   * Gets the ID of the guild that is granted access to the entitlement's SKU.
   *
   * For guild-based entitlements, this identifies which guild has access.
   * Will be undefined for user-based entitlements.
   *
   * @returns The guild's ID as a Snowflake string, or undefined if user-based
   */
  get guildId(): Snowflake | undefined {
    return this.rawData.guild_id;
  }

  /**
   * Checks if this entitlement has been consumed.
   *
   * For consumable entitlements, this indicates whether it has been used.
   * Once a consumable entitlement is consumed, it is considered used.
   *
   * @returns True if the entitlement has been consumed, false otherwise
   */
  get consumed(): boolean {
    return Boolean(this.rawData.consumed);
  }

  /**
   * Gets the Date object for when this entitlement becomes active.
   *
   * For time-limited entitlements, this converts the ISO string to a Date object.
   *
   * @returns The Date when this entitlement becomes active, or null if perpetual
   */
  get startDate(): Date | null {
    return this.startsAt ? new Date(this.startsAt) : null;
  }

  /**
   * Gets the Date object for when this entitlement expires.
   *
   * For time-limited entitlements, this converts the ISO string to a Date object.
   *
   * @returns The Date when this entitlement expires, or null if perpetual
   */
  get endDate(): Date | null {
    return this.endsAt ? new Date(this.endsAt) : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this entitlement becomes active.
   *
   * @returns The start timestamp in milliseconds, or null if perpetual
   */
  get startTimestamp(): number | null {
    return this.startDate ? this.startDate.getTime() : null;
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this entitlement expires.
   *
   * @returns The end timestamp in milliseconds, or null if perpetual
   */
  get endTimestamp(): number | null {
    return this.endDate ? this.endDate.getTime() : null;
  }

  /**
   * Checks if this is a perpetual entitlement with no end date.
   *
   * @returns True if the entitlement is perpetual, false if time-limited
   */
  get isPerpetual(): boolean {
    return this.endsAt === null;
  }

  /**
   * Checks if this is a time-limited entitlement.
   *
   * @returns True if the entitlement is time-limited, false if perpetual
   */
  get isTimeLimited(): boolean {
    return !this.isPerpetual;
  }

  /**
   * Checks if this entitlement is currently active based on the current time.
   *
   * A time-limited entitlement is active if:
   * - The current time is after the start date (if specified)
   * - The current time is before the end date (if specified)
   * - The entitlement has not been deleted
   * - The entitlement has not been consumed (for consumable entitlements)
   *
   * A perpetual entitlement is always active unless it's deleted or consumed.
   *
   * @returns True if the entitlement is currently active, false otherwise
   */
  get isActive(): boolean {
    const now = Date.now();

    // Check if deleted or consumed
    if (this.deleted || this.consumed) {
      return false;
    }

    // Check start date if specified
    if (this.startTimestamp && now < this.startTimestamp) {
      return false;
    }

    // Check end date if specified
    if (this.endTimestamp && now >= this.endTimestamp) {
      return false;
    }

    return true;
  }

  /**
   * Checks if this entitlement has expired based on the end date.
   *
   * @returns True if the entitlement has an end date and it has passed, false otherwise
   */
  get isExpired(): boolean {
    if (!this.endTimestamp) {
      return false;
    }

    return Date.now() >= this.endTimestamp;
  }

  /**
   * Checks if this entitlement is for a guild (server).
   *
   * @returns True if the entitlement is for a guild, false if for a user
   */
  get isGuildEntitlement(): boolean {
    return Boolean(this.guildId);
  }

  /**
   * Checks if this entitlement is for a user.
   *
   * @returns True if the entitlement is for a user, false if for a guild
   */
  get isUserEntitlement(): boolean {
    return Boolean(this.userId);
  }

  /**
   * Gets the owner ID of this entitlement (either user ID or guild ID).
   *
   * @returns The owner's ID, or undefined if not available
   */
  get ownerId(): Snowflake | undefined {
    return this.userId || this.guildId;
  }

  /**
   * Gets the owner type of this entitlement.
   *
   * @returns The owner type (1 for Guild, 2 for User), or undefined if not available
   */
  get ownerType(): EntitlementOwnerType | undefined {
    if (this.isGuildEntitlement) {
      return EntitlementOwnerType.Guild;
    }

    if (this.isUserEntitlement) {
      return EntitlementOwnerType.User;
    }

    return undefined;
  }

  /**
   * Gets the time remaining (in milliseconds) until this entitlement expires.
   *
   * @returns The time remaining in milliseconds, or Infinity for perpetual entitlements
   */
  get timeRemaining(): number {
    if (!this.endTimestamp) {
      return Number.POSITIVE_INFINITY;
    }

    const remaining = this.endTimestamp - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Gets the duration (in milliseconds) of this entitlement.
   *
   * @returns The duration in milliseconds, or Infinity for perpetual entitlements
   */
  get duration(): number {
    if (!(this.startTimestamp && this.endTimestamp)) {
      return Number.POSITIVE_INFINITY;
    }

    return this.endTimestamp - this.startTimestamp;
  }

  /**
   * Checks if this entitlement is a premium subscription.
   *
   * @returns True if the entitlement is a premium subscription, false otherwise
   */
  get isPremiumSubscription(): boolean {
    return this.type === EntitlementType.PremiumSubscription;
  }

  /**
   * Checks if this entitlement is an application subscription.
   *
   * @returns True if the entitlement is an application subscription, false otherwise
   */
  get isApplicationSubscription(): boolean {
    return this.type === EntitlementType.ApplicationSubscription;
  }

  /**
   * Checks if this entitlement is a one-time purchase.
   *
   * @returns True if the entitlement is a purchase, false otherwise
   */
  get isPurchase(): boolean {
    return this.type === EntitlementType.Purchase;
  }

  /**
   * Checks if this entitlement is a test entitlement.
   *
   * @returns True if the entitlement is a test purchase, false otherwise
   */
  get isTestEntitlement(): boolean {
    return this.type === EntitlementType.TestModePurchase;
  }

  /**
   * Checks if this entitlement can be consumed.
   *
   * An entitlement can be consumed if:
   * - It is currently active
   * - It has not been consumed yet
   * - It is not deleted
   *
   * @returns True if the entitlement can be consumed, false otherwise
   */
  get isConsumable(): boolean {
    return this.isActive && !this.consumed && !this.deleted;
  }

  /**
   * Consumes this entitlement, marking it as used.
   *
   * This is used for one-time purchase consumable entitlements.
   * Once consumed, the entitlement is considered used and can't be reused.
   *
   * @returns A promise that resolves when the entitlement is consumed
   * @throws Error if the entitlement cannot be consumed or the API request fails
   */
  async consume(): Promise<void> {
    if (!this.isConsumable) {
      throw new Error("This entitlement cannot be consumed");
    }

    await this.client.rest.entitlements.consumeEntitlement(
      this.applicationId,
      this.id,
    );

    // Update the local data to reflect consumption
    this.patch({ consumed: true });
  }

  /**
   * Fetches this entitlement from the API to get the most current data.
   *
   * This is useful when you need to ensure you have the latest version of the entitlement.
   *
   * @returns A promise resolving to the refreshed entitlement
   * @throws Error if the entitlement could not be fetched
   */
  async fetch(): Promise<Entitlement> {
    const entitlementData =
      await this.client.rest.entitlements.fetchEntitlement(
        this.applicationId,
        this.id,
      );

    // Update the existing instance with fresh data
    this.patch(entitlementData);

    return this;
  }

  /**
   * Deletes this test entitlement.
   *
   * This method can only be used for test entitlements created during development.
   * Attempting to delete a real entitlement will fail.
   *
   * @returns A promise resolving to true if the entitlement was deleted successfully
   * @throws Error if the entitlement is not a test entitlement or the API request fails
   */
  async deleteTestEntitlement(): Promise<boolean> {
    if (!this.isTestEntitlement) {
      throw new Error("Only test entitlements can be deleted with this method");
    }

    await this.client.rest.entitlements.deleteTestEntitlement(
      this.applicationId,
      this.id,
    );

    // Update the local data to reflect deletion
    this.patch({ deleted: true });
    return true;
  }
}
