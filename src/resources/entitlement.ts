export enum EntitlementTypes {
  Purchase = 1,
  PremiumSubscription = 2,
  DeveloperGift = 3,
  TestModePurchase = 4,
  FreePurchase = 5,
  UserGift = 6,
  PremiumPurchase = 7,
  ApplicationSubscription = 8,
}

export enum EntitlementOwnerTypes {
  Guild = 1,
  User = 2,
}

export interface EntitlementObject {
  id: string;
  sku_id: string;
  application_id: string;
  user_id?: string;
  type: EntitlementTypes;
  deleted: boolean;
  starts_at: string | null;
  ends_at: string | null;
  guild_id?: string;
  consumed?: boolean;
}

export interface ListEntitlementsQueryStringParams
  extends Pick<EntitlementObject, "user_id" | "guild_id"> {
  sku_ids?: string;
  before?: string;
  after?: string;
  limit?: number;
  exclude_ended?: boolean;
  exclude_deleted?: boolean;
}

export interface CreateTestEntitlementJSONParams extends Pick<EntitlementObject, "sku_id"> {
  owner_id: string;
  owner_type: EntitlementOwnerTypes;
}

/**
 * Checks if an entitlement is currently active
 * @param entitlement The entitlement to check
 * @returns true if the entitlement is active
 */
export function isEntitlementActive(entitlement: EntitlementObject): boolean {
  if (entitlement.deleted) return false;

  const now = new Date();
  const startDate = entitlement.starts_at ? new Date(entitlement.starts_at) : null;
  const endDate = entitlement.ends_at ? new Date(entitlement.ends_at) : null;

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;

  return true;
}

/**
 * Checks if an entitlement is expired
 * @param entitlement The entitlement to check
 * @returns true if the entitlement has expired
 */
export function isEntitlementExpired(entitlement: EntitlementObject): boolean {
  if (!entitlement.ends_at) return false;
  return new Date() > new Date(entitlement.ends_at);
}

/**
 * Checks if an entitlement is for a guild
 * @param entitlement The entitlement to check
 * @returns true if the entitlement is for a guild
 */
export function isGuildEntitlement(entitlement: EntitlementObject): boolean {
  return entitlement.guild_id !== undefined;
}

/**
 * Checks if an entitlement is for a user
 * @param entitlement The entitlement to check
 * @returns true if the entitlement is for a user
 */
export function isUserEntitlement(entitlement: EntitlementObject): boolean {
  return entitlement.user_id !== undefined;
}

/**
 * Checks if an entitlement is consumable and has been consumed
 * @param entitlement The entitlement to check
 * @returns true if the entitlement has been consumed
 */
export function isEntitlementConsumed(entitlement: EntitlementObject): boolean {
  return entitlement.consumed === true;
}

/**
 * Checks if an entitlement is a test entitlement
 * @param entitlement The entitlement to check
 * @returns true if it's a test mode purchase
 */
export function isTestEntitlement(entitlement: EntitlementObject): boolean {
  return entitlement.type === EntitlementTypes.TestModePurchase;
}

/**
 * Checks if an entitlement is a subscription
 * @param entitlement The entitlement to check
 * @returns true if it's a subscription-type entitlement
 */
export function isSubscriptionEntitlement(entitlement: EntitlementObject): boolean {
  return (
    entitlement.type === EntitlementTypes.PremiumSubscription ||
    entitlement.type === EntitlementTypes.ApplicationSubscription
  );
}

/**
 * Gets the remaining time for an entitlement in milliseconds
 * @param entitlement The entitlement to check
 * @returns milliseconds remaining, or null if no end date
 */
export function getEntitlementRemainingTime(entitlement: EntitlementObject): number | null {
  if (!entitlement.ends_at) return null;

  const endDate = new Date(entitlement.ends_at);
  const now = new Date();

  return Math.max(0, endDate.getTime() - now.getTime());
}
